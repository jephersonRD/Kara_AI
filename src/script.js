/**
 * KARA AI — script.js
 * Dual provider: Google Gemini + Groq (Llama, Qwen, GPT-OSS, Compound...)
 * Optimizado para Hyprland · bajo consumo
 */

// ═══════════════════════════════════════════════
//  API KEYS (leídas desde config inyectado por Python)
// ═══════════════════════════════════════════════

let KEYS = {
  gemini: '',
  groq: '',
  openrouter: '',
};

function loadKeysFromConfig() {
  const cfg = window.__KARA_CONFIG__;
  if (cfg) {
    KEYS.gemini = cfg.gemini || '';
    KEYS.groq = cfg.groq || '';
    KEYS.openrouter = cfg.openrouter || '';
  }
}

async function saveConfigToFile() {
  try {
    await fetch('http://127.0.0.1:18234/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(KEYS),
    });
  } catch {}
}

// ═══════════════════════════════════════════════
//  CATÁLOGO DE MODELOS
// ═══════════════════════════════════════════════

const MODEL_CATALOG = {
  groq: [
    { id: 'llama-3.3-70b-versatile',                        label: 'Llama 3.3 70B',      desc: 'Versátil · 128K ctx',    badge: 'FAST',  type: 'fast',  isDefault: true },
    { id: 'llama-3.1-8b-instant',                           label: 'Llama 3.1 8B',       desc: 'Ultra rápido · ligero',  badge: 'LITE',  type: 'lite'  },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct',      label: 'Llama 4 Scout',      desc: 'MoE · visión · 128K',    badge: 'NEW',   type: 'new'   },
    { id: 'meta-llama/llama-4-maverick-17b-128e-instruct',  label: 'Llama 4 Maverick',   desc: '128 expertos · 128K',    badge: 'NEW',   type: 'new'   },
    { id: 'qwen/qwen3-32b',                                 label: 'Qwen 3 32B',         desc: 'Razonamiento + tools',   badge: 'THINK', type: 'think' },
    { id: 'openai/gpt-oss-120b',                            label: 'GPT-OSS 120B',       desc: 'OpenAI open-weight',     badge: 'PRO',   type: 'pro'   },
    { id: 'groq/compound',                                  label: 'Compound',           desc: 'Web search + código',    badge: 'AGENT', type: 'agent' },
    { id: 'groq/compound-mini',                             label: 'Compound Mini',      desc: 'Agente ligero',          badge: 'AGENT', type: 'agent' },
  ],
  gemini: [
    { id: 'gemini-2.5-flash-preview-04-17',  label: '2.5 Flash',  desc: 'Rápido · recomendado',  badge: 'FAST', type: 'fast', isDefault: true },
    { id: 'gemini-2.0-flash',                label: '2.0 Flash',  desc: 'Estable y eficiente',   badge: 'FAST', type: 'fast' },
    { id: 'gemini-2.0-flash-lite',           label: 'Flash Lite', desc: 'Ultra ligero',          badge: 'LITE', type: 'lite' },
    { id: 'gemini-2.5-pro-preview-03-25',    label: '2.5 Pro',    desc: 'Máxima capacidad',      badge: 'PRO',  type: 'pro'  },
  ],
  openrouter: [
    { id: 'openrouter/free',                         label: 'Free Router',    desc: 'Auto · mejor gratis',   badge: 'AGENT', type: 'agent', isDefault: true },
    { id: 'google/gemma-3-27b-it:free',              label: 'Gemma 3 27B',    desc: 'Gratuito · 131K ctx',   badge: 'PRO',  type: 'pro'  },
    { id: 'google/gemma-3-4b-it:free',               label: 'Gemma 3 4B',     desc: 'Gratuito · ligero',     badge: 'LITE', type: 'lite' },
    { id: 'arcee-ai/trinity-mini:free',              label: 'Trinity Mini',   desc: 'Gratuito · 131K ctx',   badge: 'FAST', type: 'fast' },
    { id: 'z-ai/glm-4.5-air:free',                   label: 'GLM 4.5 Air',    desc: 'Gratuito · 131K ctx',   badge: 'NEW',  type: 'new'  },
    { id: 'stepfun/step-3.5-flash:free',             label: 'Step 3.5 Flash', desc: 'Gratuito · 256K ctx',   badge: 'FAST', type: 'fast' },
    { id: 'liquid/lfm-2.5-1.2b-instruct:free',       label: 'LFM 1.2B',       desc: 'Gratuito · ultra ligero',badge: 'LITE', type: 'lite' },
  ],
};

const ENDPOINTS = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  groq:   'https://api.groq.com/openai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

// ═══════════════════════════════════════════════
//  STORAGE + RETRY CONFIG
// ═══════════════════════════════════════════════

const STORAGE_KEY      = 'karaai_history';
const STORAGE_DATE     = 'karaai_date';
const STORAGE_MODEL    = 'karaai_model';
const STORAGE_PROVIDER = 'karaai_provider';
const STORAGE_CONVERSATIONS = 'karaai_conversations';
const STORAGE_CURRENT_CHAT  = 'karaai_current_chat';
const STORAGE_THEME    = 'karaai_theme';
const MAX_RETRIES      = 3;
const RETRY_BASE_MS    = 3000;
const GEN_CONFIG       = { temperature: 0.8, max_tokens: 2048 };

const SYSTEM_PROMPT = `Eres Kara, una asistente de IA inteligente, concisa y amigable integrada como widget de escritorio en Linux/Hyprland. Responde de forma clara y útil. Usa Markdown para código y formato cuando sea apropiado. Si el usuario escribe en español, responde en español.`;

// ═══════════════════════════════════════════════
//  ESTADO
// ═══════════════════════════════════════════════

let currentProvider     = localStorage.getItem(STORAGE_PROVIDER) || 'groq';
let currentModel        = localStorage.getItem(STORAGE_MODEL)    || 'llama-3.3-70b-versatile';
let conversationHistory = [];
let isLoading           = false;
let abortController     = null;
let conversations       = [];
let currentChatId       = null;
let apiConfigured       = false;

// ═══════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════

const messagesArea   = document.getElementById('messagesArea');
const userInput      = document.getElementById('userInput');
const sendBtn        = document.getElementById('sendBtn');
const stopBtn        = document.getElementById('stopBtn');
const clearBtn       = document.getElementById('clearBtn');
const modelBtn       = document.getElementById('modelBtn');
const modelLabel     = document.getElementById('modelLabel');
const modelDropdown  = document.getElementById('modelDropdown');
const modelIndicator = document.getElementById('modelIndicator');
const charCount      = document.getElementById('charCount');
const tokenCount     = document.getElementById('tokenCount');
const pingSound      = document.getElementById('pingSound');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarToggle  = document.getElementById('sidebarToggle');
const newChatBtn     = document.getElementById('newChatBtn');
const chatList       = document.getElementById('chatList');
const themeToggle    = document.getElementById('themeToggle');
const statMessages   = document.getElementById('statMessages');
const statTime       = document.getElementById('statTime');
const rateIndicator  = document.getElementById('rateIndicator');
const rateText       = document.getElementById('rateText');
const statusDot      = document.querySelector('.status-dot');
const statusText     = document.querySelector('.status-text');
const apiOverlay     = document.getElementById('apiOverlay');
const apiContinueBtn = document.getElementById('apiContinueBtn');
const apiStatus      = document.getElementById('apiStatus');
const apiBtn         = document.getElementById('apiBtn');

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════

