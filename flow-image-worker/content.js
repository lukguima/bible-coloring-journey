/**
 * content.js — Flow Image Worker Content Script
 *
 * Executa no contexto da página do Google Flow (labs.google / aitestkitchen).
 * Responsável por:
 * 1. Receber o prompt do background script
 * 2. Inserir o texto no campo de input do Google Flow
 * 3. Clicar no botão de gerar
 * 4. Aguardar a conclusão da geração (via observação do DOM)
 * 5. Capturar a imagem gerada como blob
 * 6. Enviar o resultado de volta ao background
 *
 * IMPORTANTE: Este script usa apenas vanilla JS (sem imports).
 * O Google Flow é uma SPA React — o DOM é dinâmico e pode usar Shadow DOM.
 */

(function () {
  'use strict';

  // Verifica se o contexto da extensão ainda é válido.
  // Após recarregar a extensão, o CS antigo perde acesso às APIs Chrome
  // mas continua rodando na aba — chrome.runtime.id fica undefined.
  function isContextAlive() {
    try { return !!chrome?.runtime?.id; } catch (_) { return false; }
  }

  // Evita inicialização dupla se o script for injetado novamente.
  // Mas se o contexto anterior morreu (extensão recarregada), reinicializar
  // para que o novo CS (com contexto válido) assuma o controle.
  if (window.__flowWorkerInitialized) {
    const prevAlive = typeof window.__flowWorkerIsContextAlive === 'function'
      ? window.__flowWorkerIsContextAlive()
      : true;
    if (prevAlive) {
      console.log('[FlowCS] Já inicializado — ignorando');
      return;
    }
    console.log('[FlowCS] Contexto anterior inválido — reinicializando com novo CS');
  }
  window.__flowWorkerInitialized = true;
  window.__flowWorkerIsContextAlive = isContextAlive; // expõe para próxima injeção detectar context death
  window.__flowWorkerRunning = false;
  window.__flowWorkerShouldAbort = false;

  console.log('[FlowCS] Content script do Flow Image Worker inicializado');

  // ─────────────────────────────────────────────
  // SELETORES DOM — tentados em ordem de prioridade
  // ─────────────────────────────────────────────

  // Atributos que identificam campos que NÃO são prompt de geração
  const RECAPTCHA_NAMES = ['g-recaptcha-response', 'h-captcha-response'];

  /**
   * Verifica se um elemento é visível e não é um campo oculto/reCAPTCHA.
   * @param {Element} el
   * @returns {boolean}
   */
  function isUsableInput(el) {
    if (!el) return false;
    const name = (el.getAttribute('name') || '').toLowerCase();
    const id = (el.getAttribute('id') || '').toLowerCase();
    if (RECAPTCHA_NAMES.includes(name) || id.includes('recaptcha') || name.includes('recaptcha')) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 50 && rect.height > 15;
  }

  // Seletores para o campo de texto do prompt (do mais específico ao mais genérico)
  // O Google Flow usa Slate.js — o editor é [data-slate-editor="true"]
  const PROMPT_SELECTORS = [
    '[data-slate-editor="true"]',               // Google Flow / Slate.js
    '[contenteditable="true"][role="textbox"]',  // Acessível contenteditable
    'textarea[placeholder*="prompt" i]',
    'textarea[placeholder*="describe" i]',
    'textarea[placeholder*="descreva" i]',
    'textarea[placeholder*="imagine" i]',
    'textarea[placeholder*="write" i]',
    'textarea[placeholder*="escreva" i]',
    'textarea[aria-label*="prompt" i]',
    'textarea[aria-label*="describe" i]',
    'div[contenteditable="true"][aria-label*="prompt" i]',
    'textarea[data-testid*="prompt"]',
    'textarea[name*="prompt"]',
    '.prompt-input textarea',
    '[data-testid="prompt-input"]',
    'textarea[rows]',
    'div[contenteditable="true"]',
  ];

  // Seletores para o botão de gerar (sem fallback genérico 'button')
  const GENERATE_BUTTON_SELECTORS = [
    'button[aria-label*="generate" i]',
    'button[aria-label*="gerar" i]',
    'button[aria-label*="criar" i]',
    'button[aria-label*="create" i]',
    'button[aria-label*="run" i]',
    'button[data-testid*="generate"]',
    '[data-testid="generate-button"]',
    '.generate-button',
    'button[type="submit"]:not([aria-label*="ajuda" i]):not([aria-label*="help" i]):not([aria-label*="fechar" i])',
    'button:not([disabled])[class*="generate"]',
  ];

  // Seletores para detectar imagem gerada
  const IMAGE_RESULT_SELECTORS = [
    'img[data-testid*="generated"]',
    'img[data-testid*="result"]',
    '.generated-image img',
    '.result-image img',
    '.output-image img',
    '[aria-label*="generated image" i] img',
    '[aria-label*="imagem gerada" i] img',
    '.image-result img',
    'figure img',
    '[role="img"] img',
    'img[src*="blob:"]',
    'img[src*="data:image"]',
    // Google Flow / Imagen: URLs via CDN ou googleapis
    'img[src*="generativelanguage.googleapis.com"]',
    'img[src*="storage.googleapis.com"]',
    'img[src*="imagegeneration"]',
    'img[src*="imagen"]',
    // Seletor amplo: qualquer img grande que não seja asset/logo do Google
    'main img[src]:not([src*="gstatic.com"]):not([src*="google.com/images"]):not([src*="favicon"])',
    'img[src]:not([src*="gstatic.com"]):not([src*="google.com/images"])[width]'
  ];

  // Seletores para detectar estado de carregamento/spinner
  const LOADING_SELECTORS = [
    '[role="progressbar"]',
    '.loading',
    '.spinner',
    'mat-spinner',
    '[aria-label*="loading" i]',
    '[aria-label*="carregando" i]',
    '[aria-busy="true"]',
    '.progress',
    'circle.indeterminate', // Material spinner
    '[data-testid*="loading"]',
    '.generating'
  ];

  // Seletores para detectar mensagem de erro/bloqueio por política
  // IMPORTANTE: evitar seletores genéricos (class*="blocked") que causam falsos positivos
  const POLICY_ERROR_SELECTORS = [
    '[aria-label*="content policy" i]',
    '[data-testid*="policy-block"]',
    '[data-testid*="content-policy"]',
    '[class*="policy-error"]',
    '[class*="policy-block"]',
    '[class*="content-policy"]',
  ];

  // Textos dos botões de gerar (verificados em elementos button)
  const GENERATE_BUTTON_TEXTS = [
    'generate', 'gerar', 'criar', 'create', 'run', 'executar',
    'imagine', 'make', 'fazer', 'go', 'submit', 'enviar'
  ];

  // ─────────────────────────────────────────────
  // UTILIDADES DOM
  // ─────────────────────────────────────────────

  /**
   * Aguarda um delay em milissegundos.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simula um clique humano completo: pointer + mouse + click events.
   * Usa elementFromPoint para encontrar o elemento real no centro (como o browser faria),
   * pois eventos despachados no container pai podem ser ignorados por React se ele espera
   * o evento vindo de um elemento filho (ex: <i> ícone dentro de <button>).
   * @param {Element} el Elemento a ser clicado (ou seu container)
   */
  function humanClick(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);

    // Usa o elemento mais superficial no ponto de clique (como um clique real faria)
    const target = document.elementFromPoint(cx, cy) || el;

    const opts = { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy };

    target.dispatchEvent(new PointerEvent('pointerover', opts));
    target.dispatchEvent(new PointerEvent('pointerenter', { ...opts, bubbles: false }));
    target.dispatchEvent(new MouseEvent('mouseover', opts));
    target.dispatchEvent(new MouseEvent('mouseenter', { ...opts, bubbles: false }));
    target.dispatchEvent(new PointerEvent('pointermove', opts));
    target.dispatchEvent(new MouseEvent('mousemove', opts));
    target.dispatchEvent(new PointerEvent('pointerdown', { ...opts, button: 0, buttons: 1 }));
    target.dispatchEvent(new MouseEvent('mousedown', { ...opts, button: 0, buttons: 1 }));
    target.dispatchEvent(new PointerEvent('pointerup', { ...opts, button: 0, buttons: 0 }));
    target.dispatchEvent(new MouseEvent('mouseup', { ...opts, button: 0, buttons: 0 }));
    target.dispatchEvent(new MouseEvent('click', { ...opts, button: 0, buttons: 0 }));
  }

  /**
   * Busca um elemento tentando múltiplos seletores.
   * Também verifica dentro de shadow roots se o DOM regular não encontrar.
   * @param {string[]} selectors Lista de seletores CSS
   * @param {Element} [root=document] Raiz da busca
   * @returns {Element|null}
   */
  function findElement(selectors, root = document) {
    for (const selector of selectors) {
      try {
        const el = root.querySelector(selector);
        if (el) return el;
      } catch (e) {
        // Seletor inválido — tenta o próximo
      }
    }

    // Busca em shadow roots abertos
    const shadowResult = searchShadowDom(selectors, root);
    if (shadowResult) return shadowResult;

    return null;
  }

  /**
   * Busca recursivamente em shadow roots abertos.
   * O Google Flow pode encapsular componentes em Shadow DOM.
   * @param {string[]} selectors
   * @param {Element|Document} root
   * @returns {Element|null}
   */
  function searchShadowDom(selectors, root) {
    const allElements = root.querySelectorAll('*');
    for (const el of allElements) {
      if (el.shadowRoot) {
        const found = findElement(selectors, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Busca um botão pelo seu texto visível.
   * Normaliza o texto antes de comparar.
   * @param {string[]} texts Textos aceitáveis (case insensitive)
   * @returns {HTMLButtonElement|null}
   */
  function findButtonByText(texts) {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const btnText = btn.textContent?.toLowerCase().trim() || '';
      const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
      for (const text of texts) {
        if (btnText.includes(text.toLowerCase()) || ariaLabel.includes(text.toLowerCase())) {
          if (!btn.disabled) return btn;
        }
      }
    }
    return null;
  }

  /**
   * Simula digitação humana em um elemento de input.
   * Para Slate.js (Google Flow): usa a sequência de eventos que o Slate REALMENTE escuta.
   * O problema: execCommand modifica o DOM mas não o estado interno do Slate/React.
   * A solução: beforeinput com insertText + ClipboardEvent paste como fallback.
   * @param {Element} element
   * @param {string} text
   */
  async function simulateTyping(element, text) {
    // Estratégia primária: CDP Input.insertText via background (isTrusted=true)
    // Funciona no Slate.js porque usa o mesmo caminho de eventos que o teclado físico.
    // 1. Clica no elemento para focar (CDP debugger click — isTrusted)
    // 2. Seleciona tudo (Ctrl+A via CDP) + Delete (via CDP)
    // 3. Insere o texto (Input.insertText via CDP)
    const rect = element.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);

    logToBackground('info', `Clicando campo para focar (${cx},${cy})...`);
    const focusResult = await requestDebuggerClick(cx, cy);
    if (!focusResult.ok) {
      logToBackground('warning', `Click-to-focus falhou: ${focusResult.error}`);
    }
    await sleep(300);

    logToBackground('info', `Digitando ${text.length} chars via CDP...`);
    const typeResult = await requestDebuggerTyping(text);

    if (typeResult.ok) {
      logToBackground('info', `Texto inserido via CDP com sucesso`);
      await sleep(200);
      return;
    }

    logToBackground('warning', `CDP typing falhou (${typeResult.error}) — usando fallback sintético`);

    // ── Fallback sintético para Slate.js ───────────────────────────────────────
    const isSlate = element.hasAttribute('data-slate-editor') || element.contentEditable === 'true';
    if (isSlate) {
      element.focus();
      await sleep(100);

      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(element);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      await sleep(100);

      element.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'deleteContentBackward',
        bubbles: true, cancelable: true, composed: true
      }));
      await sleep(150);

      const dt = new DataTransfer();
      dt.setData('text/plain', text);
      element.dispatchEvent(new ClipboardEvent('paste', {
        bubbles: true, cancelable: true, composed: true, clipboardData: dt
      }));
      await sleep(300);

      const afterPaste = element.textContent?.trim() || '';
      if (afterPaste.length < text.length * 0.3) {
        element.dispatchEvent(new InputEvent('beforeinput', {
          inputType: 'insertText', data: text,
          bubbles: true, cancelable: true, composed: true
        }));
        await sleep(200);
      }

      const afterEvents = element.textContent?.trim() || '';
      if (afterEvents.length < text.length * 0.3) {
        document.execCommand('selectAll');
        await sleep(30);
        document.execCommand('delete');
        await sleep(30);
        document.execCommand('insertText', false, text);
        await sleep(150);
      }

      element.dispatchEvent(new InputEvent('input', {
        inputType: 'insertText', bubbles: true, composed: true
      }));

    } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      element.focus();
      element.select();
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      if (nativeSetter) nativeSetter.call(element, text);
      else element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    await sleep(300);
  }

  // ─────────────────────────────────────────────
  // DETECÇÃO DE ESTADO DA PÁGINA
  // ─────────────────────────────────────────────

  /**
   * Detecta o estado atual da página do Google Flow.
   * @returns {{
   *   isFlowPage: boolean,
   *   isLoggedIn: boolean,
   *   hasHumanVerification: boolean,
   *   isRateLimited: boolean,
   *   hasPromptInput: boolean,
   *   hasGenerateButton: boolean
   * }}
   */
  function detectPageState() {
    const url = window.location.href;
    const isFlowPage = url.includes('labs.google') || url.includes('aitestkitchen.withgoogle.com');

    // Verifica login — geralmente há um botão "Sign in" se não estiver logado
    const signInButton = Array.from(document.querySelectorAll('a, button')).find(el =>
      el.textContent?.toLowerCase().includes('sign in') ||
      el.textContent?.toLowerCase().includes('entrar')
    );
    const isLoggedIn = !signInButton;

    // Verifica captcha/verificação humana VISÍVEL
    // reCAPTCHA invisível do Google não requer ação — só bloqueia se o challenge
    // estiver visivelmente na tela (iframe grande ou checkbox "I'm not a robot")
    const hasHumanVerification = (() => {
      // reCAPTCHA challenge popup (iframe grande visível)
      const recaptchaIframes = document.querySelectorAll('iframe[src*="recaptcha"]');
      for (const iframe of recaptchaIframes) {
        const rect = iframe.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 100) return true; // visível e grande
      }
      // Checkbox "I'm not a robot" visível
      const checkbox = document.querySelector('[class*="recaptcha-checkbox"], iframe[title*="recaptcha" i]');
      if (checkbox) {
        const rect = checkbox.getBoundingClientRect();
        if (rect.width > 20 && rect.height > 20) return true;
      }
      // Data-testid explícito de captcha (não reCAPTCHA invisível)
      const explicitCaptcha = document.querySelector('[data-testid*="captcha"], [class*="hcaptcha"]');
      if (explicitCaptcha) return true;
      return false;
    })();

    // Verifica rate limit
    const pageText = document.body?.textContent?.toLowerCase() || '';
    const isRateLimited = pageText.includes('rate limit') ||
      pageText.includes('too many requests') ||
      pageText.includes('muitas requisições') ||
      pageText.includes('tente novamente em');

    // Verifica presença dos elementos de trabalho
    const hasPromptInput = !!findVisiblePromptInput();
    const hasGenerateButton = !!findCreateButton();

    return {
      isFlowPage,
      isLoggedIn,
      hasHumanVerification,
      isRateLimited,
      hasPromptInput,
      hasGenerateButton
    };
  }

  // ─────────────────────────────────────────────
  // INSERÇÃO DE PROMPT
  // ─────────────────────────────────────────────

  /**
   * Encontra o campo de prompt visível (exclui reCAPTCHA e campos ocultos).
   * @returns {Element|null}
   */
  function findVisiblePromptInput() {
    for (const selector of PROMPT_SELECTORS) {
      try {
        const candidates = document.querySelectorAll(selector);
        for (const el of candidates) {
          if (isUsableInput(el)) return el;
        }
      } catch (e) { /* seletor inválido */ }
    }
    // Fallback: qualquer textarea visível que não seja reCAPTCHA
    const all = document.querySelectorAll('textarea, [contenteditable="true"]');
    for (const el of all) {
      if (isUsableInput(el)) return el;
    }
    return null;
  }

  /**
   * Encontra o campo de prompt e insere o texto.
   * Tenta múltiplos seletores e métodos de inserção.
   * @param {string} text Texto do prompt
   * @returns {Promise<boolean>} true se inseriu com sucesso
   */
  async function insertPrompt(text) {
    logToBackground('info', `Inserindo prompt (${text.length} chars)...`);

    const inputElement = findVisiblePromptInput();

    if (!inputElement) {
      logToBackground('error', 'Campo de prompt não encontrado');
      return false;
    }

    logToBackground('info', `Campo encontrado: ${inputElement.tagName}[${inputElement.getAttribute('data-slate-editor') ? 'slate' : inputElement.contentEditable}] (${inputElement.className?.substring(0, 50)})`);

    await simulateTyping(inputElement, text);

    // Verifica se o texto foi inserido
    await sleep(300);
    const currentValue = (inputElement.value || inputElement.textContent || '').trim();
    if (!currentValue) {
      logToBackground('warning', 'Texto não detectado no campo após simulateTyping — aguardando React e verificando...');
      await sleep(500);
      const afterWait = (inputElement.value || inputElement.textContent || '').trim();
      if (!afterWait) {
        logToBackground('warning', 'Texto ainda ausente — pode haver problema com o Slate.js');
      } else {
        logToBackground('info', `Texto apareceu após espera extra: "${afterWait.substring(0, 40)}"`);
      }
    } else {
      logToBackground('info', `Texto inserido OK: "${currentValue.substring(0, 60)}"`);
    }

    return true;
  }

  // ─────────────────────────────────────────────
  // CLIQUE NO BOTÃO GERAR
  // ─────────────────────────────────────────────

  /**
   * Busca o botão de submit do Google Flow a cada chamada (sem cache).
   *
   * Estratégia de identificação:
   * 1. Busca entre button[aria-disabled] (somente o submit usa este atributo),
   *    preferindo o ÚLTIMO na ordem do DOM (submit é sempre o botão mais à direita).
   * 2. Fallback: ícone "arrow_forward" (símbolo específico do botão de envio).
   * 3. Fallback: proximidade com o editor Slate (botão mais próximo do input).
   *
   * IMPORTANTE: o React pode re-renderizar quando aria-disabled muda —
   * nunca cachear a referência, chamar esta função a cada iteração.
   * @returns {HTMLButtonElement|null}
   */
  function findCreateButton() {
    // Prioridade 1: button[aria-disabled] — somente o submit usa este atributo no Flow
    // Pega o ÚLTIMO entre os que têm aria-disabled (submit está à direita/fim do DOM)
    const ariaDisabledBtns = Array.from(document.querySelectorAll('button[aria-disabled]'));
    if (ariaDisabledBtns.length > 0) {
      // Se há um com ícone arrow_forward, prefere esse
      const byArrow = ariaDisabledBtns.find(btn =>
        Array.from(btn.querySelectorAll('i')).some(i => (i.textContent || '').trim() === 'arrow_forward')
      );
      if (byArrow) return byArrow;
      // Caso contrário, retorna o último (submit está no final da toolbar)
      return ariaDisabledBtns[ariaDisabledBtns.length - 1];
    }

    // Prioridade 2: ícone arrow_forward em qualquer button
    const byArrowFallback = Array.from(document.querySelectorAll('button')).find(btn =>
      Array.from(btn.querySelectorAll('i')).some(i => (i.textContent || '').trim() === 'arrow_forward')
    );
    if (byArrowFallback) return byArrowFallback;

    // Prioridade 3: botão mais próximo do editor Slate (último botão na toolbar do editor)
    const promptEl = findVisiblePromptInput();
    if (promptEl) {
      let parent = promptEl.parentElement;
      for (let depth = 0; depth < 8; depth++) {
        if (!parent) break;
        const btns = Array.from(parent.querySelectorAll('button:not([disabled])'));
        if (btns.length >= 2) {
          // Exclui botões de menu (têm aria-haspopup) — o submit não tem
          const submitCandidates = btns.filter(b => !b.hasAttribute('aria-haspopup'));
          if (submitCandidates.length > 0) return submitCandidates[submitCandidates.length - 1];
          return btns[btns.length - 1];
        }
        parent = parent.parentElement;
      }
    }

    // Prioridade 4: seletores genéricos como último recurso
    return findElement(GENERATE_BUTTON_SELECTORS) || findButtonByText(GENERATE_BUTTON_TEXTS);
  }

  /**
   * Aguarda o botão "Criar" ficar ativo (aria-disabled=false) e clica nele.
   * Re-busca o botão no DOM a cada iteração para lidar com re-renders do React.
   * @returns {Promise<boolean>}
   */
  async function clickGenerateButton() {
    logToBackground('info', 'Procurando botão de gerar...');

    await sleep(500); // Aguarda o DOM estabilizar

    // Verifica se um botão está realmente ativo (não só presente)
    const isButtonActive = (btn) => btn && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true';

    // Aguarda até 12s pelo botão ativo, re-buscando a cada 500ms
    let activeButton = null;
    for (let i = 0; i < 24; i++) {
      const btn = findCreateButton();
      if (btn) {
        if (isButtonActive(btn)) {
          activeButton = btn;
          break;
        }
        if (i === 0) logToBackground('warning', 'Botão encontrado mas desabilitado — aguardando ficar ativo...');
      } else {
        if (i === 0) logToBackground('warning', 'Botão "Criar" não encontrado — aguardando...');
      }
      await sleep(500);
    }

    // Se não ficou ativo, pega qualquer botão encontrado e clica mesmo assim
    if (!activeButton) {
      activeButton = findCreateButton();
      if (!activeButton) {
        logToBackground('error', 'Botão de gerar não encontrado após 12s');
        return false;
      }
      logToBackground('warning', 'Botão ainda aria-disabled após 12s — clicando mesmo assim');
    }

    activeButton.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    await sleep(200);

    const rect = activeButton.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);

    logToBackground('info', `Clicando botão: "${activeButton.textContent?.trim()?.substring(0, 30)}" em (${cx}, ${cy})`);

    // Estratégia principal: clique via storage→debugger (isTrusted=true, funciona após SPA nav)
    logToBackground('info', `Solicitando clique debugger em (${cx}, ${cy})...`);
    const clickResult = await requestDebuggerClick(cx, cy);
    if (clickResult.ok) {
      logToBackground('info', 'Clique confiável via debugger OK');
      return true;
    }
    logToBackground('warning', `debuggerClick falhou: ${clickResult.error} — usando fallback`);

    // Fallback: eventos sintéticos
    humanClick(activeButton);
    await sleep(100);
    activeButton.click();
    logToBackground('info', 'Clique via humanClick + .click() (fallback)');

    return true;
  }

  // ─────────────────────────────────────────────
  // AGUARDAR GERAÇÃO
  // ─────────────────────────────────────────────

  /**
   * Captura o src/url de uma imagem antes da geração para detectar mudanças.
   * @returns {string|null}
   */
  function captureCurrentImageSrc() {
    const img = findElement(IMAGE_RESULT_SELECTORS);
    return img ? img.src : null;
  }

  /**
   * Verifica se há uma mensagem de bloqueio por política na página.
   * IMPORTANTE: só detecta frases compostas para evitar falsos positivos.
   * Palavras isoladas como "bloqueado" aparecem em menus e labels do Flow.
   * @returns {boolean}
   */
  function checkPolicyBlock() {
    // Verifica elementos específicos de erro de política
    const policyEl = findElement(POLICY_ERROR_SELECTORS);
    if (policyEl) return true;

    // Somente frases compostas específicas de bloqueio por política
    const pageText = document.body?.textContent?.toLowerCase() || '';
    const compoundPhrases = [
      'content policy',
      'política de conteúdo',
      'safety guidelines',
      'diretrizes de segurança',
      'your request was blocked',
      'sua solicitação foi bloqueada',
      'not allowed to generate',
      'não é permitido gerar',
      'violates our policy',
      'viola nossas políticas',
      'request was flagged',
      'solicitação foi sinalizada',
      'image cannot be generated',
      'imagem não pode ser gerada',
    ];
    return compoundPhrases.some(phrase => pageText.includes(phrase));
  }

  /**
   * Verifica se há um spinner/loading indicator visível.
   * @returns {boolean}
   */
  function isLoading() {
    for (const selector of LOADING_SELECTORS) {
      try {
        const el = document.querySelector(selector);
        if (el) {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            return true;
          }
        }
      } catch (e) {
        // Seletor inválido
      }
    }
    return false;
  }

  /**
   * Espera a geração ser concluída observando o DOM.
   *
   * Estratégia de detecção (múltiplas camadas):
   * 1. MutationObserver para detecção imediata de novos elementos
   * 2. Rastreamento de estado de loading (spinner aparece → desaparece)
   * 3. Polling como fallback a cada 1.5s
   * 4. Detecção de canvas para ferramentas que renderizam via canvas
   * 5. Retry com delay para imagens lazy-loaded (naturalWidth=0 inicialmente)
   * 6. Timeout de segurança
   *
   * @param {number} timeoutMs Timeout máximo
   * @returns {Promise<{
   *   status: 'success'|'timeout'|'error'|'policy_blocked',
   *   imageUrl?: string,
   *   imageElement?: Element
   * }>}
   */
  async function waitForGenerationComplete(timeoutMs = 180000) {
    const startTime = Date.now();

    const initialSrcs = new Set(
      Array.from(document.querySelectorAll('img[src]'))
        .map(img => img.src)
        .filter(Boolean)
    );
    const initialCanvasCount = document.querySelectorAll('canvas').length;

    let loadingStarted = false;
    let loadingEnded = false;

    logToBackground('info', `Aguardando geração (timeout: ${timeoutMs / 1000}s)... imagens iniciais: ${initialSrcs.size}`);

    await sleep(1500);

    return new Promise((resolve) => {
      let resolved = false;
      let checkInterval = null;
      let observer = null;

      function doResolve(result) {
        if (resolved) return;
        resolved = true;
        if (observer) { try { observer.disconnect(); } catch (e) {} }
        if (checkInterval) clearInterval(checkInterval);
        resolve(result);
      }

      function isGeneratedImage(img) {
        if (!img.src) return false;
        const src = img.src;
        if (src.includes('generativelanguage.googleapis.com') ||
            src.includes('storage.googleapis.com') ||
            src.includes('imagegeneration') ||
            src.includes('imagen')) {
          return true;
        }
        if (src.includes('gstatic.com') || src.includes('google.com/images') ||
            src.includes('favicon') || src.includes('logo') || src.includes('icon')) {
          return false;
        }
        const w = img.naturalWidth || img.width || img.offsetWidth || img.getBoundingClientRect().width;
        const h = img.naturalHeight || img.height || img.offsetHeight || img.getBoundingClientRect().height;
        return w > 100 || h > 100;
      }

      function checkForNewContent() {
        if (resolved) return;

        if (checkPolicyBlock()) {
          logToBackground('warning', 'Bloqueio por política detectado');
          doResolve({ status: 'policy_blocked' });
          return;
        }

        // Verifica novos img[src]
        const allImgs = Array.from(document.querySelectorAll('img[src]'));
        for (const img of allImgs) {
          if (!initialSrcs.has(img.src) && img.src) {
            if (isGeneratedImage(img)) {
              logToBackground('success', `Nova imagem detectada: ${img.src.substring(0, 80)}`);
              doResolve({ status: 'success', imageUrl: img.src, imageElement: img });
              return;
            }
          }
        }

        // Verifica canvas novo (algumas ferramentas renderizam em canvas)
        if (loadingStarted) {
          const canvases = document.querySelectorAll('canvas');
          if (canvases.length > initialCanvasCount) {
            for (const canvas of canvases) {
              if (canvas.width > 100 && canvas.height > 100) {
                logToBackground('success', `Canvas de geração detectado (${canvas.width}x${canvas.height})`);
                doResolve({ status: 'success', imageUrl: null, imageElement: canvas });
                return;
              }
            }
          }
        }
      }

      // MutationObserver: detecta novos elementos instantaneamente
      try {
        observer = new MutationObserver(() => checkForNewContent());
        observer.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['src', 'width', 'height']
        });
      } catch (e) {
        logToBackground('warning', `MutationObserver falhou: ${e.message}`);
      }

      // Polling de fallback
      checkInterval = setInterval(() => {
        if (resolved) { clearInterval(checkInterval); return; }

        // Verifica sinal de abort do background (stop/restart do worker)
        if (window.__flowWorkerShouldAbort) {
          logToBackground('warning', 'Execução abortada pelo background — aguardando nova instrução');
          doResolve({ status: 'aborted' });
          return;
        }

        // Verifica sinal de abort via storage (stopWorker)
        if (!isContextAlive()) { clearInterval(checkInterval); return; }
        chrome.storage.local.get('flow_cs_abort').then(data => {
          if (data.flow_cs_abort && !resolved) {
            logToBackground('warning', 'Sinal de abort recebido via storage');
            doResolve({ status: 'aborted' });
          }
        }).catch(() => {});

        const elapsed = Date.now() - startTime;

        if (elapsed > timeoutMs) {
          logToBackground('warning', `Timeout após ${elapsed / 1000}s. spinner=${isLoading()} imgs=${document.querySelectorAll('img[src]').length}`);
          doResolve({ status: 'timeout' });
          return;
        }

        const currentlyLoading = isLoading();
        if (currentlyLoading && !loadingStarted) {
          loadingStarted = true;
          logToBackground('info', 'Loading iniciado — geração em andamento');
        }
        if (loadingStarted && !currentlyLoading && !loadingEnded) {
          loadingEnded = true;
          logToBackground('info', 'Loading finalizado — verificando resultado...');
          // Retry com delays para imagens lazy-loaded
          setTimeout(() => checkForNewContent(), 300);
          setTimeout(() => checkForNewContent(), 1000);
          setTimeout(() => checkForNewContent(), 2500);
          setTimeout(() => checkForNewContent(), 5000);
        }

        if (elapsed > 0 && Math.round(elapsed / 1000) % 15 === 0) {
          const totalImgs = document.querySelectorAll('img[src]').length;
          logToBackground('info', `[diag ${Math.round(elapsed/1000)}s] loading=${currentlyLoading} loadingStarted=${loadingStarted} imgs=${totalImgs}`);
        }

        checkForNewContent();

      }, 1500);
    });
  }

  // ─────────────────────────────────────────────
  // CAPTURA DE IMAGEM
  // ─────────────────────────────────────────────

  /**
   * Faz download da imagem como Blob e converte para data URL.
   * Necessário porque o background script não pode acessar diretamente
   * URLs blob do contexto da página.
   * @param {string} imageUrl URL da imagem (pode ser blob:, https:, ou data:)
   * @returns {Promise<string|null>} Data URL da imagem ou null se falhar
   */
  async function captureImageBlob(imageUrl) {
    if (!imageUrl) return null;

    try {
      logToBackground('info', `Capturando imagem: ${imageUrl.substring(0, 80)}`);

      // Se já é uma data URL, retorna diretamente
      if (imageUrl.startsWith('data:')) {
        return imageUrl;
      }

      // Para URLs blob (geradas pelo browser)
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Fetch falhou: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      logToBackground('info', `Blob capturado: ${blob.size} bytes, tipo: ${blob.type}`);

      // Converte para data URL para poder passar via postMessage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('FileReader falhou'));
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      logToBackground('error', `Erro ao capturar blob: ${error.message}`);
      return null;
    }
  }

  /**
   * Tenta encontrar e capturar a melhor imagem disponível na página.
   * Prioriza imagens grandes/recentes sobre ícones e logos.
   * @returns {Promise<{imageUrl: string, blobDataUrl: string|null}|null>}
   */
  async function findAndCaptureImage() {
    // Tenta seletores específicos primeiro
    let bestImage = null;
    let bestSize = 0;

    for (const selector of IMAGE_RESULT_SELECTORS) {
      try {
        const imgs = document.querySelectorAll(selector);
        for (const img of imgs) {
          // Ignora imagens muito pequenas (ícones, logos)
          const area = img.naturalWidth * img.naturalHeight;
          if (area > bestSize && img.naturalWidth > 100) {
            bestSize = area;
            bestImage = img;
          }
        }
      } catch (e) {
        // Seletor inválido
      }
    }

    // Fallback: procura qualquer imagem grande na página
    if (!bestImage) {
      const allImgs = document.querySelectorAll('img');
      for (const img of allImgs) {
        if (img.naturalWidth > 200 && img.naturalHeight > 200) {
          const src = img.src || '';
          // Ignora logos e recursos do Google
          if (!src.includes('google.com') && !src.includes('gstatic.com') && !src.includes('favicon')) {
            const area = img.naturalWidth * img.naturalHeight;
            if (area > bestSize) {
              bestSize = area;
              bestImage = img;
            }
          }
        }
      }
    }

    if (!bestImage) {
      logToBackground('error', 'Nenhuma imagem encontrada na página');
      return null;
    }

    const imageUrl = bestImage.src;
    logToBackground('info', `Melhor imagem encontrada: ${bestImage.naturalWidth}x${bestImage.naturalHeight}px`);

    const blobDataUrl = await captureImageBlob(imageUrl);

    return { imageUrl, blobDataUrl };
  }

  // ─────────────────────────────────────────────
  // COMUNICAÇÃO COM BACKGROUND
  // ─────────────────────────────────────────────

  /**
   * Envia log para o background script para ser registrado centralmente.
   * @param {'info'|'success'|'warning'|'error'} level
   * @param {string} message
   */
  function logToBackground(level, message) {
    console.log(`[FlowCS][${level.toUpperCase()}] ${message}`);
    if (!isContextAlive()) return; // extensão foi recarregada — contexto inválido
    try {
      chrome.storage.local.set({ flow_cs_log: { level, message, time: Date.now() } }).catch(() => {});
    } catch (_) {}
  }

  /**
   * Envia resultado da geração para o background via chrome.storage.local.
   * Mais confiável que runtime.sendMessage após navegação SPA (pushState).
   * @param {object} result - { type: 'complete'|'failed'|'blocked', ...dados }
   */
  function sendResult(result) {
    const preview = result.type === 'complete'
      ? `complete imageUrl=${result.imageUrl ? result.imageUrl.substring(0,60) : 'blob'}`
      : `${result.type}${result.reason ? ': ' + result.reason.substring(0,80) : ''}`;
    logToBackground(result.type === 'complete' ? 'success' : 'warning', `[CS] sendResult → ${preview}`);
    if (!isContextAlive()) return;
    try {
      chrome.storage.local.set({ flow_cs_result: { ...result, time: Date.now() } }).catch(() => {});
    } catch (_) {}
  }

  /**
   * Avisa o background que vamos navegar para um projeto.
   * Usa storage.local em vez de runtime.sendMessage — mais confiável após SPA nav.
   */
  async function notifyGalleryNavigating(prompt, timeoutMs, orientation) {
    if (!isContextAlive()) return;
    try {
      await chrome.storage.local.set({
        flow_cs_gallery_navigating: {
          prompt, timeoutMs, orientation, startedAt: Date.now(), time: Date.now()
        }
      });
    } catch (_) {}
  }

  /**
   * Solicita um clique confiável (isTrusted=true) ao background via debugger.
   * Usa storage.local porque runtime.sendMessage falha após SPA navigation.
   * @param {number} x
   * @param {number} y
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async function requestDebuggerClick(x, y) {
    if (!isContextAlive()) return { ok: false, error: 'Contexto inválido' };
    try {
      await chrome.storage.local.remove('flow_cs_click_result');
      await chrome.storage.local.set({ flow_cs_click_at: { x, y, time: Date.now() } });

      // Aguarda o background processar o clique (polling até 5s)
      for (let i = 0; i < 20; i++) {
        await sleep(250);
        if (!isContextAlive()) return { ok: false, error: 'Contexto inválido' };
        const data = await chrome.storage.local.get('flow_cs_click_result');
        if (data.flow_cs_click_result) {
          await chrome.storage.local.remove('flow_cs_click_result');
          return data.flow_cs_click_result;
        }
      }
      return { ok: false, error: 'Timeout aguardando resposta do clique' };
    } catch (_) {
      return { ok: false, error: 'Contexto inválido' };
    }
  }

  /**
   * Solicita digitação de texto via CDP Input.insertText (isTrusted=true).
   * O background executa Ctrl+A → Delete → insertText sobre a aba ativa.
   * @param {string} text
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async function requestDebuggerTyping(text) {
    if (!isContextAlive()) return { ok: false, error: 'Contexto inválido' };
    try {
      await chrome.storage.local.remove('flow_cs_type_result');
      await chrome.storage.local.set({ flow_cs_type_at: { text, time: Date.now() } });

      for (let i = 0; i < 40; i++) {
        await sleep(250);
        if (!isContextAlive()) return { ok: false, error: 'Contexto inválido' };
        const data = await chrome.storage.local.get('flow_cs_type_result');
        if (data.flow_cs_type_result) {
          await chrome.storage.local.remove('flow_cs_type_result');
          return data.flow_cs_type_result;
        }
      }
      return { ok: false, error: 'Timeout aguardando digitação CDP' };
    } catch (_) {
      return { ok: false, error: 'Contexto inválido' };
    }
  }

  // ─────────────────────────────────────────────
  // MODAL E NAVEGAÇÃO DO GOOGLE FLOW
  // ─────────────────────────────────────────────

  /**
   * Fecha qualquer modal de boas-vindas/migração do Flow se presente.
   * @returns {Promise<boolean>} true se encontrou e fechou algum modal
   */
  async function dismissFlowModal() {
    // Textos de botões que indicam "aceitar / começar"
    const acceptTexts = [
      'comece a usar o flow', 'start using flow', 'get started',
      'começar', 'start', 'continue', 'continuar', 'ok', 'entendido', 'got it'
    ];

    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    for (const btn of buttons) {
      const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase().trim();
      if (acceptTexts.some(t => text.includes(t))) {
        logToBackground('info', `Fechando modal: "${btn.textContent?.trim()}"`);
        humanClick(btn);
        await sleep(1500);
        return true;
      }
    }

    // Tenta fechar pelo botão X do modal
    const closeBtn = document.querySelector(
      '[aria-label*="close" i], [aria-label*="fechar" i], [aria-label*="dismiss" i], [data-dismiss], .modal-close'
    );
    if (closeBtn) {
      logToBackground('info', 'Fechando modal via botão X');
      humanClick(closeBtn);
      await sleep(1000);
      return true;
    }

    return false;
  }

  /**
   * Encontra a aba de orientação pelo aria-controls/id OU pelo texto visível (16:9 / 9:16).
   * @param {'LANDSCAPE'|'PORTRAIT'} orientation
   * @returns {Element|null}
   */
  function findOrientationTab(orientation) {
    const targetText = orientation === 'PORTRAIT' ? '9:16' : '16:9';

    // 1. Por aria-controls ou id contendo LANDSCAPE/PORTRAIT
    const byAttr = Array.from(document.querySelectorAll('[role="tab"]')).find(tab => {
      const controls = tab.getAttribute('aria-controls') || '';
      const id = tab.id || '';
      return controls.includes(orientation) || id.includes(orientation);
    });
    if (byAttr) return byAttr;

    // 2. Por texto visível "16:9" ou "9:16" em qualquer elemento clicável
    const clickables = document.querySelectorAll('[role="tab"], button, [role="button"]');
    for (const el of clickables) {
      const text = (el.textContent || '').trim();
      if (text === targetText || text.includes(targetText)) return el;
    }

    // 3. Por ícone crop_16_9 / crop_9_16 dentro de tab/button (sem ser o botão principal de config)
    const iconName = orientation === 'PORTRAIT' ? 'crop_9_16' : 'crop_16_9';
    for (const el of clickables) {
      const icons = el.querySelectorAll('i');
      for (const icon of icons) {
        if ((icon.textContent || '').trim() === iconName) return el;
      }
    }

    return null;
  }

  /**
   * Clica no botão de configuração de imagem (ex: "Nano Banana 2" com ícone crop_16_9)
   * e seleciona a aba de orientação correta (LANDSCAPE = 16:9, PORTRAIT = 9:16).
   * Se a aba já estiver selecionada, não faz nada.
   * @param {'LANDSCAPE'|'PORTRAIT'} orientation
   * @returns {Promise<boolean>}
   */
  async function selectAspectRatio(orientation = 'LANDSCAPE') {
    // Verifica se a aba correta já está visível e selecionada (sem precisar abrir menu)
    const tabAlready = findOrientationTab(orientation);
    if (tabAlready && tabAlready.getAttribute('aria-selected') === 'true') {
      logToBackground('info', `Orientação ${orientation} já selecionada`);
      return true;
    }

    // Botão de configuração: aria-haspopup="menu" com ícone crop_* (não é o botão de tipo)
    const CROP_ICONS = ['crop_16_9', 'crop_9_16', 'crop_square', 'crop_3_2', 'crop_5_4', 'crop_landscape', 'crop_portrait'];
    const configBtn = Array.from(document.querySelectorAll('button[aria-haspopup="menu"]')).find(btn => {
      const icons = btn.querySelectorAll('i');
      for (const icon of icons) {
        if (CROP_ICONS.includes((icon.textContent || '').trim())) return true;
      }
      return false;
    });

    if (!configBtn) {
      logToBackground('info', 'Botão de config de tamanho não encontrado — usando padrão');
      return false;
    }

    logToBackground('info', `Abrindo configuração de imagem para selecionar ${orientation}`);
    humanClick(configBtn);

    // Aguarda o painel abrir com polling (até 3s)
    let targetTab = null;
    for (let i = 0; i < 12; i++) {
      await sleep(250);
      targetTab = findOrientationTab(orientation);
      if (targetTab) break;
    }

    if (!targetTab) {
      logToBackground('warning', `Aba ${orientation} não encontrada após abrir config — mantendo padrão`);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return false;
    }

    if (targetTab.getAttribute('aria-selected') !== 'true') {
      logToBackground('info', `Selecionando aba ${orientation}`);
      humanClick(targetTab);
      await sleep(500);
    } else {
      logToBackground('info', `Orientação ${orientation} já estava selecionada no painel`);
    }

    // Fecha o painel
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(300);
    return true;
  }

  /**
   * Após "Novo projeto", o Flow abre painel com botão de tipo ("Vídeo · 10s").
   * Clica nesse botão e seleciona "Imagem" no menu para mudar para geração de imagem.
   * Orientação 16:9 já é padrão — não precisa alterar.
   */
  async function selectImageType() {
    // Botão de tipo tem aria-haspopup="menu" e texto com "vídeo"/"video"
    const allBtns = Array.from(document.querySelectorAll('button[aria-haspopup="menu"]'));
    const typeBtn = allBtns.find(btn => {
      const t = (btn.textContent || '').toLowerCase();
      return t.includes('vídeo') || t.includes('video') || t.includes('s ·') || t.includes('· ');
    });

    if (!typeBtn) {
      logToBackground('info', 'Botão de tipo não encontrado (já está em modo Imagem?)');
      return false;
    }

    logToBackground('info', `Clicando botão de tipo: "${typeBtn.textContent?.trim().replace(/\s+/g,' ').substring(0, 40)}"`);
    humanClick(typeBtn);
    await sleep(1000);

    // Procura opção "Imagem" no menu aberto (role="menuitem", menuitemradio, option, ou button)
    const menuItems = Array.from(document.querySelectorAll(
      '[role="menuitem"], [role="menuitemradio"], [role="option"], [role="menuitem"] *'
    ));
    const imageItem = menuItems.find(el => {
      const t = (el.textContent || '').toLowerCase().trim();
      return t === 'imagem' || t === 'image' || t.startsWith('imagem') || t.startsWith('image');
    }) || Array.from(document.querySelectorAll('button, [role="button"]')).find(el => {
      const t = (el.textContent || '').toLowerCase().trim();
      return t === 'imagem' || t === 'image';
    });

    if (imageItem) {
      logToBackground('info', `Selecionando "Imagem": "${imageItem.textContent?.trim()}"`);
      humanClick(imageItem);
      await sleep(1200);
      return true;
    }

    logToBackground('warning', 'Opção "Imagem" não encontrada no menu — tentando fechar e continuar');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return false;
  }

  /**
   * Garante que estamos na interface de criação de imagem do Flow.
   * Fluxo: fechar modal → (só se na galeria) clicar "Novo projeto" → trocar tipo Video→Imagem
   * Se já estiver dentro de um projeto (/project/ na URL), pula direto para verificar o editor.
   * @returns {Promise<boolean>}
   */
  async function ensureImageCreationUI() {
    // Passo 1: fechar modal de migração se presente
    await dismissFlowModal();
    await sleep(300);

    // Passo 2: se URL já é de um projeto Flow OU o editor já está visível — não navega.
    // Flow usa /flow/UUID (não /project/), então checamos o padrão de UUID no path.
    const inProject = window.location.href.includes('/project/') ||
      /\/flow\/[0-9a-f-]{30,}/i.test(window.location.href);
    if (inProject || findVisiblePromptInput()) {
      if (inProject) logToBackground('info', 'Já dentro do projeto Flow — aguardando editor...');
      await selectImageType(); // no-op se já está em modo Imagem
      // Aguarda o editor estar disponível — pode demorar enquanto React hidrata
      // Usa mais iterações quando estamos em URL de projeto (CS recém-injetado)
      const maxWait = inProject ? 30 : 10;
      for (let i = 0; i < maxWait; i++) {
        if (findVisiblePromptInput()) return true;
        await sleep(500);
      }
      return !!findVisiblePromptInput();
    }

    // Passo 3: estamos na galeria — clicar em "Novo projeto"
    // O botão tem data-type="button-overlay" num div interno que intercepta o elementFromPoint,
    // fazendo humanClick disparar eventos no overlay em vez do <button>.
    // Solução: buscar o <button> diretamente e chamar .click() nativo (React escuta via root).
    const NEW_PROJECT_TEXTS = ['novo projeto', 'new project'];

    function findNewProjectBtn() {
      // Prioridade 1: <button> cujo textContent inclui "novo projeto" ou "new project"
      for (const btn of document.querySelectorAll('button')) {
        const t = (btn.textContent || '').toLowerCase();
        if (NEW_PROJECT_TEXTS.some(p => t.includes(p))) return btn;
      }
      // Prioridade 2: qualquer elemento clicável com o mesmo texto
      for (const el of document.querySelectorAll('a, [role="button"]')) {
        const t = (el.textContent || '').toLowerCase();
        if (NEW_PROJECT_TEXTS.some(p => t.includes(p))) return el;
      }
      return null;
    }

    // Aguarda até 6s pelo botão aparecer (página pode ainda estar carregando)
    let newBtn = null;
    for (let i = 0; i < 12; i++) {
      newBtn = findNewProjectBtn();
      if (newBtn) break;
      await sleep(500);
    }

    if (!newBtn) {
      const clickableTexts = Array.from(document.querySelectorAll('button'))
        .map(el => (el.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 50))
        .filter(t => t.length > 1)
        .slice(0, 25)
        .join(' | ');
      logToBackground('error', `"Novo projeto" não encontrado. Botões na página: ${clickableTexts}`);
      return false;
    }

    logToBackground('info', `Clicando em "Novo projeto" via debugger: "${(newBtn.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 50)}"`);

    // Google Flow exige isTrusted=true — usa requestDebuggerClick via storage
    {
      const rect = newBtn.getBoundingClientRect();
      const cx = Math.round(rect.left + rect.width / 2);
      const cy = Math.round(rect.top + rect.height / 2);
      logToBackground('info', `Solicitando clique debugger em (${cx}, ${cy})...`);
      const clickResult = await requestDebuggerClick(cx, cy);
      if (clickResult.ok) {
        logToBackground('info', `Clique via debugger OK (${cx}, ${cy})`);
      } else {
        logToBackground('warning', `debuggerClick falhou (${clickResult.error}) — fallback .click()`);
        newBtn.click();
        await sleep(200);
        humanClick(newBtn);
      }
    }

    // Aguarda a UI de criação carregar (até 12s)
    for (let i = 0; i < 24; i++) {
      await sleep(500);
      if (findVisiblePromptInput() || document.querySelector('button[aria-haspopup="menu"]')) break;
    }

    // Passo 4: trocar tipo para Imagem (padrão é "Vídeo · 10s")
    await selectImageType();

    // Passo 5: aguardar editor de prompt ficar disponível (até 6s)
    for (let i = 0; i < 12; i++) {
      await sleep(500);
      if (findVisiblePromptInput()) return true;
    }

    logToBackground('error', 'Editor de prompt não apareceu após selecionar Imagem');
    return false;
  }

  // ─────────────────────────────────────────────
  // FLUXO PRINCIPAL — execução de um prompt
  // ─────────────────────────────────────────────

  /**
   * Executa o fluxo completo: inserir prompt → configurar tamanho → clicar gerar → aguardar → capturar imagem.
   * @param {string} prompt
   * @param {number} timeoutMs
   * @param {'LANDSCAPE'|'PORTRAIT'} orientation
   */
  async function executeGenerationFlow(prompt, timeoutMs, orientation = 'LANDSCAPE') {
    // Verifica abort imediatamente (pode ter sido sinalizado antes de chegarmos aqui)
    if (window.__flowWorkerShouldAbort) return;

    logToBackground('info', `Iniciando fluxo de geração...`);

    // 1. Verifica estado da página
    const pageState = detectPageState();
    logToBackground('info', `Estado da página: ${JSON.stringify(pageState)}`);

    if (!pageState.isFlowPage) {
      sendResult({ type: 'failed', reason: 'Página não é o Google Flow' });
      return;
    }

    if (pageState.isRateLimited) {
      sendResult({ type: 'failed', reason: 'Rate limit atingido — aguarde antes de tentar novamente' });
      return;
    }

    // 2. Se estamos na galeria (sem editor visível), precisamos criar um novo projeto.
    // Clicar em "Novo projeto" NAVEGA para uma nova URL — este context script morre.
    // Portanto, avisamos o background (que sobrevive à navegação) para re-enviar o
    // prompt assim que o projeto carregar, e então clicamos e retornamos imediatamente.
    //
    // DETECÇÃO PRIMÁRIA: URL. Projeto do Flow tem UUID no path: /flow/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    // Galeria não tem UUID — só /flow ou /flow?from=imagefx.
    // Isso é mais confiável que checar o DOM (que pode ainda estar hidratando React).
    const isFlowProjectUrl = /\/flow\/[0-9a-f-]{30,}/i.test(window.location.href);
    const NEW_PROJECT_TEXTS_CHECK = ['novo projeto', 'new project'];
    const hasNewProjectBtn = !!Array.from(document.querySelectorAll('button')).find(b =>
      NEW_PROJECT_TEXTS_CHECK.some(t => (b.textContent || '').toLowerCase().includes(t))
    );
    const hasSlateEditor = !!document.querySelector('[data-slate-editor="true"]');
    // isOnGallery = true apenas se URL NÃO tem UUID de projeto (galeria) E o botão existe E sem editor
    const isOnGallery = !isFlowProjectUrl && hasNewProjectBtn && !hasSlateEditor;
    logToBackground('info', `Detecção: isFlowProjectUrl=${isFlowProjectUrl} hasNewProjectBtn=${hasNewProjectBtn} hasSlateEditor=${hasSlateEditor} isOnGallery=${isOnGallery}`);
    if (isOnGallery) {
      logToBackground('info', 'Galeria detectada — avisando background e criando novo projeto...');

      // Avisa background via storage: "vou navegar, re-envie o prompt quando o projeto carregar".
      // Usa storage.local porque runtime.sendMessage falha após SPA nav (pushState).
      try {
        await notifyGalleryNavigating(prompt, timeoutMs, orientation);
        logToBackground('info', 'Background avisado via storage (GALLERY_NAVIGATING)');
      } catch (e) {
        logToBackground('warning', `Aviso ao background falhou: ${e.message}`);
      }

      // Encontra e clica em "Novo projeto"
      const NEW_PROJECT_TEXTS = ['novo projeto', 'new project'];
      function findNewBtn() {
        for (const btn of document.querySelectorAll('button')) {
          const t = (btn.textContent || '').toLowerCase();
          if (NEW_PROJECT_TEXTS.some(p => t.includes(p))) return btn;
        }
        for (const el of document.querySelectorAll('a, [role="button"]')) {
          const t = (el.textContent || '').toLowerCase();
          if (NEW_PROJECT_TEXTS.some(p => t.includes(p))) return el;
        }
        return null;
      }

      // Aguarda até 6s pelo botão aparecer
      let newBtn = null;
      for (let i = 0; i < 12; i++) {
        newBtn = findNewBtn();
        if (newBtn) break;
        await sleep(500);
      }

      if (!newBtn) {
        const allBtnTexts = Array.from(document.querySelectorAll('button'))
          .map(b => (b.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 40))
          .filter(t => t.length > 1).slice(0, 20).join(' | ');
        logToBackground('error', `"Novo projeto" não encontrado. Botões: ${allBtnTexts}`);
        sendResult({ type: 'failed', reason: '"Novo projeto" não encontrado na galeria' });
        return;
      }

      logToBackground('info', `Clicando "Novo projeto" via debugger: "${(newBtn.textContent||'').trim().replace(/\s+/g,' ').substring(0,40)}"`);
      // Google Flow exige isTrusted=true — usa requestDebuggerClick via storage.
      // (runtime.sendMessage falha após SPA navigation, storage funciona sempre)
      {
        const rect = newBtn.getBoundingClientRect();
        const cx = Math.round(rect.left + rect.width / 2);
        const cy = Math.round(rect.top + rect.height / 2);
        logToBackground('info', `Solicitando clique debugger em (${cx}, ${cy})...`);
        const clickResult = await requestDebuggerClick(cx, cy);
        if (clickResult.ok) {
          logToBackground('info', `Clique via debugger OK (${cx}, ${cy})`);
        } else {
          logToBackground('warning', `debuggerClick falhou (${clickResult.error}) — fallback .click()`);
          newBtn.click();
          await sleep(200);
          humanClick(newBtn);
        }
      }

      // Aguarda o editor Slate aparecer (até 30s).
      // Para SPA (React history.pushState): a página não recarrega, o CS sobrevive,
      //   o editor aparece no DOM → caímos no código de geração abaixo sem depender do background.
      // Para full-page-load: o contexto CS é destruído ao navegar e nunca chegamos ao timeout;
      //   o background detecta via tabs.onUpdated e reinjeta.
      logToBackground('info', 'Aguardando editor de imagem aparecer...');
      let editorReady = false;
      for (let w = 0; w < 60; w++) { // até 30s (60 × 500ms)
        await sleep(500);
        if (document.querySelector('[data-slate-editor="true"]')) {
          logToBackground('info', `Editor apareceu após ${((w + 1) * 0.5).toFixed(1)}s — continuando via SPA (sem re-envio)`);
          // CS sobreviveu à SPA nav — avisa o SW para cancelar o Branch 1 antes de ele re-enviar
          try { await chrome.storage.local.set({ flow_cs_cancel_gallery_nav: { time: Date.now() } }); } catch (_) {}
          editorReady = true;
          break;
        }
      }

      if (!editorReady) {
        // SPA e editor não apareceu — não deve acontecer, mas protege contra loops.
        logToBackground('warning', 'Editor não apareceu em 30s após criar projeto.');
        sendResult({ type: 'failed', reason: 'Editor não apareceu após criar novo projeto' });
        return;
      }

      await sleep(800); // aguarda React estabilizar o editor
      // Cai no passo 3 abaixo (ensureImageCreationUI) normalmente
    }

    // 3. Garante que está na interface de criação de imagem (já estamos num projeto)
    const uiReady = await ensureImageCreationUI();
    if (!uiReady) {
      sendResult({ type: 'failed', reason: 'Interface de criação de imagem não encontrada. Abra um projeto de imagem manualmente.' });
      return;
    }

    await selectAspectRatio(orientation);

    const promptInserted = await insertPrompt(prompt);
    if (!promptInserted) {
      sendResult({ type: 'failed', reason: 'Não foi possível inserir o prompt — campo de texto não encontrado' });
      return;
    }

    await sleep(600);

    const buttonClicked = await clickGenerateButton();
    if (!buttonClicked) {
      sendResult({ type: 'failed', reason: 'Botão de gerar não encontrado ou desabilitado' });
      return;
    }

    logToBackground('info', 'Prompt inserido e geração iniciada. Aguardando resultado...');

    const result = await waitForGenerationComplete(timeoutMs);

    if (result.status === 'aborted') {
      // Não envia resultado — a nova execução (iniciada pelo SEND_PROMPT que causou o abort)
      // enviará o resultado quando terminar. O polling loop do background continua aguardando.
      return;
    }

    if (result.status === 'policy_blocked') {
      sendResult({ type: 'blocked' });
      return;
    }

    if (result.status === 'timeout') {
      sendResult({ type: 'failed', reason: `Timeout de ${timeoutMs / 1000}s atingido sem resultado` });
      return;
    }

    if (result.status === 'error') {
      sendResult({ type: 'failed', reason: 'Erro detectado na página durante geração' });
      return;
    }

    logToBackground('success', 'Geração concluída! Capturando imagem...');
    await sleep(800);

    if (!result.imageUrl && result.imageElement instanceof HTMLCanvasElement) {
      try {
        const blobDataUrl = result.imageElement.toDataURL('image/png');
        if (blobDataUrl && blobDataUrl.length > 100) {
          logToBackground('success', 'Imagem capturada via canvas.toDataURL()');
          sendResult({ type: 'complete', blobDataUrl });
          return;
        }
      } catch (e) {
        logToBackground('error', `canvas.toDataURL() falhou: ${e.message}`);
      }
    }

    const imageUrl = result.imageUrl;
    if (!imageUrl) {
      const fallback = await findAndCaptureImage();
      if (fallback?.blobDataUrl) {
        sendResult({ type: 'complete', blobDataUrl: fallback.blobDataUrl });
      } else if (fallback?.imageUrl) {
        sendResult({ type: 'complete', imageUrl: fallback.imageUrl });
      } else {
        sendResult({ type: 'failed', reason: 'URL da imagem não capturada' });
      }
      return;
    }

    const blobDataUrl = await captureImageBlob(imageUrl);
    if (blobDataUrl) {
      sendResult({ type: 'complete', blobDataUrl });
    } else {
      sendResult({ type: 'complete', imageUrl });
    }
  }

  // ─────────────────────────────────────────────
  // HANDLER DE MENSAGENS DO BACKGROUND
  // ─────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {

      case 'PING': {
        // Background verifica se o content script está vivo
        sendResponse({ status: 'PONG', url: window.location.href, pageState: detectPageState() });
        return false;
      }

      case 'SEND_PROMPT': {
        // Background pede para executar um prompt
        const { prompt, timeoutMs = 180000, orientation = 'LANDSCAPE' } = message;

        logToBackground('info', `[CS] SEND_PROMPT recebido — URL: ${window.location.href.split('?')[0]}`);

        if (!prompt || !prompt.trim()) {
          logToBackground('warning', '[CS] Prompt vazio — ignorando');
          sendResponse({ ok: false, error: 'Prompt vazio' });
          return false;
        }

        if (window.__flowWorkerRunning) {
          // Aborta a execução anterior e inicia a nova.
          // Não escreve resultado agora — a nova execução escreverá quando terminar.
          // O polling loop em sendPromptToTab continua aguardando o resultado da nova run.
          window.__flowWorkerShouldAbort = true;
          logToBackground('warning', 'SEND_PROMPT: abortando execução anterior para reiniciar...');
          sendResponse({ ok: true, message: 'Abortando e reiniciando' });

          setTimeout(() => {
            window.__flowWorkerShouldAbort = false;
            window.__flowWorkerRunning = true;
            executeGenerationFlow(prompt, timeoutMs, orientation)
              .catch(error => {
                logToBackground('error', `Erro no fluxo (após abort): ${error.message}`);
                sendResult({ type: 'failed', reason: error.message });
              })
              .finally(() => { window.__flowWorkerRunning = false; });
          }, 600);

          return false;
        }

        window.__flowWorkerRunning = true;
        sendResponse({ ok: true, message: 'Iniciando geração...' });

        executeGenerationFlow(prompt, timeoutMs, orientation)
          .catch(error => {
            logToBackground('error', `Erro no fluxo de geração: ${error.message}`);
            sendResult({ type: 'failed', reason: error.message });
          })
          .finally(() => {
            window.__flowWorkerRunning = false;
          });

        return false;
      }

      case 'GET_PAGE_STATE': {
        sendResponse({ ok: true, pageState: detectPageState() });
        return false;
      }

      default:
        // Mensagem desconhecida — não responde
        return false;
    }
  });

  // ─────────────────────────────────────────────
  // ANÚNCIO DE PRESENÇA
  // ─────────────────────────────────────────────

  // Avisa o background que o content script está pronto
  logToBackground('info', `Content script ativo em: ${window.location.href}`);

  console.log('[FlowCS] Inicialização concluída. Pronto para receber prompts.');

})();
