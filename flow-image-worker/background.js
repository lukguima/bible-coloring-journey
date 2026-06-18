/**
 * background.js — Flow Image Worker Service Worker
 *
 * Este service worker é o cérebro da extensão. Ele:
 * 1. Mantém estado persistente entre sessões via chrome.storage.local
 * 2. Faz polling no Content Studio para buscar jobs de geração de imagem
 * 3. Envia prompts para o content script executar no Google Flow
 * 4. Recebe resultados e faz upload de volta ao Content Studio
 * 5. Envia heartbeat periódico via chrome.alarms para manter a sessão viva
 */

// ─────────────────────────────────────────────
// ESTADO GLOBAL DO WORKER
// ─────────────────────────────────────────────

/**
 * Estado em memória do worker. Sincronizado com chrome.storage.local.
 * @type {{
 *   sessionId: string|null,
 *   batchId: string|null,
 *   status: 'idle'|'running'|'paused'|'stopped',
 *   currentJobId: string|null,
 *   progress: { completed: number, total: number, failed: number },
 *   logs: Array<{time: string, level: string, message: string}>,
 *   lastHeartbeat: number|null
 * }}
 */
let workerState = {
  sessionId: null,
  batchId: null,
  status: 'idle',
  currentJobId: null,
  progress: { completed: 0, total: 0, failed: 0 },
  logs: [],
  lastHeartbeat: null
};

// Flag para controlar o loop principal de processamento
let isProcessing = false;

// Quando o CS na galeria avisa que vai navegar para um projeto,
// armazena os dados do job para re-enviar ao novo CS após a navegação.
let galleryNavigation = null; // { tabId, prompt, timeoutMs, orientation, startedAt }

// Sinaliza que o CS sobreviveu à SPA nav e está gerando diretamente (Branch 1 não precisa re-enviar).
let cancelGalleryNavigation = false;

// Rastreamento independente da aba e job ativos (fallback que não depende de mensagem do CS).
// Setado antes de cada sendPromptToTab; limpo quando o job termina.
let activeFlowTabId = null;
let activeFlowJobData = null; // { prompt, orientation, timeoutMs, startedAt, lastUrl }

// ─────────────────────────────────────────────
// PERSISTÊNCIA DE ESTADO
// ─────────────────────────────────────────────

/**
 * Salva o estado atual no storage local para sobreviver a reinicializações do service worker.
 */
async function saveState() {
  await chrome.storage.local.set({ workerState });
}

/**
 * Carrega o estado salvo do storage local ao iniciar.
 */
async function loadState() {
  const result = await chrome.storage.local.get('workerState');
  if (result.workerState) {
    // Restaura o estado, mas sempre começa como 'stopped' se estava 'running'
    // (o service worker pode ter sido reiniciado inesperadamente)
    workerState = result.workerState;
    if (workerState.status === 'running') {
      workerState.status = 'stopped';
      addLog('warning', 'Worker reiniciado — sessão anterior encerrada. Clique em Start para continuar.');
    }
    await saveState();
  }
}

// ─────────────────────────────────────────────
// SISTEMA DE LOGS
// ─────────────────────────────────────────────

/**
 * Adiciona uma entrada ao log interno (máximo de 100 entradas).
 * @param {'info'|'success'|'warning'|'error'} level
 * @param {string} message
 */
function addLog(level, message) {
  const entry = {
    time: new Date().toLocaleTimeString('pt-BR'),
    level,
    message
  };
  workerState.logs.unshift(entry); // mais recentes primeiro
  if (workerState.logs.length > 100) {
    workerState.logs = workerState.logs.slice(0, 100);
  }
  console.log(`[FlowWorker][${level.toUpperCase()}] ${message}`);
  // Persiste imediatamente para o popup ver o log em tempo real
  chrome.storage.local.set({ workerState }).catch(() => {});
}

// ─────────────────────────────────────────────
// LEITURA DE CONFIGURAÇÃO
// ─────────────────────────────────────────────

/**
 * Lê as configurações salvas pelo usuário no popup.
 * @returns {Promise<{
 *   studioUrl: string,
 *   token: string,
 *   minDelay: number,
 *   maxDelay: number,
 *   maxAttempts: number,
 *   safeRewriteEnabled: boolean,
 *   filePrefix: string
 * }>}
 */
async function getConfig() {
  const defaults = {
    studioUrl: 'http://localhost:3001',
    token: '',
    minDelay: 3000,
    maxDelay: 8000,
    maxAttempts: 3,
    safeRewriteEnabled: true,
    filePrefix: 'flow'
  };
  const result = await chrome.storage.local.get('config');
  return { ...defaults, ...(result.config || {}) };
}

// ─────────────────────────────────────────────
// CHAMADAS À API DO CONTENT STUDIO
// ─────────────────────────────────────────────

/**
 * Helper para fazer requisições autenticadas ao Content Studio.
 * @param {string} url URL completa
 * @param {RequestInit} options Opções do fetch
 * @returns {Promise<Response>}
 */
async function studioFetch(url, options = {}) {
  const config = await getConfig();
  const headers = {
    'Authorization': `Bearer ${config.token}`,
    ...options.headers
  };
  return fetch(url, { ...options, headers });
}

/**
 * Busca o próximo job disponível no Content Studio.
 * @returns {Promise<{id: string, prompt: string, jobIndex: number, totalJobs: number, batchId: string}|null>}
 */
