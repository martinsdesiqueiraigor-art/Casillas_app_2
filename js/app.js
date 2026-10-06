// @ts-check
// app.js — Ponto de entrada: inicializa DB, trial, menu, teclado e roteia módulos

import { eventBus } from './core/eventBus.js';
import { wireGuideRouter } from './core/router.js';
import { GuiaManager } from './modules/guia/GuiaManager.js';
import { SyncQueue } from './core/syncQueue.js';
import { outboxStore } from './core/outboxStore.js';
import { createTransport, sessionOwner } from './core/supabaseClient.js';
import { initDB } from './db.js';
import { showToast } from './utils.js';
import { loadInitialState, persistCurrentModule, appState } from './state.js';
import { checkTrialStatus, invalidateAccessLease, inspectAccessLease, showActivationScreen } from './trial.js';
import { startAccessLifecycle, LEASE_KEY } from './auth.js';
import { initKeyboard, bindInputsToKeyboard, hideKeyboard } from './keyboard.js';
import {initMenu, setActiveMenuItem, initOptionsMenu, closeOptionsMenu, initShareButton, renderMenuIcons } from './menu.js';
import { ICONS } from './icons.js';
import { supabase } from './supabase.bundle.js';
import { getCurrentUser, onAuthStateChange, signOut } from './auth.js';

// Registro dos módulos (carregamento dinâmico)
const MODULE_LOADERS = {
  home:      () => import('./modules/home.js'),
  trig:      () => import('./modules/trig.js'),
  coni:      () => import('./modules/coni.js'),
  poly:      () => import('./modules/poly.js'),
  furos:     () => import('./modules/furos.js'),
  rosca:     () => import('./modules/rosca.js'),
  tol:       () => import('./modules/tol.js'),
  potencia:  () => import('./modules/potencia.js'),
  chaveta:   () => import('./modules/chaveta.js'),
  conicpad:  () => import('./modules/conicpad.js'),
  prog:      () => import('./modules/prog.js'),
  guia:      () => import('./modules/guia.js'),
  'consultor-tecnico': () => import('./modules/consultor/index.js'),
  consult:   () => import('./modules/consult.js')
};

const MODULE_TITLES = {
  home:     { name: 'Visão geral',        icon: '⌂' },
  trig:     { name: 'Trigonometria',      icon: '📐' },
  coni:     { name: 'Conicidade',         icon: '📏' },
  poly:     { name: 'Polígonos',          icon: '⬡' },
  furos:    { name: 'Furação Circular',   icon: '⚫' },
  rosca:    { name: 'Roscas',             icon: '🌀' },
  tol:      { name: 'Tolerâncias ISO',    icon: '📊' },
  potencia: { name: 'Potência de Corte',  icon: '⚡' },
  chaveta:  { name: 'Chaveta DIN 6885',   icon: '🔧' },
  conicpad: { name: 'Conicidades Padrão', icon: '🎯' },
  prog:     { name: 'Programação CNC',    icon: '🖥️' },
  guia:     { name: 'Guia de Programação', icon: '📖' },
  'consultor-tecnico': { name: 'Consultor Técnico', icon: '🔎' },
  consult:  { name: 'Consultoria',        icon: '💬' }
};

let accessStatus = null;
let currentUserId = null;
let stopAccessLifecycle;
let hasMountedModule = false;

async function refreshAccess() {
  guardAccess();
  accessStatus = await checkTrialStatus();
  const status = document.getElementById('header-access-status');
  if (status) {
    status.textContent = !accessStatus.ok ? 'Validação necessária' : accessStatus.offline ? 'Modo offline' : accessStatus.activated ? 'Acesso ativo' : 'Período de teste · ' + accessStatus.daysLeft + 'd';
    status.dataset.access = accessStatus.ok ? (accessStatus.activated ? 'licensed' : 'trial') : 'blocked';
  }
  if (accessStatus.ok && !hasMountedModule) await loadModule(window.location.hash?.startsWith('#/guia') ? 'guia' : 'home');
  return accessStatus;
}
function guardAccess() {
  const current = inspectAccessLease();
  if (accessStatus?.ok && current.ok) return true;
  showActivationScreen('Conecte-se para validar seu acesso ao Casillas.');
  return false;
}