function init() {
  loadKeysFromConfig();
  migrateOldData();
  loadConversations();
  if (!conversations.length) createNewChat();
  else {
    currentChatId = localStorage.getItem(STORAGE_CURRENT_CHAT) || conversations[0].id;
    if (!conversations.find(c => c.id === currentChatId)) currentChatId = conversations[0].id;
  }
  loadCurrentChat();
  restoreState();
  bindEvents();
  initTheme();
  initConnectionMonitor();
  renderChatList();
  initApiOverlay();
  userInput.focus();
}

// ═══════════════════════════════════════════════
//  API KEY OVERLAY
// ═══════════════════════════════════════════════

function hasAnyKey() {
  return !!(KEYS.groq || KEYS.gemini || KEYS.openrouter);
}

function getValidProviders() {
  const p = [];
  if (KEYS.groq) p.push('groq');
  if (KEYS.gemini) p.push('gemini');
  if (KEYS.openrouter) p.push('openrouter');
  return p;
}

function initApiOverlay() {
  if (hasAnyKey()) {
    apiOverlay.classList.add('hidden');
    apiConfigured = true;
    buildModelDropdown();
    restoreState();
    return;
  }

  // Mostrar overlay, ocultar widget
  apiOverlay.classList.remove('hidden');
  apiConfigured = false;

  // Pre-llenar inputs con keys existentes
  if (KEYS.groq) { document.getElementById('input-groq').value = KEYS.groq; markValidated('groq'); }
  if (KEYS.gemini) { document.getElementById('input-gemini').value = KEYS.gemini; markValidated('gemini'); }
  if (KEYS.openrouter) { document.getElementById('input-openrouter').value = KEYS.openrouter; markValidated('openrouter'); }

  updateContinueBtn();
}

function markValidated(provider) {
  const check = document.getElementById(`check-${provider}`);
  const card = document.querySelector(`.api-provider-card[data-provider="${provider}"]`);
  if (check) check.classList.add('ok');
  if (card) card.classList.add('validated');
}

function unmarkValidated(provider) {
  const check = document.getElementById(`check-${provider}`);
  const card = document.querySelector(`.api-provider-card[data-provider="${provider}"]`);
  if (check) check.classList.remove('ok');
  if (card) card.classList.remove('validated');
}

function updateContinueBtn() {
  const valid = hasAnyKey();
  apiContinueBtn.disabled = !valid;
  if (valid) {
    const providers = getValidProviders();
    const names = providers.map(p => p.charAt(0).toUpperCase() + p.slice(1));
    apiStatus.textContent = `✓ ${names.join(', ')} configurado${providers.length > 1 ? 's' : ''}`;
    apiStatus.classList.add('ok');
  } else {
    apiStatus.textContent = 'Conecta al menos 1 proveedor';
    apiStatus.classList.remove('ok');
  }
}

async function validateProvider(provider) {
  const input = document.getElementById(`input-${provider}`);
  const btn = document.querySelector(`.api-validate-btn[data-provider="${provider}"]`);
  const key = input.value.trim();

  if (!key) {
    showToast('Ingresa una API Key');
    return;
  }

  btn.textContent = 'Validando...';
  btn.classList.add('checking');

  let valid = false;
  let errorMsg = '';

  try {
    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` },
      });
      valid = res.ok;
      if (!valid) {
        const data = await res.json().catch(() => ({}));
        errorMsg = data?.error?.message || `Error ${res.status}`;
      }
    } else if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      valid = res.ok;
      if (!valid) {
        const data = await res.json().catch(() => ({}));
        errorMsg = data?.error?.message || `Error ${res.status}`;
      }
    } else if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` },
      });
      valid = res.ok;
      if (!valid) {
        const data = await res.json().catch(() => ({}));
        errorMsg = data?.error?.message || `Error ${res.status}`;
      }
    }
  } catch (err) {
    errorMsg = 'Sin conexión. Verifica tu internet.';
  }

  btn.textContent = 'Validar';
  btn.classList.remove('checking');

  if (valid) {
    KEYS[provider] = key;
    markValidated(provider);
    saveConfigToFile();
    updateContinueBtn();
    showToast(`✓ ${provider.charAt(0).toUpperCase() + provider.slice(1)} conectado`);
  } else {
    unmarkValidated(provider);
    KEYS[provider] = '';
    saveConfigToFile();
    updateContinueBtn();
    showToast(`✗ ${errorMsg || 'API Key inválida'}`);
  }
}

function migrateOldData() {
  const old = localStorage.getItem(STORAGE_KEY);
  if (old && !localStorage.getItem(STORAGE_CONVERSATIONS)) {
    try {
      const msgs = JSON.parse(old);
      if (Array.isArray(msgs) && msgs.length) {
        const id = genId();
        conversations = [{ id, title: 'Chat anterior', messages: msgs, ts: Date.now() }];
        saveConversations();
      }
    } catch {}
    localStorage.removeItem(STORAGE_KEY);
  }
  localStorage.removeItem(STORAGE_DATE);
}

function restoreState() {
  const all = [...MODEL_CATALOG.groq, ...MODEL_CATALOG.gemini, ...MODEL_CATALOG.openrouter];
  if (!all.find(m => m.id === currentModel)) {
    currentProvider = 'groq';
    currentModel    = 'llama-3.3-70b-versatile';
  }
  updateProviderUI();
}

// ═══════════════════════════════════════════════
//  BUILD DROPDOWN DINÁMICO
// ═══════════════════════════════════════════════

function buildModelDropdown() {
  modelDropdown.innerHTML = '';

  const validProviders = getValidProviders();
  if (validProviders.length === 0) return;

  let isFirst = true;

  if (validProviders.includes('groq')) {
    if (!isFirst) {
      const sep = document.createElement('div');
      sep.className = 'dropdown-sep';
      modelDropdown.appendChild(sep);
    }
    modelDropdown.appendChild(buildSection('groq', '⚡ Groq · LPU Inference', MODEL_CATALOG.groq));
    isFirst = false;
  }

  if (validProviders.includes('gemini')) {
    if (!isFirst) {
      const sep = document.createElement('div');
      sep.className = 'dropdown-sep';
      modelDropdown.appendChild(sep);
    }
    modelDropdown.appendChild(buildSection('gemini', '✦ Google Gemini', MODEL_CATALOG.gemini));
    isFirst = false;
  }

  if (validProviders.includes('openrouter')) {
    if (!isFirst) {
      const sep = document.createElement('div');
      sep.className = 'dropdown-sep';
      modelDropdown.appendChild(sep);
    }
    modelDropdown.appendChild(buildSection('openrouter', '🔄 OpenRouter', MODEL_CATALOG.openrouter));
    isFirst = false;
  }

  // Si el provider/model actual no está en los válidos, seleccionar el primero disponible
  if (!validProviders.includes(currentProvider)) {
    const firstProvider = validProviders[0];
    const firstModel = MODEL_CATALOG[firstProvider].find(m => m.isDefault) || MODEL_CATALOG[firstProvider][0];
    selectModel(firstProvider, firstModel.id, firstModel.label);
  }
}