async function fetchNextJob() {
  const config = await getConfig();
  const sessionId = workerState.sessionId || 'default';

  try {
    const response = await studioFetch(
      `${config.studioUrl}/api/flow-worker/next-job?sessionId=${encodeURIComponent(sessionId)}`
    );

    if (response.status === 204 || response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();

    // API returns { job: {...}, progress: {...} } envelope
    // job: null can mean no_active_batch or batch_complete
    if (!data.job) return { done: false, reason: data.reason || 'no_job', batchId: data.batchId };

    // Flatten into the shape processNextJob expects
    return {
      ...data.job,
      totalJobs: data.progress?.total ?? 0,
      jobIndex: (data.progress?.done ?? 0) + 1,
      done: false,
    };
  } catch (error) {
    addLog('error', `Erro ao buscar job: ${error.message}`);
    throw error;
  }
}

/**
 * Atualiza o status de um job no Content Studio.
 * @param {string} jobId
 * @param {'processing'|'completed'|'failed'|'blocked'} status
 * @param {object} [extra] Dados adicionais opcionais
 */
async function updateJobStatus(jobId, status, extra = {}) {
  const config = await getConfig();

  try {
    const response = await studioFetch(
      `${config.studioUrl}/api/flow-worker/job/${encodeURIComponent(jobId)}/status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, sessionId: workerState.sessionId, ...extra })
      }
    );

    if (!response.ok) {
      console.warn(`[FlowWorker] updateJobStatus falhou: HTTP ${response.status}`);
    }
  } catch (error) {
    // Não lança — falha no status update não deve interromper o fluxo principal
    console.warn(`[FlowWorker] updateJobStatus erro: ${error.message}`);
  }
}

/**
 * Envia o resultado (imagem gerada) para o Content Studio via multipart/form-data.
 * @param {string} jobId
 * @param {Blob} imageBlob
 * @param {string} filename
 */
async function submitResult(jobId, imageBlob, filename) {
  const config = await getConfig();

  const formData = new FormData();
  formData.append('image', imageBlob, filename);
  formData.append('sessionId', workerState.sessionId || 'default');
  formData.append('completedAt', new Date().toISOString());

  const response = await studioFetch(
    `${config.studioUrl}/api/flow-worker/job/${encodeURIComponent(jobId)}/result`,
    {
      method: 'POST',
      body: formData
      // NÃO definir Content-Type — o browser precisa definir automaticamente com o boundary
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`submitResult falhou: HTTP ${response.status} — ${text}`);
  }

  return await response.json();
}

/**
 * Reporta um erro de job ao Content Studio.
 * @param {string} jobId
 * @param {'timeout'|'policy_blocked'|'dom_error'|'network_error'|'unknown'} errorType
 * @param {string} errorMessage
 */
async function submitError(jobId, errorType, errorMessage) {
  const config = await getConfig();

  try {
    const response = await studioFetch(
      `${config.studioUrl}/api/flow-worker/job/${encodeURIComponent(jobId)}/error`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType,
          errorMessage,
          sessionId: workerState.sessionId,
          timestamp: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      console.warn(`[FlowWorker] submitError falhou: HTTP ${response.status}`);
    }
  } catch (error) {
    console.warn(`[FlowWorker] submitError erro de rede: ${error.message}`);
  }
}

/**
 * Solicita um rewrite "seguro" do prompt ao Content Studio (quando bloqueado por política).
 * @param {string} jobId
 * @returns {Promise<{rewrittenPrompt: string}|null>}
 */
async function requestSafeRewrite(jobId) {
  const config = await getConfig();

  try {
    const response = await studioFetch(
      `${config.studioUrl}/api/flow-worker/job/${encodeURIComponent(jobId)}/request-safe-rewrite`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: workerState.sessionId })
      }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    addLog('warning', `requestSafeRewrite falhou: ${error.message}`);
    return null;
  }
}

/**
 * Envia heartbeat para manter a sessão viva no Content Studio.
 */
async function sendHeartbeat() {
  const config = await getConfig();

  if (!config.studioUrl || !config.token || workerState.status !== 'running') return;

  try {
    const response = await studioFetch(
      `${config.studioUrl}/api/flow-worker/session/heartbeat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: workerState.sessionId,
          status: workerState.status,
          progress: workerState.progress,
          currentJobId: workerState.currentJobId,
          timestamp: new Date().toISOString()
        })
      }
    );

    if (response.ok) {
      workerState.lastHeartbeat = Date.now();
    }
  } catch (error) {
    // Heartbeat silencioso — não interrompe o fluxo
    console.warn(`[FlowWorker] Heartbeat falhou: ${error.message}`);
  }
}

// ─────────────────────────────────────────────
// COMUNICAÇÃO COM CONTENT SCRIPT
// ─────────────────────────────────────────────

const IMAGEFX_URL = 'https://labs.google/fx/tools/image-fx';

// Padrões de URL válidos para o Google Flow / ImageFX
const FLOW_URL_PATTERNS = [
  'https://labs.google/fx/tools/flow*',
  'https://labs.google/fx/tools/image-fx*',
  'https://labs.google/fx/*/tools/flow*',
  'https://labs.google/fx/*/tools/image-fx*',
  'https://labs.google.com/fx/tools/flow*',
  'https://labs.google.com/fx/tools/image-fx*',
  'https://labs.google.com/fx/*/tools/flow*',
  'https://aitestkitchen.withgoogle.com/tools/image-fx*',
];

/**
 * Verifica se uma URL é uma URL válida do Flow/ImageFX (não redirecionamento).
 * @param {string} url
 * @returns {boolean}
 */
function isFlowUrl(url) {
  if (!url) return false;
  return (
    url.includes('labs.google.com') ||
    url.includes('labs.google/') ||
    url.includes('aitestkitchen.withgoogle.com')
  );
}

/**
 * Aguarda a aba carregar em uma URL válida do Flow (não login/redirect).
 * @param {number} tabId
 * @param {number} timeoutMs
 * @returns {Promise<void>}
 */
async function waitForFlowUrl(tabId, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab) throw new Error('Aba fechada inesperadamente');
    if (tab.status === 'complete' && isFlowUrl(tab.url)) return;
    if (tab.status === 'complete' && tab.url && !isFlowUrl(tab.url)) {
      // Redirecionou para fora (login, etc.) — navega de volta ao Flow
      addLog('warning', `Aba redirecionada para ${tab.url} — navegando de volta ao Flow...`);
      await chrome.tabs.update(tabId, { url: IMAGEFX_URL });
      await delay(2000);
    }
    await delay(500);
  }
  throw new Error('Timeout aguardando o Google Flow carregar');
}

/**
 * Encontra a aba do ImageFX (gerador de imagens).
 * Prioriza abas com a URL específica do ImageFX.
 * Se não encontrar, abre uma nova aba automaticamente.
 * @returns {Promise<chrome.tabs.Tab|null>}
 */
