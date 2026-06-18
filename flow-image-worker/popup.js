/**
 * popup.js — Flow Image Worker Popup Controller
 *
 * Gerencia a interface do popup:
 * - Carrega e salva configurações via chrome.storage.local
 * - Envia comandos ao background (START, PAUSE, RESUME, STOP)
 * - Faz polling do status a cada 2 segundos e atualiza a UI
 * - Verifica conexão com o Content Studio
 * - Exibe logs coloridos em tempo real
 */

'use strict';

// ─────────────────────────────────────────────
// ESTADO DA UI
// ─────────────────────────────────────────────

/** Estado local que espelha o workerState do background */
let currentState = {
  status: 'idle',
  sessionId: null,
  batchId: null,
  currentJobId: null,
  progress: { completed: 0, total: 0, failed: 0 },
  logs: []
};

/** Timer do polling de status */
let statusPollingTimer = null;

/** Timer da verificação de conexão */
let connectionCheckTimer = null;

// ─────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────

/**
 * Inicializa o popup: carrega config, busca status e inicia polling.
 */
async function init() {
  await loadConfig();
  await refreshStatus();
  startPolling();
  checkConnection();
  // Verifica conexão a cada 15 segundos
  connectionCheckTimer = setInterval(checkConnection, 15000);
}

// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

// Limpa timers quando o popup fechar
window.addEventListener('unload', () => {
  if (statusPollingTimer) clearInterval(statusPollingTimer);
  if (connectionCheckTimer) clearInterval(connectionCheckTimer);
});

// ─────────────────────────────────────────────
// CONFIGURAÇÕES
// ─────────────────────────────────────────────

/**
 * Carrega configurações do storage e preenche os campos do formulário.
 */
async function loadConfig() {
  const result = await chrome.storage.local.get('config');
  const config = result.config || {};

  setInputValue('studioUrl', config.studioUrl || 'http://localhost:3000');
  setInputValue('token', config.token || '');
  setInputValue('minDelay', config.minDelay ?? 3000);
  setInputValue('maxDelay', config.maxDelay ?? 8000);
  setInputValue('maxAttempts', config.maxAttempts ?? 3);
  setInputValue('filePrefix', config.filePrefix || 'flow');

  const safeRewrite = document.getElementById('safeRewriteEnabled');
  if (safeRewrite) safeRewrite.checked = config.safeRewriteEnabled !== false;
}

/**
 * Salva as configurações atuais do formulário no storage.
 */
async function saveConfig() {
  const config = {
    studioUrl: getInputValue('studioUrl').replace(/\/$/, ''), // remove barra final
    token: getInputValue('token'),
    minDelay: parseInt(getInputValue('minDelay')) || 3000,
    maxDelay: parseInt(getInputValue('maxDelay')) || 8000,
    maxAttempts: parseInt(getInputValue('maxAttempts')) || 3,
    filePrefix: getInputValue('filePrefix') || 'flow',
    safeRewriteEnabled: document.getElementById('safeRewriteEnabled')?.checked !== false
  };

  await chrome.storage.local.set({ config });

  showToast('Salvo!');
  checkConnection(); // Verifica conexão com a nova URL/token
}

// Wire up all event listeners (inline onclick is blocked by MV3 CSP)
document.addEventListener('DOMContentLoaded', () => {
  // Config
  document.getElementById('saveBtn')?.addEventListener('click', saveConfig);

  // Controls
  document.getElementById('btnStart')?.addEventListener('click', handleStart);
  document.getElementById('btnPauseResume')?.addEventListener('click', handlePauseResume);
  document.getElementById('btnStop')?.addEventListener('click', handleStop);

  // Footer navigation
  document.getElementById('btnOpenFlow')?.addEventListener('click', openFlowPage);
  document.getElementById('btnOpenStudio')?.addEventListener('click', openContentStudio);

  // Section accordion toggles via data-toggle attribute
  document.querySelectorAll('[data-toggle]').forEach(header => {
    header.addEventListener('click', () => {
      const sectionId = header.getAttribute('data-toggle');
      const section = document.getElementById(sectionId);
      if (section) section.classList.toggle('collapsed');
    });
  });
});

// ─────────────────────────────────────────────
// POLLING DE STATUS
// ─────────────────────────────────────────────

/**
 * Inicia o polling de status a cada 2 segundos.
 */
function startPolling() {
  if (statusPollingTimer) clearInterval(statusPollingTimer);
  statusPollingTimer = setInterval(refreshStatus, 2000);
}

/**
 * Busca o status atual do background e atualiza a UI.
 */
async function refreshStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
    if (response?.state) {
      currentState = response.state;
      updateUI();
    }
  } catch (error) {
    // Background pode estar reiniciando — não quebra a UI
    console.warn('[Popup] Erro ao buscar status:', error.message);
  }
}

// ─────────────────────────────────────────────
// ATUALIZAÇÃO DA UI
// ─────────────────────────────────────────────

/**
 * Atualiza todos os elementos da UI com o estado atual.
 */