function buildSection(provider, title, models) {
  const section = document.createElement('div');

  const label = document.createElement('div');
  label.className = `dropdown-label provider-label provider-${provider}`;
  label.textContent = title;
  section.appendChild(label);

  models.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'model-option';
    btn.dataset.model    = m.id;
    btn.dataset.label    = m.label;
    btn.dataset.provider = provider;
    if (m.id === currentModel && provider === currentProvider) btn.classList.add('active');

    btn.innerHTML = `
      <span class="model-badge ${m.type}">${m.badge}</span>
      <div>
        <div class="model-name">${m.label}</div>
        <div class="model-desc">${m.desc}</div>
      </div>`;

    btn.addEventListener('click', () => {
      selectModel(provider, m.id, m.label);
      closeModelDropdown();
    });
    section.appendChild(btn);
  });

  return section;
}

function selectModel(provider, modelId, label) {
  currentProvider = provider;
  currentModel    = modelId;
  localStorage.setItem(STORAGE_PROVIDER, provider);
  localStorage.setItem(STORAGE_MODEL, modelId);
  modelLabel.textContent = label;
  updateProviderUI();
  showToast(`Modelo: ${label}`);
}

function updateProviderUI() {
  // Badge del botón header
  const badge = document.getElementById('providerBadge');
  if (badge) {
    const badges = { groq: '⚡', gemini: '✦', openrouter: '🔄' };
    badge.textContent = badges[currentProvider] || '⚡';
    badge.className   = `provider-badge ${currentProvider}`;
  }

  // Footer indicator
  modelIndicator.textContent = currentModel;
  modelIndicator.className = `model-indicator provider-${currentProvider}`;

  // Actualizar activo en dropdown
  document.querySelectorAll('.model-option').forEach(opt => {
    opt.classList.toggle('active',
      opt.dataset.model === currentModel && opt.dataset.provider === currentProvider);
  });

  // Label botón
  const all = [...MODEL_CATALOG.groq, ...MODEL_CATALOG.gemini, ...MODEL_CATALOG.openrouter];
  const found = all.find(m => m.id === currentModel);
  if (found) modelLabel.textContent = found.label;
}

function toggleModelDropdown() {
  const open = modelDropdown.classList.toggle('open');
  modelBtn.classList.toggle('open', open);
}
function closeModelDropdown() {
  modelDropdown.classList.remove('open');
  modelBtn.classList.remove('open');
}

// ═══════════════════════════════════════════════
//  CONVERSACIONES
// ═══════════════════════════════════════════════

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_CONVERSATIONS);
    if (raw) conversations = JSON.parse(raw);
    if (!Array.isArray(conversations)) conversations = [];
  } catch { conversations = []; }
}

function saveConversations() {
  try { localStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify(conversations)); }
  catch {}
}

function getCurrentChat() {
  return conversations.find(c => c.id === currentChatId);
}

function createNewChat() {
  const id = genId();
  const chat = { id, title: 'Nueva conversación', messages: [], ts: Date.now() };
  conversations.unshift(chat);
  currentChatId = id;
  localStorage.setItem(STORAGE_CURRENT_CHAT, id);
  saveConversations();
  loadCurrentChat();
  renderChatList();
  closeSidebar();
}

function switchChat(id) {
  saveCurrentChat();
  currentChatId = id;
  localStorage.setItem(STORAGE_CURRENT_CHAT, id);
  loadCurrentChat();
  renderChatList();
  closeSidebar();
}

function deleteChat(id, e) {
  e.stopPropagation();
  conversations = conversations.filter(c => c.id !== id);
  saveConversations();
  if (id === currentChatId) {
    if (conversations.length) {
      switchChat(conversations[0].id);
    } else {
      createNewChat();
    }
  }
  renderChatList();
}

function saveCurrentChat() {
  const chat = getCurrentChat();
  if (chat) {
    chat.messages = [...conversationHistory];
    chat.ts = Date.now();
    saveConversations();
  }
}

function loadCurrentChat() {
  const chat = getCurrentChat();
  conversationHistory = chat ? [...chat.messages] : [];
  renderAllMessages();
  updateStats();
}

function renderAllMessages() {
  [...messagesArea.children].forEach(el => el.remove());
  if (conversationHistory.length) {
    hideWelcome();
    conversationHistory.forEach(item => {
      const role = item.role === 'user' ? 'user' : 'ai';
      const text = item.content || '';
      if (text) renderMessage(text, role, false);
    });
  } else {
    showWelcome();
  }
  scrollToBottom();
  updateTokenCount();
}

// ═══════════════════════════════════════════════
//  EVENTOS
// ═══════════════════════════════════════════════

function bindEvents() {
  userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape' && isLoading) { e.preventDefault(); stopGeneration(); }
  });
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
    updateCharCount();
  });
  sendBtn.addEventListener('click', sendMessage);
  stopBtn.addEventListener('click', stopGeneration);
  clearBtn.addEventListener('click', clearConversation);
  sidebarToggle.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
  newChatBtn.addEventListener('click', createNewChat);
  themeToggle.addEventListener('click', toggleTheme);
  apiBtn.addEventListener('click', openApiOverlay);
  
  // Close buttons
  const closeBtn = document.getElementById('closeBtn');
  const apiCloseBtn = document.getElementById('apiCloseBtn');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.kara) {
        window.webkit.messageHandlers.kara.postMessage('close');
      } else {
        window.close();
      }
    });
  }
  
  if (apiCloseBtn) {
    apiCloseBtn.addEventListener('click', () => {
      if (hasAnyKey()) {
        apiOverlay.classList.add('hidden');
        apiConfigured = true;
        buildModelDropdown();
        restoreState();
        userInput.focus();
      } else {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.kara) {
          window.webkit.messageHandlers.kara.postMessage('close');
        } else {
          window.close();
        }
      }
    });
  }
  
  apiContinueBtn.addEventListener('click', () => {
    if (hasAnyKey()) {
      apiOverlay.classList.add('hidden');
      apiConfigured = true;
      buildModelDropdown();
      restoreState();
      userInput.focus();
    }
  });
  modelBtn.addEventListener('click', e => { e.stopPropagation(); toggleModelDropdown(); });
  document.addEventListener('click', closeModelDropdown);
  modelDropdown.addEventListener('click', e => e.stopPropagation());
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      userInput.value = chip.dataset.text;
      updateCharCount();
      sendMessage();
    });
  });

  // API overlay events
  document.querySelectorAll('.api-validate-btn').forEach(btn => {
    btn.addEventListener('click', () => validateProvider(btn.dataset.provider));
  });

  document.querySelectorAll('.api-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const card = input.closest('.api-provider-card');
        const provider = card.dataset.provider;
        validateProvider(provider);
      }
    });
  });

  document.querySelectorAll('.api-toggle-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target.type === 'password') {
        target.type = 'text';
      } else {
        target.type = 'password';
      }
    });
  });
}

