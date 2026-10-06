import assert from 'node:assert/strict';
import { after, test } from 'node:test';

globalThis.document = { getElementById: () => null };

const { supabase } = await import('../js/supabase.bundle.js');
const { checkTrialStatus } = await import('../js/trial.js');

const originalGetUser = supabase.auth.getUser;
const originalRpc = supabase.rpc;
const originalConsoleError = console.error;
const originalWindow = globalThis.window;
const originalCustomEvent = globalThis.CustomEvent;

after(() => {
  supabase.auth.getUser = originalGetUser;
  supabase.rpc = originalRpc;
  console.error = originalConsoleError;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalCustomEvent === undefined) delete globalThis.CustomEvent;
  else globalThis.CustomEvent = originalCustomEvent;
  delete globalThis.document;
});

function installActivationDom() {
  const listeners = new Map();
  const activationMessage = { textContent: '' };
  const makeElement = (id) => {
    const classes = new Set();
    return {
      id,
      value: '',
      textContent: '',
      disabled: false,
      dataset: {},
      style: {},
      classList: {
        hidden: false,
        add(name) {
          classes.add(name);
          this.hidden = classes.has('hidden');
        },
        remove(name) {
          classes.delete(name);
          this.hidden = classes.has('hidden');
        }
      },
      addEventListener(type, callback) { listeners.set(`${id}:${type}`, callback); },
      querySelector(selector) {
        return id === 'activation-screen' && selector === '.activation-sub'
          ? activationMessage
          : null;
      },
      focus() {}
    };
  };
  const elements = new Map([
    'activation-screen', 'app-content', 'trial-banner',
    'btn-submit-activation', 'btn-buy-license', 'btn-banner-activate',
    'activation-code'
  ].map((id) => [id, makeElement(id)]));

  globalThis.document = { getElementById: (id) => elements.get(id) || null };
  globalThis.window = { dispatchEvent() {} };
  globalThis.CustomEvent ||= class CustomEvent {
    constructor(type) { this.type = type; }
  };

  return {
    elements,
    activationMessage,
    click: (id) => listeners.get(`${id}:click`)
  };
}

test('falha ao consultar entitlement bloqueia e não consulta trial', async () => {
  const calls = [];
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    return { data: null, error: new Error('entitlement unavailable') };
  };
  console.error = () => {};

  const result = await checkTrialStatus();

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'entitlement-error');
  assert.deepEqual(calls, ['get_casillas_entitlement']);
});

test('falha ao validar a sessão bloqueia sem chamar RPCs comerciais', async () => {
  const calls = [];
  supabase.auth.getUser = async () => ({
    data: { user: null },
    error: new Error('auth unavailable')
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    return { data: null, error: null };
  };
  console.error = () => {};

  const result = await checkTrialStatus();

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'auth-error');
  assert.deepEqual(calls, []);
});

test('usuário ausente bloqueia antes de chamar RPCs comerciais', async () => {
  const calls = [];
  supabase.auth.getUser = async () => ({
    data: { user: null },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    return { data: null, error: null };
  };

  const result = await checkTrialStatus();

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not-authenticated');
  assert.deepEqual(calls, []);
});

test('ausência de entitlement consulta trial remoto', async () => {
  const calls = [];
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    if (name === 'get_casillas_entitlement') {
      return { data: [], error: null };
    }
    return {
      data: {
        status: 'ACTIVE',
        ends_at: new Date(Date.now() + 86400000).toISOString()
      },
      error: null
    };
  };

  const result = await checkTrialStatus();

  assert.equal(result.ok, true);
  assert.deepEqual(calls, ['get_casillas_entitlement', 'start_casillas_trial']);
});

test('entitlement válido libera sem consultar trial', async () => {
  const calls = [];
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    return {
      data: [{ has_access: true, valid_until: null }],
      error: null
    };
  };

  const result = await checkTrialStatus();

  assert.equal(result.ok, true);
  assert.equal(result.activated, true);
  assert.deepEqual(calls, ['get_casillas_entitlement']);
});

test('entitlement expirado não libera acesso e valida trial remoto', async () => {
  const calls = [];
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    if (name === 'get_casillas_entitlement') {
      return {
        data: [{ has_access: true, valid_until: '2000-01-01T00:00:00Z' }],
        error: null
      };
    }
    return {
      data: { status: 'ACTIVE', ends_at: new Date(Date.now() + 86400000).toISOString() },
      error: null
    };
  };

  const result = await checkTrialStatus();

  assert.equal(result.ok, true);
  assert.equal(result.activated, false);
  assert.deepEqual(calls, ['get_casillas_entitlement', 'start_casillas_trial']);
});

test('trial expirado não libera acesso', async () => {
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => name === 'get_casillas_entitlement'
    ? { data: [], error: null }
    : {
        data: { status: 'ACTIVE', ends_at: '2000-01-01T00:00:00Z' },
        error: null
      };

  const result = await checkTrialStatus();

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'expired');
});