function updateUI() {
  updateWorkerBadge();
  updateStats();
  updateProgressBar();
  updateCurrentJob();
  updateControlButtons();
  updateLogs();
  updateSessionInfo();
}

/**
 * Atualiza o badge de status do worker.
 */
function updateWorkerBadge() {
  const badge = document.getElementById('workerBadge');
  const text = document.getElementById('workerStatusText');
  if (!badge || !text) return;

  const statusMap = {
    idle:    { cls: 'badge-idle',    label: 'Idle',    dot: '#71717a' },
    running: { cls: 'badge-running', label: 'Rodando', dot: '#22c55e' },
    paused:  { cls: 'badge-paused',  label: 'Pausado', dot: '#eab308' },
    stopped: { cls: 'badge-stopped', label: 'Parado',  dot: '#ef4444' }
  };

  const info = statusMap[currentState.status] || statusMap.idle;
  badge.className = `worker-status-badge ${info.cls}`;
  text.textContent = info.label;

  // Atualiza o dot dentro do badge
  const dot = badge.querySelector('.status-dot');
  if (dot) dot.style.background = info.dot;
}

/**
 * Atualiza os cartões de estatística.
 */
function updateStats() {
  const p = currentState.progress || { completed: 0, failed: 0 };
  setText('statCompleted', p.completed ?? 0);
  setText('statFailed', p.failed ?? 0);
}

/**
 * Atualiza a barra de progresso.
 */
function updateProgressBar() {
  const p = currentState.progress || { completed: 0, total: 0, failed: 0 };
  const total = p.total || 0;
  const done = (p.completed || 0) + (p.failed || 0);
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;

  const bar = document.getElementById('progressBar');
  const label = document.getElementById('progressText');
  if (bar) bar.style.width = `${pct.toFixed(1)}%`;
  if (label) label.textContent = total > 0 ? `${done} / ${total}` : '—';
}

/**
 * Atualiza o cartão de job atual.
 */
function updateCurrentJob() {
  const container = document.getElementById('jobContent');
  if (!container) return;

  if (!currentState.currentJobId) {
    container.innerHTML = '<p class="no-job-text">Nenhum job em processamento</p>';
    return;
  }

  const p = currentState.progress || {};
  const jobIndex = (p.completed || 0) + (p.failed || 0) + 1;
  const total = p.total || '?';

  container.innerHTML = `
    <div class="job-card">
      <div class="job-row">
        <span class="job-key">ID</span>
        <span class="job-value" style="font-family:monospace;font-size:10px">${escapeHtml(currentState.currentJobId)}</span>
      </div>
      <div class="job-row">
        <span class="job-key">Posição</span>
        <span class="job-value">${jobIndex} de ${total}</span>
      </div>
      <div class="job-row">
        <span class="job-key">Batch</span>
        <span class="job-value">${escapeHtml(currentState.batchId || '—')}</span>
      </div>
    </div>
  `;
}

/**
 * Atualiza os botões de controle com base no status.
 */
function updateControlButtons() {
  const btnStart = document.getElementById('btnStart');
  const btnPauseResume = document.getElementById('btnPauseResume');
  const btnStop = document.getElementById('btnStop');

  if (!btnStart || !btnPauseResume || !btnStop) return;

  const s = currentState.status;

  switch (s) {
    case 'idle':
    case 'stopped':
      btnStart.disabled = false;
      btnStart.textContent = '▶ Iniciar';
      btnPauseResume.disabled = true;
      btnPauseResume.textContent = '⏸ Pausar';
      btnStop.disabled = true;
      break;

    case 'running':
      btnStart.disabled = true;
      btnPauseResume.disabled = false;
      btnPauseResume.textContent = '⏸ Pausar';
      btnStop.disabled = false;
      break;

    case 'paused':
      btnStart.disabled = true;
      btnPauseResume.disabled = false;
      btnPauseResume.textContent = '▶ Retomar';
      btnStop.disabled = false;
      break;
  }
}

/**
 * Atualiza a lista de logs.
 * Mantém apenas os 10 mais recentes.
 */
function updateLogs() {
  const container = document.getElementById('logsContainer');
  if (!container) return;

  const logs = currentState.logs || [];

  if (logs.length === 0) {
    container.innerHTML = '<p class="logs-empty">Nenhum log disponível</p>';
    return;
  }

  // Mostra apenas os 10 mais recentes
  const recent = logs.slice(0, 10);

  container.innerHTML = recent.map(entry => `
    <div class="log-entry log-${escapeHtml(entry.level || 'info')}">
      <span class="log-time">${escapeHtml(entry.time || '')}</span>
      <span class="log-msg">${escapeHtml(entry.message || '')}</span>
    </div>
  `).join('');
}

/**
 * Atualiza informações de sessão no rodapé do status.
 */
function updateSessionInfo() {
  const el = document.getElementById('sessionIdText');
  if (el) {
    const sid = currentState.sessionId;
    el.textContent = sid ? sid.substring(0, 20) + '...' : '—';
  }
}

// ─────────────────────────────────────────────
// CONTROLES
// ─────────────────────────────────────────────

