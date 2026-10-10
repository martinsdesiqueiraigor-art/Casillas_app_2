// state.js — Estado global do app + KPIs + cabeçalho + persistência

import { getDB, setDB } from './db.js';

export const appState = {
  currentModule: 'trig',
  isActivated: false,
  trialDaysLeft: 30,
  installDate: null,
  lastSeenDate: null,
  kpis: [],
  moduleData: {}
};

const PERSIST_KEY = 'casillas-state';

export function updateKPIs(kpis = []) {
  appState.kpis = kpis;
  const slots = [1, 2, 3];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const labelEl = document.getElementById(`kpi-${slot}-label`);
    const valueEl = document.getElementById(`kpi-${slot}-value`);
    if (!labelEl || !valueEl) continue;

    const item = kpis[i];
    if (item && typeof item === 'object') {
      labelEl.textContent = String(item.label ?? '—');
      valueEl.textContent = String(item.value ?? '—');
    } else {
      labelEl.textContent = '—';
      valueEl.textContent = '—';
    }
  }
}

export function updateHeader(nome, icone) {
  const nameEl = document.getElementById('module-indicator-name');
  if (nameEl) nameEl.textContent = String(nome ?? '');
  // Visual 2.1: o ícone do cabeçalho (SVG) é definido pelo app.js; emojis dos módulos são ignorados.
  void icone;
}

export async function persistCurrentModule(key) {
  if (typeof key !== 'string' || key.length === 0) return;
  appState.currentModule = key;

  try {
    const existing = (await getDB('config', PERSIST_KEY)) || {};
    existing.currentModule = key;
    existing.moduleData = appState.moduleData;
    await setDB('config', PERSIST_KEY, existing);
  } catch {
    // Falha silenciosa em persistência
  }
}

export async function loadInitialState() {
  try {
    const saved = await getDB('config', PERSIST_KEY);
    if (saved && typeof saved === 'object') {
      if (typeof saved.currentModule === 'string') {
        appState.currentModule = saved.currentModule;
      }
      if (saved.moduleData && typeof saved.moduleData === 'object') {
        appState.moduleData = saved.moduleData;
      }
    }
  } catch {
    // Sem estado anterior
  }
  return appState;
}
