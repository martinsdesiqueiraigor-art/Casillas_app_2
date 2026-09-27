// trial.js — Sistema de trial (30 dias) + ativação por código (Modelo 2)
// Modelo 2: Códigos pré-gerados, NÃO vinculados ao Device ID.
// Cada código funciona em até 3 aparelhos diferentes.
// Códigos podem ser revogados (lista negra embutida).

import { getDB, setDB } from './db.js';
import { supabase } from './supabase.bundle.js';

const TRIAL_DAYS = 30;
const WHATSAPP = '5519996816755';
const DAY_MS = 86400000;
const MAX_DEVICES_PER_CODE = 3;

async function getSupabaseTrial() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('[TRIAL] Erro ao obter usuário:', userError);
    return { ok: false, reason: 'auth-error' };
  }

  if (!user) {
    return { ok: false, reason: 'not-authenticated' };
  }

  const { data, error } = await supabase.rpc('start_casillas_trial');

  if (error) {
    console.error('[TRIAL] Erro ao iniciar/consultar trial:', error);
    return { ok: false, reason: 'supabase-error', error };
  }

  if (!data) {
    return { ok: false, reason: 'trial-not-found' };
  }

  const endsAt = new Date(data.ends_at);
  const now = new Date();

  if (Number.isNaN(endsAt.getTime())) {
    return { ok: false, reason: 'invalid-end-date' };
  }

  if (endsAt <= now || data.status !== 'ACTIVE') {
    return {
      ok: false,
      activated: false,
      reason: 'expired',
      daysLeft: 0
    };
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((endsAt.getTime() - now.getTime()) / DAY_MS)
  );

  return {
    ok: true,
    activated: false,
    daysLeft,
    trial: data
  };
}

const KEYS = {
  install: 'trial-install-date',
  lastSeen: 'trial-last-seen',
  activated: 'trial-activated',
  activeCode: 'trial-active-code',
  deviceId: 'device-id',
  activatedCodes: 'activated-codes-registry'
};

// ═══════════════════════════════════════════════════════════
// ANTI-BURLA — Chaves e funções
// ═══════════════════════════════════════════════════════════
const LS_KEYS = {
  installBackup: 'casillas-install-backup',
  installHash: 'casillas-install-hash',
  fingerprint: 'casillas-fingerprint',
  tentativas: 'casillas-tentativas-manipulacao'
};

const MAX_TENTATIVAS_MANIPULACAO = 1;  // 1 exceção, depois bloqueia

// Gera fingerprint único do dispositivo
function gerarFingerprint() {
  try {
    const dados = [
      navigator.userAgent || '',
      (screen.width || 0) + 'x' + (screen.height || 0),
      navigator.language || '',
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      navigator.platform || '',
      navigator.hardwareConcurrency || 0
    ].join('|');

    // Hash simples (djb2) para não guardar o fingerprint em claro
    let h = 5381;
    for (let i = 0; i < dados.length; i++) {
      h = ((h << 5) + h + dados.charCodeAt(i)) >>> 0;
    }
    return h.toString(16).padStart(8, '0').toUpperCase();
  } catch {
    return 'UNKNOWN';
  }
}