async function findFlowTab() {
  // Procura aba existente com qualquer variante da URL do Flow
  const flowTabs = await chrome.tabs.query({ url: FLOW_URL_PATTERNS });
  if (flowTabs.length > 0) {
    const tab = flowTabs[0];
    // Verifica se a aba está de fato em uma URL válida (pode estar em loading)
    if (tab.status !== 'complete') {
      await waitForFlowUrl(tab.id, 15000).catch(() => null);
    }
    return chrome.tabs.get(tab.id).catch(() => null);
  }

  // Não encontrou — abre nova aba
  addLog('info', 'Aba do Flow não encontrada. Abrindo nova aba...');
  const newTab = await chrome.tabs.create({ url: IMAGEFX_URL, active: false });

  // Aguarda carregar em URL válida (com proteção contra redirects de login)
  try {
    await waitForFlowUrl(newTab.id, 25000);
  } catch (err) {
    addLog('error', `Falha ao carregar o Flow: ${err.message}`);
    return null;
  }

  await delay(2000); // aguarda React montar componentes
  return chrome.tabs.get(newTab.id).catch(() => null);
}

/**
 * Verifica se o content script está ativo e respondendo na aba.
 * @param {number} tabId
 * @returns {Promise<boolean>}
 */
async function pingContentScript(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return response?.status === 'PONG';
  } catch {
    return false;
  }
}

/**
 * Injeta o content script caso ainda não esteja ativo.
 * Verifica a URL da aba antes de tentar injetar para evitar erros de permissão.
 * @param {number} tabId
 */
async function ensureContentScript(tabId) {
  // Verifica se o content script já está ativo
  const alive = await pingContentScript(tabId);
  if (alive) return;

  // Confirma que a aba está em uma URL do Flow antes de injetar
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab) throw new Error('Aba não encontrada');

  if (!isFlowUrl(tab.url)) {
    throw new Error(
      `Aba está em ${tab.url} (esperado labs.google ou aitestkitchen.withgoogle.com). ` +
      `Abra manualmente: ${IMAGEFX_URL}`
    );
  }

  if (tab.status !== 'complete') {
    // Aguarda carregar antes de injetar
    await waitForFlowUrl(tabId, 10000);
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  });
  await delay(500);
}

/**
 * Envia um prompt para o content script executar no Google Flow.
 * Usa polling via chrome.storage.local em vez de Promises em memória:
 * cada storage.get() reseta o idle timer do SW (30s), evitando que ele
 * seja terminado enquanto aguarda o resultado da geração.
 * @param {number} tabId
 * @param {string} prompt
 * @param {number} timeoutMs Timeout máximo para aguardar a geração
 * @param {'LANDSCAPE'|'PORTRAIT'} orientation Orientação/tamanho da imagem
 * @returns {Promise<{status: string, imageUrl?: string, blobDataUrl?: string}>}
 */
async function sendPromptToTab(tabId, prompt, timeoutMs = 60000, orientation = 'LANDSCAPE') {
  // Limpa resultados anteriores e sinaliza geração ativa (persiste ao SW reiniciar)
  await chrome.storage.local.remove(['flow_cs_result', 'flow_cs_log', 'flow_cs_abort']);
  await chrome.storage.local.set({
    flow_generation_active: { tabId, prompt, orientation, startedAt: Date.now(), timeoutMs }
  });

  // Envia SEND_PROMPT ao CS — tenta até 4x com 2s de intervalo (CS pode ainda estar inicializando)
  const promptBytes = prompt?.length ?? 0;
  addLog('info', `Enviando SEND_PROMPT tab=${tabId} prompt=[${promptBytes}chars] "${(prompt||'').substring(0,50)}${promptBytes>50?'...':''}"`);
  if (!prompt || !prompt.trim()) {
    addLog('error', 'ABORT: prompt vazio passado para sendPromptToTab — bug no chamador!');
    await chrome.storage.local.remove('flow_generation_active');
    throw new Error('Prompt vazio passado para sendPromptToTab');
  }
  let sendErr = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'SEND_PROMPT', prompt, timeoutMs, orientation });
      addLog('info', `SEND_PROMPT entregue ao content script (tentativa ${attempt}).`);
      sendErr = null;
      break;
    } catch (e) {
      sendErr = e;
      addLog('warning', `sendMessage falhou (tentativa ${attempt}/4): ${e.message}`);
      if (attempt < 4) {
        await new Promise(r => setTimeout(r, 2000));
        // Tenta reinjetar o CS caso não esteja presente
        try { await ensureContentScript(tabId); } catch (_) {}
      }
    }
  }
  if (sendErr) {
    addLog('error', `sendMessage falhou após 4 tentativas: ${sendErr.message}`);
    await chrome.storage.local.remove('flow_generation_active');
    throw new Error(`Falha ao enviar mensagem ao content script: ${sendErr.message}`);
  }

  // Loop de polling — cada storage.get() mantém o SW vivo (reseta idle timer de 30s)
  // Enquanto este loop roda, o SW nunca fica inativo tempo suficiente para ser terminado
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s entre polls
    const data = await chrome.storage.local.get('flow_cs_result'); // reseta idle timer

    if (!data.flow_cs_result) continue;

    const r = data.flow_cs_result;
    await chrome.storage.local.remove(['flow_cs_result', 'flow_generation_active']);

    switch (r.type) {
      case 'complete':
        return { status: 'success', imageUrl: r.imageUrl, blobDataUrl: r.blobDataUrl };
      case 'failed':
        return { status: 'error', error: r.reason };
      case 'blocked':
        return { status: 'policy_blocked' };
      default:
        return { status: 'error', error: `Tipo desconhecido: ${r.type}` };
    }
  }

  await chrome.storage.local.remove('flow_generation_active');
  throw new Error(`Timeout de ${Math.round(timeoutMs / 1000)}s aguardando geração`);
}

// ─────────────────────────────────────────────
// LOOP PRINCIPAL DE PROCESSAMENTO
// ─────────────────────────────────────────────

/**
 * Gera um delay aleatório entre minDelay e maxDelay.
 * @param {number} minMs
 * @param {number} maxMs
 * @returns {Promise<void>}
 */