/** @param {string} key */
async function loadModule(key) {
  if (!guardAccess()) return;
  if (!MODULE_LOADERS[key]) {
    showToast(`Módulo "${key}" não encontrado`, 'error');
    return;
  }
  const content = document.getElementById('app-content');
  if (!content) return;

  // Limpa conteúdo
  while (content.firstChild) content.removeChild(content.firstChild);

  hideKeyboard();

  try {
    const mod = await MODULE_LOADERS[key]();
    if (!guardAccess()) return;
    if (typeof mod.render !== 'function') {
      showToast('Módulo inválido (sem render)', 'error');
      return;
    }

    const title = MODULE_TITLES[key] || { name: key, icon: '⚙️' };
    const headerName = document.getElementById('module-indicator-name');
    const headerIcon = document.getElementById('module-indicator-icon');
    if (headerName) headerName.textContent = title.name;
    if (headerIcon) {
      // Usa SVG customizado se disponível, senão cai no emoji
      const iconFn = ICONS[key];
      if (iconFn) {
        // ICONS contém SVG estático do desenvolvedor, sem dados de URL/modelo.
        const svg = new DOMParser().parseFromString(iconFn(20), 'image/svg+xml').documentElement;
        headerIcon.replaceChildren(document.importNode(svg, true));
      } else {
        headerIcon.textContent = title.icon;
      }
    }

    mod.render(content, accessStatus, { ownerUserId: currentUserId });
    hasMountedModule = true;
    bindInputsToKeyboard(content);

    // Re-vincula após o módulo renderizar campos dinamicamente.
    // Isso resolve o bug do teclado não abrir na primeira interação.
    setTimeout(() => {
      bindInputsToKeyboard(content);
    }, 100);

    setActiveMenuItem(key);
    appState.currentModule = key;
    await persistCurrentModule(key);
  } catch (err) {
    console.error('Erro ao carregar módulo:', err);
    showToast('Falha ao carregar o módulo', 'error');
  }
}

function initInstallButton() {
  const btn = document.getElementById('btn-install');
  if (!btn) return;

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    deferredPrompt = ev;
    btn.classList.remove('hidden');
  });

  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch {
      // ignora
    }
    deferredPrompt = null;
    btn.classList.add('hidden');
  });

  window.addEventListener('appinstalled', () => {
    btn.classList.add('hidden');
    showToast('Casillas App instalado!', 'success');
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const serviceWorkerUrl = new URL('../service-worker.js', import.meta.url);
  navigator.serviceWorker.register(serviceWorkerUrl).catch((err) => {
    console.warn('Falha ao registrar service worker:', err);
  });
}


// ═══════════════════════════════════════════════════════════
// MENU DE OPÇÕES (⌨️ Ativar teclado / 🗑️ Zerar campos)
// ═══════════════════════════════════════════════════════════

function wireOptionsButtons() {
  const optKeyboard = document.getElementById('opt-keyboard');
  const optClear = document.getElementById('opt-clear');
  const optSignOut = document.getElementById('opt-signout');

  if (optKeyboard && optKeyboard.dataset.wired !== '1') {
    optKeyboard.dataset.wired = '1';
    optKeyboard.addEventListener('click', async (ev) => {
      // Previne que o clique feche o menu antes da hora
      ev.preventDefault();
      ev.stopPropagation();

      // Fecha o dropdown PRIMEIRO
      closeOptionsMenu();

      // Espera o dropdown fechar completamente
      setTimeout(async () => {
        const content = document.getElementById('app-content');
        if (!content) return;

        // Importa dinamicamente
        const kb = await import('./keyboard.js');

        // 1) Garante que o teclado está inicializado
        kb.initKeyboard();

        // 2) Aplica inputmode="none" em todos os inputs
        const inputs = content.querySelectorAll('input, textarea');
        inputs.forEach((inp) => {
          inp.setAttribute('inputmode', 'none');
          inp.dataset.kbdBound = '1';
        });

        // 3) Vincula o container
        kb.bindInputsToKeyboard(content);

        // 4) Encontra o primeiro input visível
        let alvo = null;
        for (const input of inputs) {
          if (input.offsetParent !== null) { alvo = input; break; }
        }

        // 5) Abre o teclado forçadamente (com delay extra)
        if (alvo) {
          alvo.setAttribute('inputmode', 'none');
          alvo.focus();
          kb.showKeyboard(alvo);
          showToast('Teclado ativado!', 'success');
        } else {
          showToast('Nenhum campo encontrado.', 'warning');
        }
      }, 150); // delay para o dropdown fechar
    });
  }

  if (optClear && optClear.dataset.wired !== '1') {
    optClear.dataset.wired = '1';
    optClear.addEventListener('click', () => {
      closeOptionsMenu();
      const content = document.getElementById('app-content');
      if (!content) return;

      const inputs = content.querySelectorAll('input, textarea');
      let count = 0;
      inputs.forEach((input) => {
        if (input.value !== '') {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          count++;
        }
      });

      showToast(`${count} campo(s) zerado(s).`, 'success');
    });
  }

  if (optSignOut && optSignOut.dataset.wired !== '1') {
    optSignOut.dataset.wired = '1';
    optSignOut.addEventListener('click', async () => {
      closeOptionsMenu();
      invalidateAccessLease();
      accessStatus = null;
      showActivationScreen('Sessão encerrada. Entre novamente.');
      const { error } = await signOut();

      if (error) {
        console.error('[AUTH] Erro ao sair da conta:', error);
        showToast('Não foi possível sair da conta.', 'error');
        return;
      }

      window.location.href = './auth.html';
    });
  }
}

function initGuideBridge() {
  // A navegação por hash requer uma Location de navegador disponível.
  if (typeof window.location.hash !== 'string') return;
  const queue = new SyncQueue(outboxStore, sessionOwner, createTransport());
  wireGuideRouter(eventBus, new GuiaManager(), hash => {
    if (window.location.hash === hash) loadModule('guia');
    else window.location.hash = hash;
  });
  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#/guia')) loadModule('guia');
  });
  const flush = () => { void queue.flush().catch(error => console.warn('[EV3] Sync pendente', error)); };
  window.addEventListener('online', flush);
  flush();
}