// Gera hash do installDate + deviceId (usa SHA-256 se disponível)
async function gerarHashInstall(installDate, deviceId) {
  const dados = `${installDate}:${deviceId}:CasillasApp_SALT_2026_!@#`;

  if (self.crypto && self.crypto.subtle && self.crypto.subtle.digest) {
    try {
      const enc = new TextEncoder();
      const buf = await self.crypto.subtle.digest('SHA-256', enc.encode(dados));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
    } catch {
      // Fallback abaixo
    }
  }

  // Fallback: hash simples (djb2)
  let h = 5381;
  for (let i = 0; i < dados.length; i++) {
    h = ((h << 5) + h + dados.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0').toUpperCase().padEnd(64, '0');
}

// Verifica integridade do trial (IndexedDB + localStorage + fingerprint)
async function verificarIntegridade(installDate) {
  const deviceId = getOrCreateDeviceId();
  const lsInstall = localStorage.getItem(LS_KEYS.installBackup);
  const lsHash = localStorage.getItem(LS_KEYS.installHash);
  const lsFingerprint = localStorage.getItem(LS_KEYS.fingerprint);
  const tentativas = parseInt(localStorage.getItem(LS_KEYS.tentativas) || '0', 10);

  const fingerprintAtual = gerarFingerprint();
  const hashEsperado = await gerarHashInstall(installDate, deviceId);

  // ─── Caso 1: Primeira vez (tudo vazio) ───
  if (!lsInstall && !lsHash && !lsFingerprint) {
    localStorage.setItem(LS_KEYS.installBackup, String(installDate));
    localStorage.setItem(LS_KEYS.installHash, hashEsperado);
    localStorage.setItem(LS_KEYS.fingerprint, fingerprintAtual);
    return { ok: true, motivo: 'primeira-vez', tentativas };
  }

  // ─── Caso 2: localStorage tem dados, mas IndexedDB está vazio ───
  if (lsInstall && !installDate) {
    return { ok: false, motivo: 'indexeddb-limpo', tentativas };
  }

  // ─── Caso 3: Fingerprint mudou (troca de aparelho?) ───
  if (lsFingerprint && lsFingerprint !== fingerprintAtual) {
    return { ok: false, motivo: 'fingerprint-mudou', tentativas };
  }

  // ─── Caso 4: Hash não bate (manipulação) ───
  if (lsHash && lsHash !== hashEsperado) {
    return { ok: false, motivo: 'hash-diferente', tentativas };
  }

  // ─── Caso 5: installDate do IndexedDB é MAIOR que o do localStorage ───
  // (indica que o IndexedDB foi sobrescrito com data mais recente)
  if (lsInstall && installDate > parseInt(lsInstall, 10)) {
    return { ok: false, motivo: 'data-futura', tentativas };
  }

  // ─── Tudo OK ───
  return { ok: true, motivo: 'ok', tentativas };
}

// Registra uma tentativa de manipulação
function registrarManipulacao() {
  const tentativas = parseInt(localStorage.getItem(LS_KEYS.tentativas) || '0', 10);
  localStorage.setItem(LS_KEYS.tentativas, String(tentativas + 1));
  return tentativas + 1;
}

// Reseta as tentativas (após ativação legítima)
function resetarTentativas() {
  localStorage.removeItem(LS_KEYS.tentativas);
}

// ═══════════════════════════════════════════════════════════
// LISTA DE CÓDIGOS VÁLIDOS (hash FNV-1a, 8 caracteres)
// ═══════════════════════════════════════════════════════════
// IMPORTANTE: Esta lista é gerada pelo gerar-codigo.html
// Cole aqui os HASHES (não os códigos em texto puro)
// Formato: 'A1B2C3D4'

const CODIGOS_VALIDOS_HASH = [
  'AD8AA78C',
  'AE5D3EF2',
  'C1C0F658',
  'E103AB08',
  '2F39DDDE',
  '05FA2257',
  'E965AA90',
  '4804DC9C',
  '9C4DF04C',
  '09A60293',
  // Cole os hashes aqui
];

// Lista negra (códigos revogados)
const CODIGOS_REVOGADOS_HASH = [
  // Cole os hashes revogados aqui
];

// ═══════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════

function getOrCreateDeviceId() {
  let id = localStorage.getItem(KEYS.deviceId);
  if (id && id.length >= 8) return id;

  const bytes = new Uint8Array(16);
  if (self.crypto && self.crypto.getRandomValues) {
    self.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  id = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  localStorage.setItem(KEYS.deviceId, id);
  return id;
}

function hashCodigo(codigo) {
  let h = 0x811c9dc5;
  const s = String(codigo).toUpperCase().replace(/[^A-Z0-9]/g, '');
  for (let i = 0; i < s.length; i++) {
    h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0').toUpperCase();
}

function normalizeCode(raw) {
  const clean = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.startsWith('CASILLAS') && clean.length >= 16) {
    return 'CASILLAS-' + clean.slice(8, 12) + '-' + clean.slice(12, 16);
  }
  return clean;
}

// ═══════════════════════════════════════════════════════════
// REGISTRO DE CÓDIGOS ATIVADOS
// ═══════════════════════════════════════════════════════════

async function getActivatedCodesRegistry() {
  const reg = await getDB('config', KEYS.activatedCodes);
  return (reg && typeof reg === 'object') ? reg : {};
}

async function registrarAtivacao(codeHash, deviceId) {
  const reg = await getActivatedCodesRegistry();
  if (!reg[codeHash]) reg[codeHash] = [];
  if (!reg[codeHash].includes(deviceId)) {
    reg[codeHash].push(deviceId);
  }
  await setDB('config', KEYS.activatedCodes, reg);
  return reg[codeHash].length;
}

async function contarAparelhos(codeHash) {
  const reg = await getActivatedCodesRegistry();
  return (reg[codeHash] || []).length;
}

// ═══════════════════════════════════════════════════════════
// VERIFICAÇÃO DE CÓDIGO
// ═══════════════════════════════════════════════════════════

async function validarCodigo(codigo) {
  const normalizado = normalizeCode(codigo);
  const hash = hashCodigo(normalizado);

  if (CODIGOS_REVOGADOS_HASH.includes(hash)) {
    return { ok: false, reason: 'revoked' };
  }

  if (!CODIGOS_VALIDOS_HASH.includes(hash)) {
    return { ok: false, reason: 'invalid' };
  }

  const deviceId = getOrCreateDeviceId();
  const aparelhos = await contarAparelhos(hash);

  if (aparelhos >= MAX_DEVICES_PER_CODE) {
    const reg = await getActivatedCodesRegistry();
    const jaAtivouNeste = (reg[hash] || []).includes(deviceId);
    if (!jaAtivouNeste) {
      return { ok: false, reason: 'limit' };
    }
  }

  return { ok: true, hash, codigo: normalizado };
}

// ═══════════════════════════════════════════════════════════
// UI — TELA DE ATIVAÇÃO
// ═══════════════════════════════════════════════════════════

function showActivationScreen(mensagem) {
  const screen = document.getElementById('activation-screen');
  if (screen) screen.classList.remove('hidden');
  const content = document.getElementById('app-content');
  if (content) content.classList.add('hidden');
  if (mensagem && screen) {
    const msgEl = screen.querySelector('.activation-sub');
    if (msgEl) msgEl.textContent = mensagem;
  }
}

function hideActivationScreen() {
  const screen = document.getElementById('activation-screen');
  if (screen) screen.classList.add('hidden');
  const content = document.getElementById('app-content');
  if (content) content.classList.remove('hidden');
}

function showTrialBanner(daysLeft) {
  const banner = document.getElementById('trial-banner');
  const msg = document.getElementById('trial-message');
  if (!banner || !msg) return;

  // Se o trial expirou, esconde o banner
  if (daysLeft <= 0) {
    banner.classList.add('hidden');
    return;
  }

  // Define cor e mensagem conforme urgência
  let cor, texto;

  if (daysLeft > 7) {
    cor = 'success';
    texto = `🎁 Versão gratuita — Teste: ${daysLeft} dias restantes`;
  } else if (daysLeft > 3) {
    cor = 'warning';
    texto = `⏰ Teste: ${daysLeft} dias restantes`;
  } else {
    cor = 'danger';
    texto = `⚠️ Últimos ${daysLeft} dias! Ative agora.`;
  }

  msg.textContent = texto;
  banner.dataset.type = cor;
  banner.classList.remove('hidden');

  const cores = {
    success: { bg: 'rgba(63, 185, 80, 0.14)', border: 'var(--success)' },
    warning: { bg: 'rgba(210, 153, 34, 0.14)', border: 'var(--warning)' },
    danger:  { bg: 'rgba(248, 81, 73, 0.14)',  border: 'var(--danger)' }
  };
  const c = cores[cor];
  banner.style.background = c.bg;
  banner.style.borderBottomColor = c.border;
  msg.style.color = c.border;

  const btnAtivar = document.getElementById('btn-banner-activate');
  if (btnAtivar) {
    btnAtivar.className = 'btn btn-sm ' + (cor === 'success' ? 'btn-outline' : 'btn-primary');
  }
}

function wireActivationButtons() {
  const btnSubmit = document.getElementById('btn-submit-activation');
  const btnBuy = document.getElementById('btn-buy-license');
  const input = document.getElementById('activation-code');

  if (btnSubmit && !btnSubmit.dataset.wired) {
    btnSubmit.dataset.wired = '1';
    btnSubmit.addEventListener('click', async () => {
      const raw = (input && input.value) || '';
      if (!raw.trim()) {
        const { showToast } = await import('./utils.js');
        showToast('Digite o código de ativação.', 'warning');
        return;
      }

      const resultado = await validarCodigo(raw);

      if (resultado.ok) {
        const deviceId = getOrCreateDeviceId();
        const total = await registrarAtivacao(resultado.hash, deviceId);
        await setDB('config', KEYS.activated, true);
        await setDB('config', KEYS.activeCode, resultado.codigo);

        // Anti-burla: limpa tentativas após ativação legítima
        resetarTentativas();

        hideActivationScreen();
        const banner = document.getElementById('trial-banner');
        if (banner) banner.classList.add('hidden');

        window.dispatchEvent(new CustomEvent('casillas:activated'));

        const { showToast } = await import('./utils.js');
        showToast(`App ativado! (${total}/${MAX_DEVICES_PER_CODE} aparelhos)`, 'success');
      } else {
        const { showToast } = await import('./utils.js');
        const msgs = {
          invalid: 'Código inválido. Verifique e tente novamente.',
          revoked: 'Este código foi revogado. Contate o suporte.',
          limit: `Este código já foi ativado em ${MAX_DEVICES_PER_CODE} aparelhos.`
        };
        showToast(msgs[resultado.reason] || 'Erro na ativação.', 'error');
      }
    });
  }

  if (btnBuy && !btnBuy.dataset.wired) {
    btnBuy.dataset.wired = '1';
    btnBuy.addEventListener('click', () => {
      const msg = encodeURIComponent(
        'Olá! Quero comprar uma licença do Casillas App.'
      );
      window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
    });
  }

  if (input && !input.dataset.wired) {
    input.dataset.wired = '1';
    input.addEventListener('input', () => {
      let v = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (v.length > 16) v = v.slice(0, 16);
      const parts = [];
      if (v.startsWith('CASILLAS')) {
        parts.push('CASILLAS');
        const resto = v.slice(8);
        for (let i = 0; i < resto.length && i < 8; i += 4) {
          parts.push(resto.slice(i, i + 4));
        }
      } else {
        for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i + 4));
      }
      input.value = parts.join('-');
    });
  }
}

// ═══════════════════════════════════════════════════════════
// VERIFICAÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════

export async function checkTrialStatus() {
  const supabaseTrial = await getSupabaseTrial();

  if (supabaseTrial.ok) {
    wireActivationButtons();
    hideActivationScreen();
    showTrialBanner(supabaseTrial.daysLeft);
    return supabaseTrial;
  }

  const now = Date.now();

  let installDate = await getDB('config', KEYS.install);

  // ═══════════════════════════════════════════════════════════
  // ANTI-BURLA: verificar integridade ANTES de calcular o trial
  // ═══════════════════════════════════════════════════════════
  const integridade = await verificarIntegridade(installDate);

  if (!integridade.ok) {
    // Se o app está ativado, ignora a manipulação (cliente pagou)
    const isActivated = (await getDB('config', KEYS.activated)) === true;
    if (!isActivated) {
      const tentativas = registrarManipulacao();
      console.warn('[TRIAL] Manipulação detectada:', integridade.motivo, '| Tentativas:', tentativas);

      // Se excedeu o limite, bloqueia
      if (tentativas > MAX_TENTATIVAS_MANIPULACAO) {
        showActivationScreen('Detectamos uma manipulação nos dados do app. Ative para continuar.');
        return { ok: false, activated: false, reason: 'manipulado', daysLeft: 0 };
      }

      // Senão, avisa e restaura do localStorage
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Detectamos uma inconsistência. Não limpe os dados do app.', 'warning');
      }
    }

    // Restaura o installDate do localStorage (se existir)
    const lsInstall = parseInt(localStorage.getItem(LS_KEYS.installBackup) || '0', 10);
    if (lsInstall > 0) {
      installDate = lsInstall;
      await setDB('config', KEYS.install, installDate);
    }
  }

  // Se não existir installDate, cria
  if (typeof installDate !== 'number' || !Number.isFinite(installDate)) {
    installDate = now;
    await setDB('config', KEYS.install, installDate);
  }

  // Se passou por tudo, atualiza o backup no localStorage
  if (integridade.ok && typeof installDate === 'number') {
    const deviceId = getOrCreateDeviceId();
    const hash = await gerarHashInstall(installDate, deviceId);
    localStorage.setItem(LS_KEYS.installBackup, String(installDate));
    localStorage.setItem(LS_KEYS.installHash, hash);
    localStorage.setItem(LS_KEYS.fingerprint, gerarFingerprint());
  }

  const isActivated = (await getDB('config', KEYS.activated)) === true;

  const lastSeen = await getDB('config', KEYS.lastSeen);
  await setDB('config', KEYS.lastSeen, now);

  wireActivationButtons();

  if (isActivated) {
    hideActivationScreen();
    const banner = document.getElementById('trial-banner');
    if (banner) banner.classList.add('hidden');
    return { ok: true, activated: true, daysLeft: Infinity };
  }

  if (typeof lastSeen === 'number' && now < lastSeen - DAY_MS) {
    showActivationScreen('Detectamos uma alteração no relógio. Ative o app para continuar.');
    return { ok: false, activated: false, reason: 'tampered', daysLeft: 0 };
  }

  const elapsed = now - installDate;
  const daysUsed = Math.floor(elapsed / DAY_MS);
  const daysLeft = Math.max(0, TRIAL_DAYS - daysUsed);

  if (daysLeft <= 0) {
    showActivationScreen('Seu período de avaliação terminou. Ative o app para continuar.');
    return { ok: false, activated: false, reason: 'expired', daysLeft: 0 };
  }

  hideActivationScreen();
  showTrialBanner(daysLeft);
  return { ok: true, activated: false, daysLeft };
}

export { TRIAL_DAYS, WHATSAPP, MAX_DEVICES_PER_CODE, hashCodigo };