// ═══════════════════════════════════════════════
//  ENVÍO
// ═══════════════════════════════════════════════

function stopGeneration() {
  if (abortController) {
    abortController.abort();
  }
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  if (getChatMessageCount() >= CHAT_MESSAGE_LIMIT) {
    renderMessage(`⚠️ Has alcanzado el límite de ${CHAT_MESSAGE_LIMIT} mensajes en este chat. Crea una nueva conversación para continuar.`, 'ai', true, true);
    return;
  }

  userInput.value = '';
  userInput.style.height = 'auto';
  updateCharCount();
  hideWelcome();
  isLoading = true;
  abortController = new AbortController();
  sendBtn.classList.add('hidden');
  stopBtn.classList.remove('hidden');

  renderMessage(text, 'user');
  conversationHistory.push({ role: 'user', content: text });
  updateTokenCount();
  updateStats();
  updateRateIndicator();

  // Actualizar título del chat si es el primer mensaje
  const chat = getCurrentChat();
  if (chat && chat.title === 'Nueva conversación') {
    chat.title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
    saveConversations();
    renderChatList();
  }

  const typingEl = showTyping();
  scrollToBottom();

  try {
    let reply;
    if (currentProvider === 'groq') reply = await callGroq(abortController.signal);
    else if (currentProvider === 'gemini') reply = await callGemini(abortController.signal);
    else reply = await callOpenRouter(abortController.signal);
    removeTyping(typingEl);
    await renderMessageStreaming(reply, 'ai');
    conversationHistory.push({ role: 'assistant', content: reply });
    saveCurrentChat();
    updateTokenCount();
    updateStats();
    playPing();
  } catch (err) {
    removeTyping(typingEl);
    if (err.name === 'AbortError') {
      renderMessage('Generación detenida.', 'ai', true, true);
    } else {
      // Detectar error de red
      const isNetworkError = /network|fetch|Failed to load|TypeError/i.test(err.name + err.message) || !navigator.onLine;
      if (isNetworkError) updateConnectionStatus(false);
      renderMessage(`⚠️ ${err.message}`, 'ai', true, true);
    }
  } finally {
    isLoading = false;
    abortController = null;
    stopBtn.classList.add('hidden');
    sendBtn.classList.remove('hidden');
    scrollToBottom();
    userInput.focus();
  }
}

// ═══════════════════════════════════════════════
//  GROQ API
// ═══════════════════════════════════════════════

async function callGroq(signal) {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try { return await callGroqOnce(signal); }
    catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      if (err.isRateLimit && i < MAX_RETRIES - 1) {
        const t = err.message.match(/(\d+(\.\d+)?)s/);
        const ms = t ? Math.min(parseFloat(t[1]) * 1000 + 500, 20000) : RETRY_BASE_MS * 2**i;
        showToast(`⏳ Rate limit — reintentando en ${Math.ceil(ms/1000)}s...`);
        await sleep(ms); continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function callGroqOnce(signal) {
  const body = {
    model:       currentModel,
    messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...conversationHistory],
    temperature: GEN_CONFIG.temperature,
    max_tokens:  GEN_CONFIG.max_tokens,
    stream:      false,
  };

  const res = await fetch(ENDPOINTS.groq, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.groq}` },
    body:    JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    const msg = e?.error?.message || `HTTP ${res.status}`;
    const err = new Error(formatGroqError(msg, res.status));
    err.isRateLimit = res.status === 429 || /rate|limit|quota/i.test(msg);
    throw err;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Respuesta vacía de Groq.');
  return text;
}

function formatGroqError(msg, status) {
  if (status === 429 || /rate|limit|quota/i.test(msg)) {
    const t = msg.match(/(\d+(\.\d+)?)s/);
    return `Rate limit Groq.${t ? ` Reintenta en ~${Math.ceil(parseFloat(t[1]))}s.` : ' Espera un momento.'}`;
  }
  if (status === 401) return 'Groq API Key inválida. Verifica en console.groq.com/keys';
  if (status === 404 || /not found/i.test(msg)) return `Modelo "${currentModel}" no disponible en Groq.`;
  return msg.split('\n')[0];
}

// ═══════════════════════════════════════════════
//  GEMINI API
// ═══════════════════════════════════════════════

async function callGemini(signal) {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try { return await callGeminiOnce(signal); }
    catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      if (err.isRateLimit && i < MAX_RETRIES - 1) {
        const t = err.message.match(/(\d+(\.\d+)?)s/);
        const ms = t ? Math.min(parseFloat(t[1]) * 1000 + 500, 15000) : RETRY_BASE_MS * 2**i;
        showToast(`⏳ Rate limit — reintentando en ${Math.ceil(ms/1000)}s...`);
        await sleep(ms); continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function callGeminiOnce(signal) {
  const url = `${ENDPOINTS.gemini}/${currentModel}:generateContent?key=${KEYS.gemini}`;

  const geminiHistory = conversationHistory.map(m => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    contents: [
      { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Entendido. Soy Kara, lista para ayudarte.' }] },
      ...geminiHistory,
    ],
    generationConfig: { temperature: GEN_CONFIG.temperature, maxOutputTokens: GEN_CONFIG.max_tokens },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    const msg = e?.error?.message || `HTTP ${res.status}`;
    const err = new Error(formatGeminiError(msg, res.status));
    err.isRateLimit = res.status === 429 || /quota|exceed/i.test(msg);
    throw err;
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];
  if (!candidate) throw new Error('Sin respuesta de Gemini.');
  if (candidate.finishReason === 'SAFETY') throw new Error('Respuesta bloqueada por seguridad.');
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Respuesta vacía de Gemini.');
  return text;
}

function formatGeminiError(msg, status) {
  if (status === 429 || /quota|exceed/i.test(msg)) {
    const t = msg.match(/retry in ([\d.]+)s/i);
    return /freetier|free tier/i.test(msg)
      ? `Quota Gemini agotada.${t ? ` ~${Math.ceil(parseFloat(t[1]))}s.` : ''} Crea una key nueva en aistudio.google.com`
      : `Rate limit Gemini.${t ? ` Reintenta en ~${Math.ceil(parseFloat(t[1]))}s.` : ''}`;
  }
  if (status === 403) return 'Gemini API Key inválida. Verifica en aistudio.google.com';
  if (status === 404 || /not found/i.test(msg)) return `Modelo Gemini "${currentModel}" no disponible.`;
  return msg.split('\n')[0];
}

// ═══════════════════════════════════════════════
//  OPENROUTER API
// ═══════════════════════════════════════════════

async function callOpenRouter(signal) {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try { return await callOpenRouterOnce(signal); }
    catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      if (err.isRateLimit && i < MAX_RETRIES - 1) {
        const t = err.message.match(/(\d+(\.\d+)?)s/);
        const ms = t ? Math.min(parseFloat(t[1]) * 1000 + 1000, 30000) : 15000 * 2**i;
        showToast(`⏳ Rate limit OpenRouter — reintentando en ${Math.ceil(ms/1000)}s...`);
        await sleep(ms); continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function callOpenRouterOnce(signal) {
  if (!KEYS.openrouter) throw new Error('OpenRouter API Key no configurada. Agrega tu key en script.js');
  const body = {
    model:       currentModel,
    messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...conversationHistory],
    temperature: GEN_CONFIG.temperature,
    max_tokens:  GEN_CONFIG.max_tokens,
    stream:      false,
  };

  const res = await fetch(ENDPOINTS.openrouter, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEYS.openrouter}`,
      'HTTP-Referer': window.location.href,
      'X-Title': 'Kara AI',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    const msg = e?.error?.metadata?.raw || e?.error?.message || `HTTP ${res.status}`;
    const err = new Error(formatOpenRouterError(msg, res.status));
    err.isRateLimit = res.status === 429 || /rate|limit|quota|temporarily/i.test(msg);
    throw err;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Respuesta vacía de OpenRouter.');
  return text;
}

function formatOpenRouterError(msg, status) {
  if (status === 429 || /rate|limit|quota/i.test(msg)) {
    return `Rate limit OpenRouter. Los modelos gratis tienen límite bajo (~1 req/min). Prueba con "Free Router" o espera 60s.`;
  }
  if (status === 401) return 'OpenRouter API Key inválida. Verifica en openrouter.ai/keys';
  if (status === 404 || /not found/i.test(msg)) return `Modelo "${currentModel}" no disponible. Prueba con "Free Router".`;
  if (/guardrail|policy/i.test(msg)) return `Modelo bloqueado por política de OpenRouter. Cambia el modelo en settings.`;
  if (/credits|insufficient/i.test(msg)) return 'Créditos OpenRouter insuficientes. Recarga en openrouter.ai';
  return msg.split('\n')[0];
}

// ═══════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════

function renderMessage(text, role, animate = true, isError = false) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  if (role === 'user') {
    avatar.textContent = 'Tú';
  } else {
    avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  const content = document.createElement('div');
  content.className = 'msg-content';

  const bubble = document.createElement('div');
  bubble.className = `msg-bubble${isError ? ' error' : ''}`;
  bubble.innerHTML = processContent(text);

  // Edit button for user messages
  if (role === 'user' && !isError) {
    const editBtn = document.createElement('button');
    editBtn.className = 'msg-edit-btn';
    editBtn.title = 'Editar mensaje';
    editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    const msgIndex = conversationHistory.filter(m => m.role === 'user').length;
    editBtn.addEventListener('click', () => {
      const idx = conversationHistory.findIndex((m, i) => m.role === 'user' && m.content === text);
      if (idx >= 0) enableEdit(bubble, idx);
    });
    bubble.appendChild(editBtn);
  }

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = formatTime(new Date());

  content.appendChild(bubble);
  content.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(content);
  messagesArea.appendChild(wrapper);

  wrapper.querySelectorAll('.code-copy-btn').forEach(btn => btn.addEventListener('click', () => copyCode(btn)));
  wrapper.querySelectorAll('.code-dl-btn').forEach(btn => btn.addEventListener('click', () => downloadCode(btn)));
  wrapper.querySelectorAll('.code-run-btn').forEach(btn => btn.addEventListener('click', () => runInTerminal(btn)));
  return wrapper;
}

async function renderMessageStreaming(text, role) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

  const content = document.createElement('div');
  content.className = 'msg-content';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble streaming';

  const time = document.createElement('div');
  time.className = 'msg-time typing-time';
  time.textContent = formatTime(new Date());

  content.appendChild(bubble);
  content.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(content);
  messagesArea.appendChild(wrapper);

  await typeText(bubble, text);

  bubble.classList.remove('streaming');
  time.classList.add('visible');
  wrapper.querySelectorAll('.code-copy-btn').forEach(btn => btn.addEventListener('click', () => copyCode(btn)));
  wrapper.querySelectorAll('.code-dl-btn').forEach(btn => btn.addEventListener('click', () => downloadCode(btn)));
  wrapper.querySelectorAll('.code-run-btn').forEach(btn => btn.addEventListener('click', () => runInTerminal(btn)));
  scrollToBottom();
  return wrapper;
}

