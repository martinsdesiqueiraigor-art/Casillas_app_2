import {
  signIn,
  signUp,
  resetPassword,
  updatePassword,
  signOut,
  onAuthStateChange
} from './auth.js';

const form = document.getElementById('auth-form');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const passwordLabel = document.getElementById('auth-password-label');
const passwordConfirmGroup = document.getElementById('auth-password-confirm-group');
const passwordConfirmInput = document.getElementById('auth-password-confirm');
const submitButton = document.getElementById('btn-auth-submit');
const forgotButton = document.getElementById('btn-forgot-password');
const loginTab = document.getElementById('tab-login');
const signupTab = document.getElementById('tab-signup');
const tabs = document.querySelector('.auth-tabs');
const message = document.getElementById('auth-message');

let mode = 'login';

function showMessage(text) {
  message.textContent = text;
}

function setMode(nextMode) {
  mode = nextMode;

  if (mode === 'recovery') {
    tabs.hidden = true;
    emailInput.closest('.input-group').hidden = true;
    forgotButton.hidden = true;
    passwordConfirmGroup.hidden = false;
    passwordConfirmInput.required = true;
    passwordLabel.textContent = 'Nova senha';
    passwordInput.autocomplete = 'new-password';
    passwordInput.placeholder = 'Digite a nova senha';
    submitButton.textContent = 'Redefinir senha';
    showMessage('Digite e confirme sua nova senha.');
    passwordInput.focus();
    return;
  }

  const isLogin = mode === 'login';

  tabs.hidden = false;
  emailInput.closest('.input-group').hidden = false;
  forgotButton.hidden = false;
  passwordConfirmGroup.hidden = true;
  passwordConfirmInput.required = false;
  passwordConfirmInput.value = '';
  passwordLabel.textContent = 'Senha';

  loginTab.classList.toggle('btn-primary', isLogin);
  loginTab.classList.toggle('btn-outline', !isLogin);
  loginTab.setAttribute('aria-selected', String(isLogin));

  signupTab.classList.toggle('btn-primary', !isLogin);
  signupTab.classList.toggle('btn-outline', isLogin);
  signupTab.setAttribute('aria-selected', String(!isLogin));

  submitButton.textContent = isLogin ? 'Entrar' : 'Criar conta';
  passwordInput.autocomplete = isLogin ? 'current-password' : 'new-password';
  passwordInput.placeholder = isLogin ? 'Sua senha' : 'Crie uma senha';

  showMessage('');
}

function setLoading(loading) {
  submitButton.disabled = loading;
  loginTab.disabled = loading;
  signupTab.disabled = loading;
  forgotButton.disabled = loading;

  if (loading) {
    submitButton.textContent = 'Aguarde...';
    return;
  }

  submitButton.textContent = mode === 'recovery'
    ? 'Redefinir senha'
    : mode === 'login'
      ? 'Entrar'
      : 'Criar conta';
}

async function handleRecoverySubmit() {
  const password = passwordInput.value;
  const confirmation = passwordConfirmInput.value;

  if (!password || !confirmation) {
    showMessage('Digite e confirme a nova senha.');
    return;
  }

  if (password.length < 6) {
    showMessage('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  if (password !== confirmation) {
    showMessage('As senhas não coincidem.');
    return;
  }

  setLoading(true);
  showMessage('');

  try {
    const { error } = await updatePassword(password);

    if (error) {
      showMessage(error.message);
      return;
    }

    await signOut();
    passwordInput.value = '';
    setMode('login');
    showMessage('Senha redefinida. Entre com sua nova senha.');
    emailInput.focus();
  } catch (error) {
    console.error('[AUTH RECOVERY]', error);
    showMessage('Não foi possível redefinir a senha.');
  } finally {
    setLoading(false);
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (mode === 'recovery') {
    await handleRecoverySubmit();
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage('Informe seu e-mail e sua senha.');
    return;
  }

  if (password.length < 6) {
    showMessage('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  setLoading(true);
  showMessage('');

  try {
    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (result.error) {
      showMessage(result.error.message);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      showMessage(
        'Conta criada. Verifique seu e-mail para confirmar o cadastro.'
      );
      return;
    }

    window.location.href = './index.html';
  } catch (error) {
    console.error('[AUTH PAGE]', error);
    showMessage('Não foi possível concluir a operação.');
  } finally {
    setLoading(false);
  }
}

loginTab.addEventListener('click', () => setMode('login'));
signupTab.addEventListener('click', () => setMode('signup'));
form.addEventListener('submit', handleSubmit);

forgotButton.addEventListener('click', async () => {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage('Informe seu e-mail para recuperar a senha.');
    emailInput.focus();
    return;
  }

  setLoading(true);
  showMessage('Enviando instruções...');

  try {
    const { error } = await resetPassword(email);

    if (error) {
      showMessage(error.message);
      return;
    }

    showMessage('Verifique seu e-mail para redefinir a senha.');
  } catch (error) {
    console.error('[AUTH PAGE]', error);
    showMessage('Não foi possível iniciar a recuperação.');
  } finally {
    setLoading(false);
  }
});

onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    setMode('recovery');
  }
});

setMode('login');