function delay(minMs, maxMs) {
  const ms = maxMs ? Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs : minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Processa o próximo job disponível.
 * Fluxo: fetchNextJob → enviar prompt → aguardar geração → baixar imagem → upload resultado
 */
async function processNextJob() {
  if (workerState.status !== 'running') {
    isProcessing = false;
    return;
  }

  const config = await getConfig();

  let job = null;
  try {
    job = await fetchNextJob();
  } catch (error) {
    addLog('error', `Erro ao buscar próximo job: ${error.message}`);
    await delay(10000); // Aguarda 10s antes de tentar novamente após erro de rede
    scheduleNextProcess();
    return;
  }

  // Sem job real (batch completo ou sem batch ativo)
  if (!job || !job.id) {
    if (job?.reason === 'batch_complete' && job?.batchId) {
      // Todos os jobs foram processados — finaliza o batch
      addLog('success', `Batch ${job.batchId} completo! Finalizando...`);
      try {
        const config = await getConfig();
        await studioFetch(`${config.studioUrl}/api/flow-worker/batch/${job.batchId}/complete`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }
        });
        addLog('success', `✅ Batch finalizado. Total: ${workerState.progress.completed} concluídos, ${workerState.progress.failed} falharam.`);
      } catch (e) {
        addLog('warning', `Erro ao finalizar batch: ${e.message}`);
      }
      // Para o worker automaticamente
      workerState.status = 'idle';
      workerState.currentJobId = null;
      isProcessing = false;
      await saveState();
      return;
    }

    // Batch que estava sendo processado foi concluído externamente (via UI)
    if (job?.reason === 'no_active_batch' && workerState.batchId) {
      addLog('success', `✅ Batch ${workerState.batchId} concluído. Todas as imagens foram geradas!`);
      workerState.status = 'idle';
      workerState.currentJobId = null;
      workerState.batchId = null;
      isProcessing = false;
      await saveState();
      return;
    }

    addLog('info', 'Nenhum job disponível. Aguardando...');
    await saveState();
    await delay(5000);
    scheduleNextProcess();
    return;
  }

  // Job encontrado — atualiza estado
  workerState.currentJobId = job.id;
  workerState.batchId = job.batchId || workerState.batchId;
  if (job.totalJobs) workerState.progress.total = job.totalJobs;
  const promptLen = job.prompt?.length ?? 0;
  const promptPreview = promptLen === 0 ? '(VAZIO!)' : `"${job.prompt.substring(0, 80)}"${promptLen > 80 ? '...' : ''}`;
  addLog('info', `Job ${job.jobIndex || '?'}/${job.totalJobs || '?'} [${promptLen} chars]: ${promptPreview}`);
  await saveState();

  // Avisa o Content Studio que começou a processar
  await updateJobStatus(job.id, 'processing');

  // Encontra (ou abre) a aba do ImageFX
  const flowTab = await findFlowTab();
  if (!flowTab) {
    addLog('error', 'Não foi possível abrir o ImageFX. Verifique sua conexão e tente novamente.');
    await submitError(job.id, 'dom_error', 'Aba do ImageFX não encontrada');
    workerState.progress.failed++;
    await saveState();
    scheduleNextProcess();
    return;
  }

  // Garante que o content script está ativo
  try {
    await ensureContentScript(flowTab.id);
  } catch (error) {
    addLog('error', `Não foi possível injetar content script: ${error.message}`);
    await submitError(job.id, 'dom_error', error.message);
    workerState.progress.failed++;
    await saveState();
    scheduleNextProcess();
    return;
  }

  // Delay humanizado antes de começar
  const preDelay = config.minDelay + Math.random() * (config.maxDelay - config.minDelay);
  addLog('info', `Aguardando ${Math.round(preDelay / 1000)}s antes de inserir prompt...`);
  await delay(preDelay);

  if (workerState.status !== 'running') {
    isProcessing = false;
    return;
  }

  // Re-verifica o CS após o delay — o Flow pode ter feito redirect de locale (SPA ou full reload)
  // durante o delay, invalidando o CS que foi verificado em ensureContentScript acima.
  addLog('info', 'Re-verificando content script após delay...');
  try {
    // Aguarda tab carregar (caso locale redirect tenha causado reload)
    await waitForFlowUrl(flowTab.id, 8000).catch(() => null);
    await delay(1500); // aguarda React + CS inicializar na nova URL
    await ensureContentScript(flowTab.id);
    addLog('info', 'Content script confirmado e pronto.');
  } catch (err) {
    addLog('warning', `Re-verificação do CS falhou: ${err.message} — tentando mesmo assim.`);
  }

  // Garante que o prompt não está vazio antes de usar 3 tentativas
  if (!job.prompt || !job.prompt.trim()) {
    addLog('error', `Job ${job.id} com prompt vazio — pulando. Regenere os prompts visuais no Content Studio.`);
    await submitError(job.id, 'dom_error', 'currentPrompt vazio no banco — regenere os prompts visuais');
    await updateJobStatus(job.id, 'failed');
    workerState.progress.failed++;
    workerState.currentJobId = null;
    await saveState();
    scheduleNextProcess();
    return;
  }

  // Tenta gerar com retry e safe rewrite
  let attempts = 0;
  let promptToUse = job.prompt;
  let generationResult = null;
  let lastError = null;

  activeFlowTabId = flowTab.id;

  while (attempts < config.maxAttempts && workerState.status === 'running') {
    attempts++;
    addLog('info', `Tentativa ${attempts}/${config.maxAttempts}...`);

    try {
      // Atualiza o rastreamento da aba atual para detecção independente de navegação.
      const tabNow = await chrome.tabs.get(flowTab.id).catch(() => null);
      activeFlowJobData = {
        prompt: promptToUse,
        orientation: job.orientation || 'LANDSCAPE',
        timeoutMs: 180000,
        startedAt: Date.now(),
        lastUrl: tabNow?.url || null
      };

      generationResult = await sendPromptToTab(flowTab.id, promptToUse, 180000, job.orientation || 'LANDSCAPE');

      if (generationResult.status === 'policy_blocked') {
        addLog('warning', `Prompt bloqueado por política (tentativa ${attempts})`);

        // Tenta safe rewrite se habilitado e não esgotou tentativas
        if (config.safeRewriteEnabled && attempts < config.maxAttempts) {
          const rewrite = await requestSafeRewrite(job.id);
          if (rewrite?.rewrittenPrompt) {
            promptToUse = rewrite.rewrittenPrompt;
            addLog('info', `Safe rewrite obtido: "${promptToUse.substring(0, 60)}..."`);
            await delay(config.minDelay, config.maxDelay);
            continue;
          }
        }

        // Sem mais tentativas para prompt bloqueado
        await submitError(job.id, 'policy_blocked', 'Prompt bloqueado por política de conteúdo');
        await updateJobStatus(job.id, 'blocked');
        workerState.progress.failed++;
        workerState.currentJobId = null;
        await saveState();
        await delay(config.minDelay, config.maxDelay);
        scheduleNextProcess();
        return;
      }

      if (generationResult.status === 'success') {
        break; // Sucesso!
      }

      // Timeout ou erro — retry
      lastError = generationResult.error || `Status: ${generationResult.status}`;
      addLog('warning', `Tentativa ${attempts} falhou: ${lastError}`);

      if (attempts < config.maxAttempts) {
        await delay(config.minDelay * 2, config.maxDelay * 2); // Delay maior entre tentativas
      }

    } catch (error) {
      lastError = error.message;
      addLog('error', `Erro na tentativa ${attempts}: ${error.message}`);

      if (attempts < config.maxAttempts) {
        await delay(config.minDelay * 2, config.maxDelay * 2);
      }
    }
  }

  // Limpa rastreamento da aba ativa
  activeFlowTabId = null;
  activeFlowJobData = null;

  // Verifica se gerou com sucesso
  if (!generationResult || generationResult.status !== 'success') {
    await submitError(job.id, 'timeout', lastError || 'Máximo de tentativas atingido');
    await updateJobStatus(job.id, 'failed');
    workerState.progress.failed++;
    workerState.currentJobId = null;
    addLog('error', `Job ${job.id} falhou após ${attempts} tentativas`);
    await saveState();
    await delay(config.minDelay, config.maxDelay);
    scheduleNextProcess();
    return;
  }

  // Geração bem-sucedida — obtém o blob da imagem
  addLog('success', 'Geração concluída! Baixando imagem...');

  let imageBlob = null;
  if (generationResult.blobDataUrl) {
    // Content script já enviou o blob como data URL — converte de volta
    try {
      const response = await fetch(generationResult.blobDataUrl);
      imageBlob = await response.blob();
    } catch (error) {
      addLog('error', `Erro ao converter data URL para blob: ${error.message}`);
    }
  } else if (generationResult.imageUrl) {
    // Tenta baixar a imagem diretamente da URL
    try {
      const imgResponse = await fetch(generationResult.imageUrl);
      if (imgResponse.ok) {
        imageBlob = await imgResponse.blob();
      }
    } catch (error) {
      addLog('warning', `Não foi possível baixar imagem diretamente: ${error.message}`);
    }
  }

  if (!imageBlob || imageBlob.size === 0) {
    addLog('error', 'Não foi possível obter o blob da imagem');
    await submitError(job.id, 'network_error', 'Falha ao obter blob da imagem gerada');
    workerState.progress.failed++;
    workerState.currentJobId = null;
    await saveState();
    scheduleNextProcess();
    return;
  }

  // Envia o resultado ao Content Studio
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename = `${config.filePrefix}_${job.id}_${timestamp}.png`;

  try {
    addLog('info', `Enviando ${filename} (${Math.round(imageBlob.size / 1024)}KB) ao Content Studio...`);
    await submitResult(job.id, imageBlob, filename);
    await updateJobStatus(job.id, 'completed');
    workerState.progress.completed++;
    workerState.currentJobId = null;
    addLog('success', `Job ${job.id} concluído com sucesso!`);
  } catch (error) {
    addLog('error', `Erro ao enviar resultado: ${error.message}`);
    await submitError(job.id, 'network_error', error.message);
    workerState.progress.failed++;
    workerState.currentJobId = null;
  }

  await saveState();

  // Delay entre jobs para parecer mais humano
  await delay(config.minDelay, config.maxDelay);

  // Agenda o próximo job
  scheduleNextProcess();
}