function typeText(el, text) {
  return new Promise(resolve => {
    const html = processContent(text);
    el.innerHTML = html;

    const children = Array.from(el.children);
    if (!children.length) { resolve(); return; }

    children.forEach(c => { c.style.visibility = 'hidden'; c.style.height = '0'; c.style.overflow = 'hidden'; c.style.margin = '0'; c.style.padding = '0'; });

    let idx = 0;

    function revealNext() {
      if (idx >= children.length) { resolve(); return; }
      const block = children[idx];
      block.style.visibility = '';
      block.style.height = '';
      block.style.overflow = '';
      block.style.margin = '';
      block.style.padding = '';

      const isCode = block.classList.contains('code-canvas');

      if (isCode) {
        scrollToBottom();
        idx++;
        setTimeout(revealNext, 180);
        return;
      }

      const textNodes = [];
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null, false);
      let n;
      while (n = walker.nextNode()) {
        if (n.textContent.length > 0) textNodes.push(n);
      }

      if (!textNodes.length) { idx++; setTimeout(revealNext, 60); return; }

      textNodes.forEach(tn => { tn._full = tn.textContent; tn.textContent = ''; });

      const total = textNodes.reduce((s, tn) => s + tn._full.length, 0);
      const speed = total < 120 ? 6 : total < 400 ? 4 : 2;
      let ni = 0;

      function tick() {
        let batch = speed;
        while (batch > 0 && ni < textNodes.length) {
          const tn = textNodes[ni];
          const remain = tn._full.length - tn.textContent.length;
          const take = Math.min(batch, remain);
          tn.textContent = tn._full.slice(0, tn.textContent.length + take);
          batch -= take;
          if (tn.textContent.length >= tn._full.length) ni++;
        }
        scrollToBottom();
        if (ni >= textNodes.length) { idx++; revealNext(); return; }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    revealNext();
  });
}

function runInTerminal(btn) {
  const cmd = btn.dataset.cmd;
  if (!cmd) return;
  const encoded = encodeURIComponent(cmd.trim());
  window.open(`terminal://${encoded}`, '_self');
  showToast(' Ejecutando en terminal...');
}

// ═══════════════════════════════════════════════
//  MARKDOWN + CODE CANVAS
// ═══════════════════════════════════════════════

function processContent(text) {
  const parts = [];
  let last = 0;
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) });
    parts.push({ type: 'code', lang: m[1] || 'text', content: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });
  return parts.map(p => p.type === 'code' ? renderCodeCanvas(p.lang, p.content) : renderMarkdown(p.content)).join('');
}

/**
 * renderMarkdown — convierte Markdown básico a HTML seguro.
 * Soporta: headings (#/##/###), tablas (|), listas (- / 1.),
 * negrita, cursiva, código inline, blockquote, hr, links.
 * Recibe texto SIN bloques de código (ya fueron extraídos por processContent).
 */
