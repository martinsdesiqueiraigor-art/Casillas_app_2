import {
  signIn,
  signUp,
  resetPassword
} from './auth.js';

const form = document.getElementById('auth-form');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const submitButton = document.getElementById('btn-auth-submit');
const forgotButton = document.getElementById('btn-forgot-password');
const loginTab = document.getElementById('tab-login');
const signupTab = document.getElementById('tab-signup');
const message = document.getElementById('auth-message');

let mode = 'login';

function showMessage(text) {
  message.textContent = text;
}

function setMode(nextMode) {
  mode = nextMode;

  const isLogin = mode === 'login';

  loginTab.classList.toggle('btn-primary', isLogin);
  loginTab.classList.toggle('btn-outline', !isLogin);
  loginTab.setAttribute('aria-selected', String(isLogin));

  signupTab.classList.toggle('btn-primary', !isLogin);
  signupTab.classList.toggle('btn-outline', isLogin);
  signupTab.setAttribute('aria-selected', String(!isLogin));

  submitButton.textContent = isLogin ? 'Entrar' : 'Criar conta';
  passwordInput.autocomplete = isLogin ? 'current-password' : 'new-password';

  showMessage('');
}

function setLoading(loading) {
  submitButton.disabled = loading;
  loginTab.disabled = loading;
  signupTab.disabled = loading;
  forgotButton.disabled = loading;
  submitButton.textContent = loading
    ? 'Aguarde...'
    : mode === 'login'
      ? 'Entrar'
      : 'Criar conta';
}

async function handleSubmit(event) {
  event.preventDefault();

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

setMode('login');