test('erro na RPC de trial não libera acesso', async () => {
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => name === 'get_casillas_entitlement'
    ? { data: [], error: null }
    : { data: null, error: new Error('trial unavailable') };
  console.error = () => {};

  const result = await checkTrialStatus();

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'supabase-error');
});

test('ativação sem license_id não consulta entitlement nem libera acesso', async () => {
  const dom = installActivationDom();
  let activationCalls = 0;
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => {
    if (name === 'get_casillas_entitlement') return { data: [], error: null };
    if (name === 'start_casillas_trial') {
      return { data: null, error: new Error('trial unavailable') };
    }
    activationCalls++;
    return { data: [{ entitlement_id: 'entitlement-without-license' }], error: null };
  };
  console.error = () => {};

  await checkTrialStatus();
  dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
  await dom.click('btn-submit-activation')();

  assert.equal(activationCalls, 1);
  assert.equal(dom.elements.get('activation-screen').classList.hidden, false);
});

test('ativação válida só conclui após entitlement revalidado', async () => {
  const dom = installActivationDom();
  const calls = [];
  let entitlementReads = 0;
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    if (name === 'get_casillas_entitlement') {
      entitlementReads++;
      return entitlementReads === 1
        ? { data: [], error: null }
        : { data: [{ has_access: true, valid_until: null }], error: null };
    }
    if (name === 'start_casillas_trial') {
      return { data: null, error: new Error('trial unavailable') };
    }
    return {
      data: { result: 'SUCCESS', license_id: 'license-1' },
      error: null
    };
  };
  console.error = () => {};

  await checkTrialStatus();
  dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
  await dom.click('btn-submit-activation')();

  assert.deepEqual(calls, [
    'get_casillas_entitlement',
    'start_casillas_trial',
    'activate_casillas_license_v2',
    'get_casillas_entitlement'
  ]);
  assert.equal(dom.elements.get('activation-screen').classList.hidden, true);
});

test('ativação aceita pelo RPC mas sem entitlement confirmado continua bloqueada', async () => {
  const dom = installActivationDom();
  const calls = [];
  let entitlementReads = 0;
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    if (name === 'get_casillas_entitlement') {
      entitlementReads++;
      return { data: [], error: null };
    }
    if (name === 'start_casillas_trial') {
      return { data: null, error: new Error('trial unavailable') };
    }
    return { data: { result: 'SUCCESS', license_id: 'license-1' }, error: null };
  };
  console.error = () => {};

  await checkTrialStatus();
  dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
  await dom.click('btn-submit-activation')();

  assert.deepEqual(calls, [
    'get_casillas_entitlement',
    'start_casillas_trial',
    'activate_casillas_license_v2',
    'get_casillas_entitlement'
  ]);
  assert.equal(entitlementReads, 2);
  assert.equal(dom.elements.get('activation-screen').classList.hidden, false);
});

test('erro na RPC de ativação não consulta entitlement novamente', async () => {
  const dom = installActivationDom();
  const calls = [];
  supabase.auth.getUser = async () => ({
    data: { user: { id: 'test-user' } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    if (name === 'get_casillas_entitlement') return { data: [], error: null };
    if (name === 'start_casillas_trial') {
      return { data: null, error: new Error('trial unavailable') };
    }
    return { data: null, error: new Error('activation unavailable') };
  };
  console.error = () => {};

  await checkTrialStatus();
  dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
  await dom.click('btn-submit-activation')();

  assert.deepEqual(calls, [
    'get_casillas_entitlement',
    'start_casillas_trial',
    'activate_casillas_license_v2'
  ]);
  assert.equal(dom.elements.get('activation-screen').classList.hidden, false);
});

for (const result of ['ACTIVATION_DENIED', 'INVALID_REQUEST', 'RATE_LIMITED', 'UNKNOWN']) {
  test('resultado estruturado ' + result + ' não concede acesso nem revalida entitlement', async () => {
    const dom = installActivationDom();
    const calls = [];
    supabase.auth.getUser = async () => ({ data: { user: { id: 'test-user' } }, error: null });
    supabase.rpc = async name => {
      calls.push(name);
      if (name === 'get_casillas_entitlement') return { data: [], error: null };
      if (name === 'start_casillas_trial') return { data: null, error: new Error('trial unavailable') };
      // Even contradictory/malformed data must not turn a failure into success.
      return { data: { result, license_id: 'must-not-authorize', retry_after_seconds: 30 }, error: null };
    };
    console.error = () => {};
    await checkTrialStatus();
    dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
    await dom.click('btn-submit-activation')();
    assert.deepEqual(calls, ['get_casillas_entitlement', 'start_casillas_trial', 'activate_casillas_license_v2']);
    assert.equal(dom.elements.get('activation-screen').classList.hidden, false);
  });
}