/**
 * Agenda a execução do próximo ciclo de processamento.
 * Usa setTimeout para não bloquear o event loop.
 */
function scheduleNextProcess() {
  if (workerState.status === 'running' && !isProcessing) {
    isProcessing = true;
    setTimeout(async () => {
      try {
        await processNextJob();
      } catch (error) {
        addLog('error', `Erro não tratado no loop principal: ${error.message}`);
        isProcessing = false;
        await saveState();
        // Aguarda 15s antes de tentar novamente após erro inesperado
        setTimeout(() => {
          if (workerState.status === 'running') {
            scheduleNextProcess();
          }
        }, 15000);
      } finally {
        isProcessing = false;
      }
    }, 100);
  }
}

// ─────────────────────────────────────────────
// CONTROLES DE SESSÃO
// ─────────────────────────────────────────────

/**
 * Inicia uma nova sessão de trabalho.
 */
async function startWorker() {
  if (workerState.status === 'running') {
    addLog('warning', 'Worker já está em execução');
    return;
  }

  // Gera um novo session ID único
  workerState.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  workerState.status = 'running';
  workerState.progress = { completed: 0, total: 0, failed: 0 };
  workerState.currentJobId = null;
  isProcessing = false;

  addLog('info', `Worker iniciado — Sessão: ${workerState.sessionId}`);
  galleryNavigation = null;
  activeFlowTabId = null;
  activeFlowJobData = null;

  // Limpa estado de geração anterior (pode ter sobrado de sessão cancelada)
  await chrome.storage.local.remove(['flow_generation_active', 'flow_cs_result', 'flow_cs_abort']);
  await saveState();

  // Registra a sessão imediatamente antes de buscar o primeiro job
  await sendHeartbeat();

  // Heartbeat a cada 24s — dentro do idle timeout de 30s do SW.
  // Junto com o polling loop de sendPromptToTab (a cada 1.5s), garante que
  // o SW nunca seja terminado enquanto está processando uma geração.
  chrome.alarms.create('heartbeat', { periodInMinutes: 0.4 }); // a cada 24 segundos

  // Inicia o loop de processamento
  scheduleNextProcess();
}

/**
 * Pausa o worker (pode ser retomado).
 */
async function pauseWorker() {
  if (workerState.status !== 'running') return;
  workerState.status = 'paused';
  addLog('info', 'Worker pausado');
  await saveState();
}