function renderMarkdown(text) {
  if (!text.trim()) return '';

  // ── 1. Dividir en bloques por líneas en blanco ──────────────────
  // Normalizamos saltos de línea
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const blocks = [];    // Bloques detectados: { type, lines/content }
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Línea vacía → separador de bloque ──────────────────────────
    if (line.trim() === '') { i++; continue; }

    // ── HR: --- o *** o ___ ────────────────────────────────────────
    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++; continue;
    }

    // ── Heading: # ## ### #### ###### ─────────────────────────────
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      blocks.push({ type: 'heading', level: hMatch[1].length, content: hMatch[2] });
      i++; continue;
    }

    // ── Tabla: línea que contiene | ────────────────────────────────
    if (line.includes('|') && /^\s*\|/.test(line)) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', lines: tableLines });
      continue;
    }

    // ── Blockquote: > ──────────────────────────────────────────────
    if (/^\s*>\s?/.test(line)) {
      const qLines = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        qLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', content: qLines.join('\n') });
      continue;
    }

    // ── Lista no ordenada: - * + (incluye task lists - [ ] / - [x]) ──
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      // Detectar si es task list
      const isTaskList = items.some(item => /^\[[ xX]\]/.test(item));
      if (isTaskList) {
        blocks.push({ type: 'task', items: items.map(item => {
          const checked = /^\[[xX]\]/.test(item);
          return { text: item.replace(/^\[[ xX]\]\s*/, ''), checked };
        })});
      } else {
        blocks.push({ type: 'ul', items });
      }
      continue;
    }

    // ── Lista ordenada: 1. 2. ───────────────────────────────────────
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // ── Párrafo: texto normal (agrupa líneas contiguas) ─────────────
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^#{1,6}\s/) &&
      !lines[i].includes('|') &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^(\s*[-*_]){3,}\s*$/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: 'paragraph', content: paraLines.join('\n') });
    }
  }

  // ── 2. Renderizar cada bloque ────────────────────────────────────
  return blocks.map(block => renderBlock(block)).join('');
}

/** Aplica formato inline: negrita, cursiva, tachado, código, links */
function inlineFormat(raw) {
  // Escapamos HTML primero
  let s = escapeHtml(raw);
  // Negrita **texto** o __texto__
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.+?)__/g,     '<strong>$1</strong>');
  // Cursiva *texto* o _texto_  (no seguido de otro * para no confundir con **)
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  s = s.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g,      '<em>$1</em>');
  // Tachado ~~texto~~
  s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // Código inline
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links: [texto](url) — abre en nueva pestaña con seguridad
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // URLs desnudas <https://...>
  s = s.replace(/&lt;(https?:\/\/[^&]+)&gt;/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return s;
}

/** Renderiza un bloque ya clasificado */
function renderBlock(block) {
  switch (block.type) {

    case 'hr':
      return '<hr>';

    case 'heading': {
      const tag = `h${block.level}`;
      return `<${tag}>${inlineFormat(block.content)}</${tag}>`;
    }

    case 'paragraph':
      // Saltos de línea simples dentro de un párrafo → <br>
      return '<p>' + block.content.split('\n').map(inlineFormat).join('<br>') + '</p>';

    case 'blockquote':
      return `<blockquote>${renderMarkdown(block.content)}</blockquote>`;

    case 'ul':
      return '<ul>' + block.items.map(item => `<li>${inlineFormat(item)}</li>`).join('') + '</ul>';

    case 'task':
      return '<ul class="task-list">' + block.items.map(item =>
        `<li class="task-item"><input type="checkbox" class="task-checkbox" ${item.checked ? 'checked' : ''} disabled>${inlineFormat(item.text)}</li>`
      ).join('') + '</ul>';

    case 'ol':
      return '<ol>' + block.items.map(item => `<li>${inlineFormat(item)}</li>`).join('') + '</ol>';

    case 'table':
      return renderTable(block.lines);

    default:
      return '';
  }
}

/** Renderiza una tabla Markdown completa */
function renderTable(lines) {
  if (lines.length < 2) return `<p>${inlineFormat(lines[0] || '')}</p>`;

  // Parsear celdas de una fila
  const parseCells = line =>
    line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());

  // Detectar si una línea es el separador (--|-- etc.)
  const isSeparator = line => /^\s*\|?[\s\-|:]+\|?\s*$/.test(line) && line.includes('-');

  const headers  = parseCells(lines[0]);
  let bodyStart  = 1;

  // Saltar línea separadora
  if (lines[1] && isSeparator(lines[1])) bodyStart = 2;

  const headerHtml = headers.map(h => `<th>${inlineFormat(h)}</th>`).join('');
  const bodyHtml   = lines.slice(bodyStart).map(line => {
    if (isSeparator(line)) return '';
    const cells = parseCells(line);
    return '<tr>' + cells.map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>';
  }).join('');

  return `
<div class="md-table-wrap">
  <table class="md-table">
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
</div>`;
}

function renderCodeCanvas(lang, code) {
  const id = 'code_' + Math.random().toString(36).slice(2, 8);
  const highlighted = highlightSyntax(code, lang);
  const isTerminal = /^(bash|sh|shell|zsh|fish|powershell|ps1|cmd|bat|terminal|console)$/i.test(lang);
  const runBtn = isTerminal
    ? `<button class="code-run-btn" data-cmd="${escapeHtml(code)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>Ejecutar</button>`
    : '';
  return `<div class="code-canvas"><div class="code-canvas-header"><span class="code-lang">${escapeHtml(lang)}</span><div class="code-actions">${runBtn}<button class="code-dl-btn" data-code-id="${id}" data-lang="${escapeHtml(lang)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button><button class="code-copy-btn" data-code-id="${id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copiar</button></div></div><pre id="${id}"><code>${highlighted}</code></pre></div>`;
}