async function boot() {
  const { user, error: authError } = await getCurrentUser();

  if (authError) {
    console.error('[AUTH] Erro ao verificar sessão:', authError);
    window.location.href = './auth.html';
    return;
  }

  if (!user) {
    window.location.href = './auth.html';
    return;
  }

  currentUserId = user.id;
  try {
    await initDB();
  } catch (err) {
    console.error('Falha ao inicializar DB:', err);
  }

  initKeyboard();
  initInstallButton();
  registerServiceWorker();

  await loadInitialState();
  initMenu(loadModule);
  renderMenuIcons();
  initShareButton();
  initOptionsMenu();
  wireOptionsButtons();

  const result = await refreshAccess();
  stopAccessLifecycle?.();
  stopAccessLifecycle = startAccessLifecycle({
    events: window, document, refresh: refreshAccess, initialResult: result, onExpiry: guardAccess
  });
  initGuideBridge();
}

window.addEventListener('casillas:navigate-module', (event) => {
  const key = event.detail?.key;
  if (!key || !MODULE_LOADERS[key] || key === 'home') return;
  loadModule(key);
});

// ═══════════════════════════════════════════════════════════
// DEBUG: Forçar atualização (limpa cache + service worker)
// ═══════════════════════════════════════════════════════════
window.forcarAtualizacao = async function() {
  try {
    // Desregistra todos os Service Workers
    if ('serviceWorker' in navigator) {
      const registros = await navigator.serviceWorker.getRegistrations();
      for (const reg of registros) {
        await reg.unregister();
      }
    }
    // Limpa todos os caches
    if ('caches' in window) {
      const nomes = await caches.keys();
      for (const nome of nomes) {
        await caches.delete(nome);
      }
    }
    alert('Cache limpo! Recarregando...');
    location.reload(true);
  } catch (err) {
    alert('Erro: ' + err.message);
  }
};
console.log('💡 Digite forcarAtualizacao() no console para limpar cache');

// Reagir a ativação (esconder tela, carregar módulo)
window.addEventListener('casillas:activated', async () => {
  accessStatus = inspectAccessLease();
  const initial = appState.currentModule || 'trig';
  loadModule(initial);
});

window.addEventListener('storage', event => {
  if (event.key === LEASE_KEY || event.key === supabase.auth.storageKey || event.key === null) {
    if (!inspectAccessLease().ok) { accessStatus = null; guardAccess(); }
  }
});

onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    invalidateAccessLease(); accessStatus = null; stopAccessLifecycle?.();
    window.location.href = './auth.html';
  } else if (event === 'SIGNED_IN' && currentUserId && session?.user?.id !== currentUserId) {
    invalidateAccessLease(); accessStatus = null; guardAccess();
    window.location.href = './auth.html';
  }
});

document.addEventListener('DOMContentLoaded', boot);