/**
 * Handler do botão Start.
 */
async function handleStart() {
  // Valida configurações antes de iniciar
  const config = {
    studioUrl: getInputValue('studioUrl'),
    token: getInputValue('token')
  };

  if (!config.studioUrl || !config.token) {
    // Abre a seção de configurações para o usuário preencher
    const settingsSection = document.getElementById('sectionSettings');
    if (settingsSection?.classList.contains('collapsed')) {
      settingsSection.classList.remove('collapsed');
    }
    showToast('Configure a URL e o token primeiro!', 'error');
    return;
  }

  // Salva config antes de iniciar
  await saveConfig();

  const btnStart = document.getElementById('btnStart');
  if (btnStart) btnStart.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({ type: 'START' });
    if (response?.state) {
      currentState = response.state;
      updateUI();
    }
  } catch (error) {
    console.error('[Popup] Erro ao iniciar worker:', error);
    if (btnStart) btnStart.disabled = false;
  }
}

/**
 * Handler do botão Pausar/Retomar.
 */
async function handlePauseResume() {
  const type = currentState.status === 'paused' ? 'RESUME' : 'PAUSE';
  try {
    const response = await chrome.runtime.sendMessage({ type });
    if (response?.state) {
      currentState = response.state;
      updateUI();
    }
  } catch (error) {
    console.error('[Popup] Erro ao pausar/retomar:', error);
  }
}

/**
 * Handler do botão Stop.
 */
async function handleStop() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'STOP' });
    if (response?.state) {
      currentState = response.state;
      updateUI();
    }
  } catch (error) {
    console.error('[Popup] Erro ao parar worker:', error);
  }
}

// Expõe handlers globalmente (chamados via onclick no HTML)
window.handleStart = handleStart;
window.handlePauseResume = handlePauseResume;
window.handleStop = handleStop;

// ─────────────────────────────────────────────
// VERIFICAÇÃO DE CONEXÃO
// ─────────────────────────────────────────────

/**
 * Tenta conectar ao Content Studio e atualiza o indicador de conexão.
 */
async function checkConnection() {
  const dot = document.getElementById('connDot');
  const label = document.getElementById('connLabel');

  if (!dot || !label) return;

  const studioUrl = getInputValue('studioUrl') || 'http://localhost:3000';
  const token = getInputValue('token');

  if (!token) {
    setConnectionStatus('disconnected', 'Sem token');
    return;
  }

  // Estado de verificação
  setConnectionStatus('checking', 'Verificando...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${studioUrl.replace(/\/$/, '')}/api/flow-worker/health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 404) {
      // 404 pode significar que o endpoint de health não existe mas a URL está correta
      setConnectionStatus('connected', response.ok ? 'Conectado' : 'URL encontrada');
    } else if (response.status === 401 || response.status === 403) {
      setConnectionStatus('disconnected', 'Token inválido');
    } else {
      setConnectionStatus('disconnected', `HTTP ${response.status}`);
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      setConnectionStatus('disconnected', 'Timeout');
    } else {
      setConnectionStatus('disconnected', 'Sem conexão');
    }
  }
}

/**
 * Atualiza o indicador visual de conexão.
 * @param {'connected'|'disconnected'|'checking'} status
 * @param {string} text
 */
function setConnectionStatus(status, text) {
  const dot = document.getElementById('connDot');
  const label = document.getElementById('connLabel');
  if (!dot || !label) return;

  dot.className = `status-dot ${status}`;
  label.textContent = text;
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────

/**
 * Abre o ImageFX em uma nova aba (gerador de imagens do Google).
 */
function openFlowPage() {
  chrome.tabs.create({ url: 'https://labs.google/fx/tools/flow' });
  window.close();
}

/**
 * Abre o Content Studio em uma nova aba.
 */
function openContentStudio() {
  const studioUrl = getInputValue('studioUrl') || 'http://localhost:3000';
  chrome.tabs.create({ url: studioUrl });
  window.close();
}

// Expõe funções de navegação globalmente
window.openFlowPage = openFlowPage;
window.openContentStudio = openContentStudio;

// ─────────────────────────────────────────────
// ACCORDION (seções colapsáveis)
// ─────────────────────────────────────────────

/**
 * Alterna a visibilidade de uma seção do acordeão.
 * @param {string} sectionId
 */
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.toggle('collapsed');
  }
}

// Expõe globalmente (chamado via onclick no HTML)
window.toggleSection = toggleSection;

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

let toastTimer = null;

/**
 * Mostra uma notificação temporária.
 * @param {string} message
 * @param {'success'|'error'} [type='success']
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.style.background = type === 'error' ? '#ef4444' : '#22c55e';
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────

/**
 * Lê o valor de um campo de input pelo ID.
 * @param {string} id
 * @returns {string}
 */
function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/**
 * Define o valor de um campo de input pelo ID.
 * @param {string} id
 * @param {string|number} value
 */
function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

/**
 * Define o texto de um elemento pelo ID.
 * @param {string} id
 * @param {string|number} text
 */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Escapa caracteres HTML para prevenir XSS nos logs.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