function highlightSyntax(code, lang) {
  const ph = { items: [], strings: [], comments: [] };

  function addPlaceholder(html) {
    const idx = ph.items.length;
    ph.items.push(html);
    return `\x01T${idx}\x02`;
  }

  function restorePlaceholders(s) {
    return s.replace(/\x01T(\d+)\x02/g, (_, i) => ph.items[parseInt(i)]);
  }

  let s = code;

  // 1. Extract strings from RAW code
  s = s.replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1|`(?:[^`\\]|\\.)*`/g, match => {
    ph.strings.push(match);
    return `\x00S${ph.strings.length - 1}\x00`;
  });

  // 2. Extract comments from RAW code (# only for bash/shell)
  const isShell = /^(bash|sh|shell|zsh|fish|powershell|ps1|cmd|bat)$/i.test(lang);
  const commentRe = isShell
    ? /(\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/.*$|#.*$)/gm
    : /(\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/.*$)/gm;
  s = s.replace(commentRe, match => {
    ph.comments.push(match);
    return `\x00C${ph.comments.length - 1}\x00`;
  });

  // 3. Escape HTML
  s = escapeHtml(s);

  // 4. Keywords
  const kwMap = {
    js: 'const let var function return if else for while do switch case break continue class new this async await try catch throw import export default from true false null undefined typeof instanceof void delete in of',
    javascript: 'const let var function return if else for while do switch case break continue class new this async await try catch throw import export default from true false null undefined typeof instanceof void delete in of',
    ts: 'const let var function return if else for while do switch case break continue class new this async await try catch throw import export default from true false null undefined typeof instanceof void delete in of type interface enum implements extends',
    typescript: 'const let var function return if else for while do switch case break continue class new this async await try catch throw import export default from true false null undefined typeof instanceof void delete in of type interface enum implements extends',
    py: 'def class return if elif else for while in not and or is True False None import from as with try except finally raise lambda yield pass break continue global nonlocal assert del async await',
    python: 'def class return if elif else for while in not and or is True False None import from as with try except finally raise lambda yield pass break continue global nonlocal assert del async await',
    bash: 'if then else fi for while do done case esac function return in echo export local readonly shift exit break continue true false',
    sh: 'if then else fi for while do done case esac function return in echo export local readonly shift exit break continue true false',
    rs: 'fn let mut const struct enum impl trait pub use mod self super crate return if else match for while loop break continue async await move ref unsafe type where as in true false Some None Ok Err',
    rust: 'fn let mut const struct enum impl trait pub use mod self super crate return if else match for while loop break continue async await move ref unsafe type where as in true false Some None Ok Err',
    go: 'func return if else for range var const type struct interface package import defer go chan select case break continue true false nil map make new',
    c: 'int char float double void struct typedef enum return if else for while do switch case break continue const static extern unsigned signed sizeof return goto volatile register',
    cpp: 'int char float double void struct typedef enum return if else for while do switch case break continue const static extern unsigned signed sizeof return goto volatile register class namespace template using virtual override public private protected nullptr true false new delete',
    java: 'public private protected class interface extends implements return if else for while do switch case break continue new this super static final void int boolean String try catch throw throws import package abstract native synchronized volatile transient true false null',
    html: 'div span a p h1 h2 h3 h4 h5 h6 ul ol li table tr td th form input button img src href class id style script link meta head body html DOCTYPE',
    css: 'display flex grid position absolute relative margin padding color background border font size width height top left right bottom none auto inherit solid dashed dotted rgba rgb',
    sql: 'SELECT FROM WHERE INSERT INTO UPDATE DELETE CREATE TABLE DROP ALTER JOIN LEFT RIGHT INNER OUTER ON AND OR NOT NULL ORDER BY GROUP HAVING LIMIT OFFSET AS IN BETWEEN LIKE EXISTS COUNT SUM AVG MIN MAX DISTINCT UNION ALL',
  };

  const keywords = kwMap[lang] || kwMap[lang?.toLowerCase()] || '';
  if (keywords) {
    const words = keywords.split(' ');
    const pattern = new RegExp(`\\b(${words.join('|')})\\b`, 'g');
    s = s.replace(pattern, (_, w) => addPlaceholder(`<span class="token-keyword">${w}</span>`));
  }

  // 5. Numbers
  s = s.replace(/\b(\d+\.?\d*)\b/g, (_, n) => addPlaceholder(`<span class="token-number">${n}</span>`));

  // 6. Function calls
  s = s.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_, fn) => addPlaceholder(`<span class="token-function">${fn}</span>`));

  // 7. Operators
  s = s.replace(/(===?|!==?|&lt;=?|&gt;=?|=&gt;|&&|\|\||[+\-*/%]=?)/g,
    (_, op) => addPlaceholder(`<span class="token-operator">${op}</span>`));

  // 8. Restore strings
  s = s.replace(/\x00S(\d+)\x00/g, (_, i) =>
    addPlaceholder(`<span class="token-string">${escapeHtml(ph.strings[parseInt(i)])}</span>`)
  );

  // 9. Restore comments
  s = s.replace(/\x00C(\d+)\x00/g, (_, i) =>
    addPlaceholder(`<span class="token-comment">${escapeHtml(ph.comments[parseInt(i)])}</span>`)
  );

  // 10. Restore all HTML spans
  return restorePlaceholders(s);
}

function getCodeContent(btn) {
  const pre = document.getElementById(btn.dataset.codeId);
  if (!pre) return '';
  const code = pre.querySelector('code');
  if (code) return code.textContent || code.innerText || '';
  return pre.textContent || pre.innerText || '';
}

function copyCode(btn) {
  const text = getCodeContent(btn);
  if (!text) { showToast('No se pudo obtener el código'); return; }
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Copiado`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copiar`;
    }, 2000);
  }).catch(() => {
    showToast('No se pudo copiar');
  });
}

function downloadCode(btn) {
  const text = getCodeContent(btn);
  if (!text) { showToast('No se pudo obtener el código'); return; }
  const lang = btn.dataset.lang || 'txt';
  const extMap = { js:'js', javascript:'js', ts:'ts', typescript:'ts', py:'py', python:'py', html:'html', css:'css', bash:'sh', sh:'sh', shell:'sh', rs:'rs', rust:'rs', go:'go', c:'c', cpp:'cpp', java:'java', sql:'sql', json:'json', yaml:'yml', yml:'yml', xml:'xml', rb:'rb', php:'php', swift:'swift', kt:'kt', lua:'lua', r:'r', pl:'pl' };
  const ext = extMap[lang?.toLowerCase()] || 'txt';
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Archivo descargado');
}

// ═══════════════════════════════════════════════
//  TYPING
// ═══════════════════════════════════════════════

function showTyping() {
  const w = document.createElement('div');
  w.className = 'typing-indicator';
  w.id = 'typingIndicator';

  const av = document.createElement('div');
  av.className = 'msg-avatar';
  av.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  Object.assign(av.style, { background: 'linear-gradient(135deg,#1a0a14,#2e0f1f)', border: '1px solid rgba(192,41,74,0.35)', color: '#e8395f', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0', marginTop: '2px' });

  const b = document.createElement('div');
  b.className = 'typing-bubble';
  b.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  w.appendChild(av); w.appendChild(b);
  messagesArea.appendChild(w);
  return w;
}
function removeTyping(el) { el?.remove(); }

// ═══════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════

function hideWelcome() { document.getElementById('welcomeScreen')?.remove(); }
function showWelcome() {
  if (document.getElementById('welcomeScreen')) return;
  const w = document.createElement('div');
  w.className = 'welcome'; w.id = 'welcomeScreen';
  w.innerHTML = `
    <div class="welcome-glow"></div>
    <div class="welcome-avatar"><svg viewBox="0 0 24 24" fill="none" class="w-icon"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
    <h2 class="welcome-title">Kara AI</h2>
    <p class="welcome-sub">Tu asistente inteligente local.<br/>¿En qué puedo ayudarte hoy?</p>
    <div class="suggestions">
      <button class="suggestion-chip" data-text="¿Qué puedes hacer?">¿Qué puedes hacer?</button>
      <button class="suggestion-chip" data-text="Escribe un script en Bash">Script Bash</button>
      <button class="suggestion-chip" data-text="Explícame Hyprland">Hyprland</button>
    </div>`;
  messagesArea.appendChild(w);
  w.querySelectorAll('.suggestion-chip').forEach(c => c.addEventListener('click', () => { userInput.value = c.dataset.text; updateCharCount(); sendMessage(); }));
}
function scrollToBottom() { requestAnimationFrame(() => { messagesArea.scrollTop = messagesArea.scrollHeight; }); }
function updateCharCount() {
  const l = userInput.value.length;
  charCount.textContent = l;
  charCount.className = 'char-count' + (l > 3000 ? ' limit' : l > 2000 ? ' warn' : '');
  // Actualizar tokens del input actual
  if (l > 0) {
    const total = conversationHistory.reduce((sum, m) => sum + estimateTokens(m.content || ''), 0);
    const inputTokens = estimateTokens(userInput.value);
    tokenCount.textContent = `~${(total + inputTokens).toLocaleString()} tokens`;
  } else {
    updateTokenCount();
  }
}
function formatTime(d) { return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }); }
function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function clearConversation() {
  conversationHistory = [];
  const chat = getCurrentChat();
  if (chat) { chat.messages = []; chat.title = 'Nueva conversación'; saveConversations(); renderChatList(); }
  [...messagesArea.children].forEach(el => el.remove());
  showWelcome();
  updateTokenCount();
  updateStats();
  showToast('🗑️ Conversación limpiada');
}

// ═══════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════

function toggleSidebar() {
  const open = sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('open', open);
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
}

function renderChatList() {
  chatList.innerHTML = '';
  conversations.forEach(c => {
    const btn = document.createElement('button');
    btn.className = `chat-item${c.id === currentChatId ? ' active' : ''}`;
    btn.innerHTML = `
      <span class="chat-item-title">${escapeHtml(c.title)}</span>
      <button class="chat-item-del" title="Eliminar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    btn.addEventListener('click', () => switchChat(c.id));
    btn.querySelector('.chat-item-del').addEventListener('click', e => deleteChat(c.id, e));
    chatList.appendChild(btn);
  });
}