/**
 * Retoma o worker após uma pausa.
 */
async function resumeWorker() {
  if (workerState.status !== 'paused') return;
  workerState.status = 'running';
  addLog('info', 'Worker retomado');
  await saveState();
  scheduleNextProcess();
}

/**
 * Para completamente o worker.
 */
async function stopWorker() {
  const wasRunning = workerState.status !== 'stopped';
  workerState.status = 'stopped';
  workerState.currentJobId = null;
  isProcessing = false;

  // Cancela heartbeat
  chrome.alarms.clear('heartbeat');

  if (wasRunning) {
    addLog('info', 'Worker parado');
  }

  activeFlowTabId = null;
  activeFlowJobData = null;
  galleryNavigation = null;

  // Sinaliza abort ao CS e limpa estado de geração ativa
  await chrome.storage.local.set({ flow_cs_abort: true });
  await chrome.storage.local.remove('flow_generation_active');
  // Remove o sinal de abort após 3s (CS tem tempo de detectar e parar)
  setTimeout(() => chrome.storage.local.remove('flow_cs_abort').catch(() => {}), 3000);

  await saveState();
}

// ─────────────────────────────────────────────
// CLIQUE VIA DEBUGGER (eventos confiáveis / isTrusted=true)
// ─────────────────────────────────────────────

/**
 * Injeta um clique real (isTrusted=true) nas coordenadas especificadas via chrome.debugger.
 * Usa o protocolo CDP Input.dispatchMouseEvent — mesma abordagem do Puppeteer/Playwright.
 * @param {number} tabId
 * @param {number} x Coordenada X relativa ao viewport da tab
 * @param {number} y Coordenada Y relativa ao viewport da tab
 */
async function debuggerClick(tabId, x, y) {
  const target = { tabId };
  try {
    await chrome.debugger.attach(target, '1.3');
  } catch (e) {
    // Já estava anexado — ignora o erro
    if (!e.message?.includes('already attached')) throw e;
  }

  // Pequeno delay para o infobar do debugger renderizar (se houver)
  await new Promise(r => setTimeout(r, 150));

  // Parâmetros corretos para CDP Input.dispatchMouseEvent (compatíveis com Puppeteer)
  const common = { x, y, modifiers: 0, pointerType: 'mouse' };

  const sendMouse = (type, extra) =>
    chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type, ...common, ...extra });

  try {
    await sendMouse('mouseMoved',    { button: 'none',  buttons: 0, clickCount: 0 });
    await sendMouse('mousePressed',  { button: 'left',  buttons: 1, clickCount: 1 });
    await sendMouse('mouseReleased', { button: 'left',  buttons: 0, clickCount: 1 });
  } finally {
    try { await chrome.debugger.detach(target); } catch (_) {}
  }
}

// ─────────────────────────────────────────────
// HANDLERS DE MENSAGENS
// ─────────────────────────────────────────────

