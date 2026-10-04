// trial.js — Sistema de trial (30 dias) + ativação por código (Modelo 2)
// Modelo 2: Códigos pré-gerados, NÃO vinculados ao Device ID.

// Códigos podem ser revogados (lista negra embutida).

import { supabase } from './supabase.bundle.js';

const TRIAL_DAYS = 30;
const WHATSAPP = '5519996816755';
const DAY_MS = 86400000;

async function getSupabaseEntitlement() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, reason: userError ? 'auth-error' : 'not-authenticated' };
  }

  const { data, error } = await supabase.rpc('get_casillas_entitlement');

  if (error) {
    console.error('[TRIAL] Erro ao consultar entitlement:', error);
    return { ok: false, reason: 'entitlement-error', error };
  }

  const entitlement = Array.isArray(data) ? data[0] : data;
  const validUntil = entitlement?.valid_until;
  const isWithinValidity = !validUntil || new Date(validUntil) > new Date();

  return {
    ok: entitlement?.has_access === true && isWithinValidity,
    entitlement
  };
}

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
  activeCode: 'trial-active-code'
};

// UI — TELA DE ATIVAÇÃO
// ═══════════════════════════════════════════════════════════

export function showActivationScreen(mensagem) {
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
    texto = `🎁 Período de teste — ${daysLeft} dias restantes`;
  } else if (daysLeft > 3) {
    cor = 'warning';
    texto = `⏰ Período de teste — ${daysLeft} dias restantes`;
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

function activationErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();
  const status = Number(error?.status || 0);

  if (
    status === 401 ||
    status === 403 ||
    error?.name === 'AuthSessionMissingError' ||
    message.includes('não autenticado') ||
    message.includes('auth session missing') ||
    message.includes('invalid jwt')
  ) {
    return 'Sua sessão expirou. Entre novamente para ativar a licença.';
  }

  if (message.includes('já possui acesso comercial')) {
    return 'Sua conta já possui acesso comercial ao Casillas.';
  }

  if (message.includes('código de licença inválido')) {
    return 'Código inválido, indisponível ou já utilizado. Verifique e tente novamente.';
  }

  if (!status || status >= 500 || error?.name?.includes('Fetch')) {
    return 'Não foi possível conectar ao serviço de ativação. Verifique sua conexão e tente novamente.';
  }

  return 'Não foi possível concluir a ativação. Tente novamente.';
}

function wireActivationButtons() {
  const btnSubmit = document.getElementById('btn-submit-activation');
  const btnBuy = document.getElementById('btn-buy-license');
  const btnBanner = document.getElementById('btn-banner-activate');
  const input = document.getElementById('activation-code');

  if (btnSubmit && !btnSubmit.dataset.wired) {
    btnSubmit.dataset.wired = '1';
    btnSubmit.addEventListener('click', async () => {
      const rawCode = (input && input.value) || '';
      if (!rawCode.trim()) {
        const { showToast } = await import('./utils.js');
        showToast('Digite o código de ativação.', 'warning');
        return;
      }

      const idleLabel = btnSubmit.textContent;
      let activationConfirmed = false;
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Ativando...';

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          const { showToast } = await import('./utils.js');
          const message = authError
            ? activationErrorMessage(authError)
            : 'Sua sessão expirou. Entre novamente para ativar a licença.';
          showToast(message, 'error');
          return;
        }

        const { data, error } = await supabase.rpc('activate_casillas_license', {
          p_license_code: rawCode
        });

        if (error) {
          const { showToast } = await import('./utils.js');
          showToast(activationErrorMessage(error), 'error');
          return;
        }

        const activation = Array.isArray(data) ? data[0] : data;
        if (!activation || typeof activation !== 'object' || !activation.license_id) {
          const { showToast } = await import('./utils.js');
          showToast('O serviço retornou uma resposta inesperada. Nenhum acesso foi liberado.', 'error');
          return;
        }

        activationConfirmed = true;
        const entitlement = await getSupabaseEntitlement();

        if (!entitlement.ok) {
          const message = 'Licença processada, mas ainda não foi possível confirmar seu acesso. Verifique sua conexão e tente novamente.';
          showActivationScreen(message);
          const { showToast } = await import('./utils.js');
          showToast(message, 'warning');
          return;
        }

        hideActivationScreen();
        const banner = document.getElementById('trial-banner');
        if (banner) banner.classList.add('hidden');

        // O listener apenas carrega a interface; o entitlement já foi confirmado acima.
        window.dispatchEvent(new CustomEvent('casillas:activated'));

        const { showToast } = await import('./utils.js');
        showToast('Licença ativada com sucesso!', 'success');
      } catch (error) {
        if (activationConfirmed) {
          const message = 'Licença processada, mas ainda não foi possível confirmar seu acesso. Verifique sua conexão e tente novamente.';
          showActivationScreen(message);
          const { showToast } = await import('./utils.js');
          showToast(message, 'warning');
        } else {
          const { showToast } = await import('./utils.js');
          showToast(activationErrorMessage(error), 'error');
        }
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = idleLabel;
      }
    });
  }

  if (btnBanner && !btnBanner.dataset.wired) {
    btnBanner.dataset.wired = '1';
    btnBanner.addEventListener('click', () => {
      showActivationScreen();
      if (input) input.focus();
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
  wireActivationButtons();
  const entitlement = await getSupabaseEntitlement();

  if (entitlement.ok) {
    hideActivationScreen();
    const banner = document.getElementById('trial-banner');
    if (banner) banner.classList.add('hidden');
    return { ok: true, activated: true, daysLeft: Infinity };
  }

  if (entitlement.reason) {
    showActivationScreen('Não foi possível verificar seu acesso. Verifique sua conexão e tente novamente.');
    return {
      ok: false,
      activated: false,
      reason: entitlement.reason,
      daysLeft: 0
    };
  }

  // Para usuários não licenciados, o Supabase é a autoridade do trial.
  const supabaseTrial = await getSupabaseTrial();

  if (supabaseTrial.ok) {
    hideActivationScreen();
    showTrialBanner(supabaseTrial.daysLeft);
    return supabaseTrial;
  }

  if (supabaseTrial.reason === 'expired') {
    showActivationScreen('Seu período de teste terminou. Ative o app para continuar.');
    return supabaseTrial;
  }

  showActivationScreen('Não foi possível verificar seu acesso. Verifique sua conexão e tente novamente.');
  return {
    ok: false,
    activated: false,
    reason: supabaseTrial.reason || 'access-check-failed',
    daysLeft: 0
  };
}
export { TRIAL_DAYS, WHATSAPP };