// ═══════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════

function initTheme() {
  const saved = localStorage.getItem(STORAGE_THEME) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  
  // Agregar clase de animación
  document.body.classList.add('theme-transitioning');
  
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_THEME, next);
  showToast(next === 'dark' ? '🌙 Tema oscuro' : '☀️ Tema claro');
  
  // Quitar clase de animación después de que termine
  setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
  }, 500);
}

// ═══════════════════════════════════════════════
//  EDITAR MENSAJE
// ═══════════════════════════════════════════════

function enableEdit(bubble, msgIndex) {
  const text = conversationHistory[msgIndex]?.content || '';
  const contentEl = bubble.querySelector('p, .msg-content-inner') || bubble;

  bubble.innerHTML = `
    <textarea class="msg-edit-textarea">${escapeHtml(text)}</textarea>
    <div class="msg-edit-actions">
      <button class="edit-cancel">Cancelar</button>
      <button class="edit-save">Enviar</button>
    </div>`;

  const textarea = bubble.querySelector('.msg-edit-textarea');
  textarea.focus();
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });

  bubble.querySelector('.edit-cancel').addEventListener('click', () => {
    renderAllMessages();
  });

  bubble.querySelector('.edit-save').addEventListener('click', () => {
    const newText = textarea.value.trim();
    if (!newText) return;
    conversationHistory = conversationHistory.slice(0, msgIndex);
    saveCurrentChat();
    userInput.value = newText;
    updateCharCount();
    sendMessage();
  });

  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); bubble.querySelector('.edit-save').click(); }
    if (e.key === 'Escape') { renderAllMessages(); }
  });
}

// ═══════════════════════════════════════════════
//  TOKEN COUNTER
// ═══════════════════════════════════════════════

function estimateTokens(text) {
  return Math.ceil(text.length / 3.5);
}

function updateTokenCount() {
  const total = conversationHistory.reduce((sum, m) => sum + estimateTokens(m.content || ''), 0);
  tokenCount.textContent = total > 0 ? `~${total.toLocaleString()} tokens` : '0 tokens';
}

// ═══════════════════════════════════════════════
//  RATE LIMIT TRACKER
// ═══════════════════════════════════════════════

const CHAT_MESSAGE_LIMIT = 100;

function getChatMessageCount() {
  return conversationHistory.filter(m => m.role === 'user').length;
}

function updateRateIndicator() {
  const count = getChatMessageCount();
  rateText.textContent = `${count}/${CHAT_MESSAGE_LIMIT}`;
  rateIndicator.className = 'stat-item rate-indicator';
  if (count >= CHAT_MESSAGE_LIMIT) rateIndicator.classList.add('high');
  else if (count >= Math.floor(CHAT_MESSAGE_LIMIT * 0.6)) rateIndicator.classList.add('medium');
  else rateIndicator.classList.add('low');
}

// ═══════════════════════════════════════════════
//  STATS
// ═══════════════════════════════════════════════

function updateStats() {
  const userMsgs = conversationHistory.filter(m => m.role === 'user').length;
  const aiMsgs = conversationHistory.filter(m => m.role === 'assistant').length;
  statMessages.textContent = `${userMsgs}↕ ${aiMsgs}↑`;

  // Elapsed time since first message
  if (conversationHistory.length > 0) {
    const chat = getCurrentChat();
    const start = chat?.ts || Date.now();
    const elapsed = Date.now() - start;
    const mins = Math.floor(elapsed / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) statTime.textContent = `${hours}h ${mins % 60}m`;
    else statTime.textContent = `${mins}m`;
  } else {
    statTime.textContent = '0m';
  }

  updateRateIndicator();
}

// ═══════════════════════════════════════════════
//  CONEXIÓN
// ═══════════════════════════════════════════════

function updateConnectionStatus(online) {
  statusDot.classList.toggle('offline', !online);
  statusText.classList.toggle('offline', !online);
  statusText.textContent = online ? 'online' : 'offline';
}

function initConnectionMonitor() {
  updateConnectionStatus(navigator.onLine);
  window.addEventListener('online', () => updateConnectionStatus(true));
  window.addEventListener('offline', () => updateConnectionStatus(false));
  // Poll cada 30s por si el evento no se dispara
  setInterval(() => updateConnectionStatus(navigator.onLine), 30000);
}

function playPing() {
  try { pingSound.currentTime = 0; pingSound.volume = 0.12; pingSound.play().catch(() => {}); } catch {}
}

let toastTimer;
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

function openApiOverlay() {
  // Pre-llenar inputs con keys actuales
  document.getElementById('input-groq').value = KEYS.groq || '';
  document.getElementById('input-gemini').value = KEYS.gemini || '';
  document.getElementById('input-openrouter').value = KEYS.openrouter || '';

  // Actualizar checks visuales
  if (KEYS.groq) markValidated('groq'); else unmarkValidated('groq');
  if (KEYS.gemini) markValidated('gemini'); else unmarkValidated('gemini');
  if (KEYS.openrouter) markValidated('openrouter'); else unmarkValidated('openrouter');

  updateContinueBtn();
  apiOverlay.classList.remove('hidden');
}

// ─── Arranque ───
init();