/**
 * Trata mensagens vindas do content script (resultados de geração)
 * e do popup (controles START/PAUSE/RESUME/STOP/GET_STATUS).
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Indica que a resposta será assíncrona
  const handleAsync = async () => {
    switch (message.type) {
      // ── Mensagens do Content Script ──────────────────

      case 'GALLERY_NAVIGATING': {
        // CS na galeria vai clicar em "Novo projeto" — a página vai navegar.
        // Guardamos os dados do job para re-enviar ao CS do projeto assim que ele carregar.
        galleryNavigation = {
          tabId: sender.tab?.id,
          prompt: message.prompt,
          timeoutMs: message.timeoutMs,
          orientation: message.orientation,
          startedAt: message.startedAt || Date.now()
        };
        addLog('info', 'Galeria navegando para projeto — aguardando nova página carregar...');
        sendResponse({ ok: true });
        break;
      }

      case 'GALLERY_NAV_FAILED': {
        // CS falhou ao encontrar o botão "Novo projeto" — cancela a navegação pendente
        galleryNavigation = null;
        sendResponse({ ok: true });
        break;
      }

      case 'CLICK_AT': {
        // Content script pede clique confiável (isTrusted=true) via chrome.debugger
        const senderTabId = sender.tab?.id;
        if (!senderTabId) { sendResponse({ ok: false, error: 'tab id desconhecido' }); break; }
        try {
          await debuggerClick(senderTabId, message.x, message.y);
          sendResponse({ ok: true });
        } catch (e) {
          sendResponse({ ok: false, error: e.message });
        }
        break;
      }

      case 'LOG': {
        addLog(message.level || 'info', `[CS] ${message.message}`);
        saveState(); // persiste imediatamente para não perder logs se o SW reiniciar
        sendResponse({ ok: true });
        break;
      }

      // ── Mensagens do Popup ────────────────────────────

      case 'START': {
        await startWorker();
        sendResponse({ ok: true, state: workerState });
        break;
      }

      case 'PAUSE': {
        await pauseWorker();
        sendResponse({ ok: true, state: workerState });
        break;
      }

      case 'RESUME': {
        await resumeWorker();
        sendResponse({ ok: true, state: workerState });
        break;
      }

      case 'STOP': {
        await stopWorker();
        sendResponse({ ok: true, state: workerState });
        break;
      }

      case 'GET_STATUS': {
        sendResponse({ ok: true, state: workerState });
        break;
      }

      case 'PING': {
        sendResponse({ status: 'PONG', workerState });
        break;
      }

      default:
        sendResponse({ ok: false, error: `Tipo de mensagem desconhecido: ${message.type}` });
    }
  };

  handleAsync().catch(err => {
    console.error('[FlowWorker] Erro no handler de mensagem:', err);
    sendResponse({ ok: false, error: err.message });
  });

  return true; // Mantém o canal aberto para resposta assíncrona
});

// ─────────────────────────────────────────────
// ALARMS — HEARTBEAT
// ─────────────────────────────────────────────

/**
 * Dispara quando um alarm aciona.
 * Usado para o heartbeat periódico e para manter o service worker vivo.
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'heartbeat') {
    await sendHeartbeat();

    // Não inicia novo job se já há uma geração ativa no storage.
    // Isso evita que o alarm inicie um segundo processamento concorrente quando
    // o SW reinicia (isProcessing = false em memória) mas o polling loop já está rodando.
    const { flow_generation_active } = await chrome.storage.local.get('flow_generation_active');
    if (flow_generation_active) return;

    if (workerState.status === 'running' && !isProcessing) {
      scheduleNextProcess();
    }
  }
});

// ─────────────────────────────────────────────
// LOGS DO CONTENT SCRIPT VIA STORAGE
// O resultado da geração é lido pelo polling loop em sendPromptToTab.
// Este listener apenas exibe os logs do CS no console do SW em tempo real.
// ─────────────────────────────────────────────

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local') return;

  // Log do CS
  if (changes.flow_cs_log?.newValue) {
    const log = changes.flow_cs_log.newValue;
    addLog(log.level || 'info', `[CS] ${log.message}`);
    saveState();
  }

  // CS confirmou que sobreviveu à SPA nav e vai gerar diretamente — cancela Branch 1
  if (changes.flow_cs_cancel_gallery_nav?.newValue) {
    await chrome.storage.local.remove('flow_cs_cancel_gallery_nav');
    cancelGalleryNavigation = true;
    addLog('info', '[SW] CS sobreviveu à SPA nav — Branch 1 será cancelado');
  }

  // GALLERY_NAVIGATING via storage (chrome.runtime.sendMessage falha após SPA nav)
  if (changes.flow_cs_gallery_navigating?.newValue) {
    const nav = changes.flow_cs_gallery_navigating.newValue;
    await chrome.storage.local.remove('flow_cs_gallery_navigating');
    if (activeFlowTabId) {
      galleryNavigation = {
        tabId: activeFlowTabId,
        prompt: nav.prompt,
        timeoutMs: nav.timeoutMs,
        orientation: nav.orientation,
        startedAt: nav.startedAt
      };
      addLog('info', 'Galeria navegando para projeto (via storage) — aguardando nova página...');
    }
  }

  // CLICK_AT via storage (chrome.runtime.sendMessage falha após SPA nav)
  if (changes.flow_cs_click_at?.newValue) {
    const { x, y } = changes.flow_cs_click_at.newValue;
    await chrome.storage.local.remove('flow_cs_click_at');
    addLog('info', `[DBG] CLICK_AT recebido: (${x}, ${y}) activeFlowTabId=${activeFlowTabId}`);
    if (activeFlowTabId) {
      try {
        await debuggerClick(activeFlowTabId, x, y);
        addLog('info', `[DBG] debuggerClick OK (${x}, ${y})`);
        await chrome.storage.local.set({ flow_cs_click_result: { ok: true, time: Date.now() } });
      } catch (e) {
        addLog('warning', `[DBG] debuggerClick FALHOU: ${e.message}`);
        await chrome.storage.local.set({ flow_cs_click_result: { ok: false, error: e.message, time: Date.now() } });
      }
    } else {
      addLog('warning', '[DBG] CLICK_AT ignorado: activeFlowTabId=null');
      await chrome.storage.local.set({ flow_cs_click_result: { ok: false, error: 'activeFlowTabId não definido', time: Date.now() } });
    }
  }

  // TYPE_AT via storage — digita texto via CDP Input.insertText (isTrusted, funciona no Slate.js)
  if (changes.flow_cs_type_at?.newValue) {
    const { text } = changes.flow_cs_type_at.newValue;
    await chrome.storage.local.remove('flow_cs_type_at');
    addLog('info', `[DBG] TYPE_AT recebido: "${text.substring(0, 40)}" (${text.length} chars) tab=${activeFlowTabId}`);
    if (activeFlowTabId) {
      const target = { tabId: activeFlowTabId };
      try {
        try { await chrome.debugger.attach(target, '1.3'); }
        catch (e) { if (!e.message?.includes('already attached')) throw e; }
        await new Promise(r => setTimeout(r, 200)); // aguarda infobar estabilizar

        // Re-foca o editor Slate via JS (infobar pode ter roubado o foco)
        await chrome.debugger.sendCommand(target, 'Runtime.evaluate', {
          expression: `(document.querySelector('[data-slate-editor="true"]') || document.activeElement)?.focus()`,
          awaitPromise: false
        });
        await new Promise(r => setTimeout(r, 100));

        // Ctrl+A para selecionar tudo, depois Backspace para apagar
        const kDown = (key, code, mod = 0) =>
          chrome.debugger.sendCommand(target, 'Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers: mod });
        const kUp = (key, code, mod = 0) =>
          chrome.debugger.sendCommand(target, 'Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers: mod });

        await kDown('a', 'KeyA', 2); // modifiers: 2 = Ctrl
        await kUp('a', 'KeyA', 2);
        await new Promise(r => setTimeout(r, 80));
        await kDown('Backspace', 'Backspace', 0);
        await kUp('Backspace', 'Backspace', 0);
        await new Promise(r => setTimeout(r, 120));

        // Insere o texto via CDP — isTrusted, Slate.js aceita como teclado real
        await chrome.debugger.sendCommand(target, 'Input.insertText', { text });
        await new Promise(r => setTimeout(r, 150));

        addLog('info', `[DBG] TYPE_AT OK (${text.length} chars)`);
        await chrome.storage.local.set({ flow_cs_type_result: { ok: true, time: Date.now() } });
      } catch (e) {
        addLog('warning', `[DBG] TYPE_AT FALHOU: ${e.message}`);
        await chrome.storage.local.set({ flow_cs_type_result: { ok: false, error: e.message, time: Date.now() } });
      } finally {
        try { await chrome.debugger.detach(target); } catch (_) {}
      }
    } else {
      addLog('warning', '[DBG] TYPE_AT ignorado: activeFlowTabId=null');
      await chrome.storage.local.set({ flow_cs_type_result: { ok: false, error: 'activeFlowTabId não definido', time: Date.now() } });
    }
  }
});

// ─────────────────────────────────────────────
// NAVEGAÇÃO GALERIA → PROJETO
// ─────────────────────────────────────────────

/**
 * Quando o CS clica em "Novo projeto" na galeria, a aba navega para o projeto.
 * Este listener detecta quando a nova página (projeto) terminou de carregar,
 * injeta o content script e re-envia o prompt para continuar a geração.
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Aceita tanto page load completo quanto mudança de URL via history.pushState (SPA React)
  const isRelevant = changeInfo.status === 'complete' || !!changeInfo.url;
  if (!isRelevant) return;
  if (!tab.url || !isFlowUrl(tab.url)) return;

  // ── Branch 1: CS sinalizou navegação explicitamente (GALLERY_NAVIGATING) ──────
  if (galleryNavigation && tabId === galleryNavigation.tabId) {
    const nav = galleryNavigation;
    galleryNavigation = null; // Consome a navegação pendente

    // Atualiza lastUrl para evitar re-trigger pelo Branch 2
    if (activeFlowJobData) activeFlowJobData.lastUrl = tab.url;

    // Usa activeFlowJobData.startedAt (início da tentativa) para calcular remaining corretamente.
    // nav.startedAt é quando o CS chamou notifyGalleryNavigating — DEPOIS de sendPromptToTab iniciar.
    // Usar nav.startedAt superestimaria o remaining, fazendo waitForGenerationComplete expirar junto.
    const referenceStart = activeFlowJobData?.startedAt || nav.startedAt;
    const elapsedMs = Date.now() - referenceStart;
    // Garantia: remaining deve ser pelo menos 15s mas caber dentro do polling de sendPromptToTab
    const remainingMs = Math.max(Math.min(nav.timeoutMs - elapsedMs - 5000, nav.timeoutMs - 10000), 15000);
    addLog('info', `[Branch1] Projeto carregado — elapsed=${Math.round(elapsedMs/1000)}s remaining=${Math.round(remainingMs/1000)}s prompt="${(nav.prompt||'').substring(0,40)}"`);

    await delay(2500);

    // CS pode ter confirmado (via flow_cs_cancel_gallery_nav) que sobreviveu à SPA nav
    // e já está gerando diretamente — sem re-envio necessário
    if (cancelGalleryNavigation) {
      cancelGalleryNavigation = false;
      addLog('info', '[Branch1] Cancelado — CS gerou via SPA nav direto, sem re-envio');
      return;
    }

    try {
      await ensureContentScript(nav.tabId);
    } catch (e) {
      addLog('error', `Falha ao reinjetar CS no projeto: ${e.message}`);
      await chrome.storage.local.set({ flow_cs_result: { type: 'failed', reason: `Não foi possível injetar CS no projeto: ${e.message}`, time: Date.now() } });
      return;
    }

    await delay(500);

    if (!nav.prompt || !nav.prompt.trim()) {
      addLog('error', '[Branch1] nav.prompt está vazio — não re-enviando SEND_PROMPT');
      await chrome.storage.local.set({ flow_cs_result: { type: 'failed', reason: '[Branch1] Prompt vazio no galleryNavigation', time: Date.now() } });
      return;
    }

    try {
      await chrome.tabs.sendMessage(nav.tabId, {
        type: 'SEND_PROMPT',
        prompt: nav.prompt,
        timeoutMs: remainingMs,
        orientation: nav.orientation
      });
      addLog('info', `[Branch1] Prompt re-enviado (${remainingMs/1000}s restantes) — aguardando geração...`);
    } catch (e) {
      addLog('error', `[Branch1] Erro ao reenviar prompt ao projeto: ${e.message}`);
      await chrome.storage.local.set({ flow_cs_result: { type: 'failed', reason: `[Branch1] Falha ao reenviar prompt: ${e.message}`, time: Date.now() } });
    }
    return;
  }

  // ── Branch 2: detecção independente — funciona mesmo se GALLERY_NAVIGATING falhou ──
  // Checa se esta é a aba do job ativo e se a URL mudou.
  if (!activeFlowTabId || tabId !== activeFlowTabId) return;
  if (!activeFlowJobData) return;
  if (tab.url === activeFlowJobData.lastUrl) return; // Mesma URL — sem mudança

  // URL mudou! Atualiza para evitar re-trigger duplicado.
  const prevUrl = activeFlowJobData.lastUrl;
  activeFlowJobData.lastUrl = tab.url;

  const elapsedMs = Date.now() - activeFlowJobData.startedAt;
  const remainingMs = Math.max(Math.min(activeFlowJobData.timeoutMs - elapsedMs - 5000, activeFlowJobData.timeoutMs - 10000), 15000);
  addLog('info', `[Branch2] Navegação detectada: ${prevUrl?.split('/').pop() || '?'} → ${tab.url.split('/').pop() || '?'} elapsed=${Math.round(elapsedMs/1000)}s remaining=${Math.round(remainingMs/1000)}s prompt="${(activeFlowJobData.prompt||'').substring(0,40)}"`);

  await delay(2500);

  try {
    await ensureContentScript(tabId);
  } catch (e) {
    addLog('error', `[Branch2] Falha ao reinjetar CS: ${e.message}`);
    await chrome.storage.local.set({ flow_cs_result: { type: 'failed', reason: `[Branch2] Não foi possível injetar CS: ${e.message}`, time: Date.now() } });
    return;
  }

  await delay(500);

  if (!activeFlowJobData.prompt || !activeFlowJobData.prompt.trim()) {
    addLog('error', '[Branch2] activeFlowJobData.prompt está vazio — não re-enviando SEND_PROMPT');
    await chrome.storage.local.set({ flow_cs_result: { type: 'failed', reason: '[Branch2] Prompt vazio', time: Date.now() } });
    return;
  }

  chrome.tabs.sendMessage(tabId, {
    type: 'SEND_PROMPT',
    prompt: activeFlowJobData.prompt,
    timeoutMs: remainingMs,
    orientation: activeFlowJobData.orientation
  }).then(() => {
    addLog('info', `[Branch2] Prompt re-enviado (${Math.round(remainingMs/1000)}s restantes) — aguardando geração...`);
  }).catch(e => {
    addLog('error', `[Branch2] Re-send falhou: ${e.message}`);
  });
});

// ─────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────

/**
 * Inicializa o service worker ao ser instalado.
 */
chrome.runtime.onInstalled.addListener(async () => {
  await loadState();
  addLog('info', 'Flow Image Worker instalado e pronto');
  await saveState();
});

/**
 * Inicialização imediata ao carregar o service worker.
 */
(async () => {
  await loadState();
  console.log('[FlowWorker] Service worker iniciado. Status:', workerState.status);
})();
