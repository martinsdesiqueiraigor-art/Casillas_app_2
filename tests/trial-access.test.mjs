import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import './offline-lease.test.mjs';
import './access-app.test.mjs';
globalThis.document = { getElementById: () => null };
const { supabase } = await import('../js/supabase.bundle.js');
const { checkTrialStatus, invalidateAccessLease } = await import('../js/trial.js');
const { getCurrentUser } = await import('../js/auth.js');
const { LEASE_KEY } = await import('../js/auth.js');
const originalGetUser = supabase.auth.getUser, originalRpc = supabase.rpc;
const originalWindow = globalThis.window, originalCustomEvent = globalThis.CustomEvent;
const originalStorage = globalThis.localStorage, originalNow = Date.now;
const originalOnline = Object.getOwnPropertyDescriptor(globalThis.navigator, 'onLine');
const USER = '11111111-1111-4111-8111-111111111111';
const NOW = Date.parse('2026-10-10T12:00:00Z');
const values = new Map();
function accessReply(ok, source = 'LICENSE') {
  return { contract_version: 2, user_id: USER, product: 'casillas', validated_at: new Date(NOW).toISOString(),
    has_access: ok, state: ok ? 'VALID' : 'NO_ACCESS', source: ok ? source : null,
    valid_until: source === 'TRIAL' ? new Date(NOW + 86400000).toISOString() : null };
}
beforeEach(() => {
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,String(v)), removeItem: k => values.delete(k) };
  invalidateAccessLease(); values.clear();
  Date.now = () => NOW;
  Object.defineProperty(globalThis.navigator, 'onLine', { value: true, configurable: true });
  const token = 'e30.' + Buffer.from(JSON.stringify({sub:USER,role:'authenticated',exp:1})).toString('base64url') + '.fixture';
  values.set(supabase.auth.storageKey, JSON.stringify({user:{id:USER},access_token:token,expires_at:1}));
  globalThis.document = { getElementById: () => null };
  supabase.auth.getUser = async () => ({data:{user:{id:USER}},error:null});
});
after(() => {
  supabase.auth.getUser = originalGetUser; supabase.rpc = originalRpc; Date.now = originalNow;
  if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  if (originalOnline) Object.defineProperty(globalThis.navigator, 'onLine', originalOnline); else delete globalThis.navigator.onLine;
  if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
  if (originalCustomEvent === undefined) delete globalThis.CustomEvent; else globalThis.CustomEvent = originalCustomEvent;
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

test('erro da fachada bloqueia sem fallback RPC legado', async () => {
  const calls = []; supabase.rpc = async name => { calls.push(name); return {data:null,error:new Error('authority unavailable')}; };
  assert.equal((await checkTrialStatus()).ok,false); assert.deepEqual(calls,['get_casillas_access_v2']);
});
test('erro explícito de sessão bloqueia sem RPC comercial', async () => {
  let calls=0; supabase.auth.getUser=async()=>({data:{user:null},error:new Error('auth unavailable')});
  supabase.rpc=async()=>{calls++;}; assert.equal((await checkTrialStatus()).ok,false); assert.equal(calls,0);
});
test('ausência de usuário bloqueia sem RPC', async () => {
  let calls=0; supabase.auth.getUser=async()=>({data:{user:null},error:null}); supabase.rpc=async()=>{calls++;};
  assert.equal((await checkTrialStatus()).ok,false); assert.equal(calls,0);
});
test('trial confirmado pela fachada libera sem chamar start legacy', async () => {
  const calls=[];supabase.rpc=async name=>{calls.push(name);return {data:accessReply(true,'TRIAL'),error:null};};
  const r=await checkTrialStatus();assert.equal(r.ok,true);assert.equal(r.activated,false);assert.deepEqual(calls,['get_casillas_access_v2']);
});
test('licença confirmada pela fachada libera', async () => {
  supabase.rpc=async()=>({data:accessReply(true),error:null});const r=await checkTrialStatus();assert.equal(r.ok,true);assert.equal(r.activated,true);
});
test('negativa do servidor não tenta criar trial pelo frontend', async () => {
  const calls=[];supabase.rpc=async name=>{calls.push(name);return {data:accessReply(false),error:null};};
  assert.equal((await checkTrialStatus()).ok,false);assert.deepEqual(calls,['get_casillas_access_v2']);
});
test('resposta EXPIRED bloqueia', async () => {
  supabase.rpc=async()=>({data:{...accessReply(false),state:'EXPIRED'},error:null});
  assert.equal((await checkTrialStatus()).reason,'EXPIRED');
});
test('resposta REVOKED invalida lease sem trial fallback', async () => {
  supabase.rpc=async()=>({data:accessReply(true),error:null});await checkTrialStatus();
  supabase.rpc=async()=>({data:{...accessReply(false),state:'REVOKED'},error:null});
  assert.equal((await checkTrialStatus()).ok,false);assert.equal(values.has(LEASE_KEY),false);
});
test('JWT expirado offline mantém identidade e lease, sem rede', async () => {
  supabase.rpc=async()=>({data:accessReply(true),error:null});await checkTrialStatus();
  Object.defineProperty(globalThis.navigator,'onLine',{value:false,configurable:true});
  supabase.auth.getUser=()=>{throw new Error('must not call offline');};
  supabase.rpc=()=>{throw new Error('must not call offline');};
  assert.equal((await getCurrentUser()).user.id,USER);
  assert.equal((await checkTrialStatus()).offline,true);
});
test('falha real de rede na sessão usa identidade cacheada e lease existente', async () => {
  supabase.rpc=async()=>({data:accessReply(true),error:null});await checkTrialStatus();
  supabase.auth.getUser=async()=>({data:{user:null},error:new TypeError('Failed to fetch')});
  supabase.rpc=()=>{throw new Error('no authority RPC on session network failure');};
  const result=await checkTrialStatus();assert.equal(result.ok,true);assert.equal(result.offline,true);
});
test('ativação sem license_id não consulta entitlement nem libera acesso', async () => {
  const dom = installActivationDom();
  let activationCalls = 0;
  supabase.auth.getUser = async () => ({
    data: { user: { id: USER } },
    error: null
  });
  supabase.rpc = async (name) => {
    if (name === 'get_casillas_access_v2') return { data: accessReply(false), error: null };
    activationCalls++;
    return { data: [{ entitlement_id: 'entitlement-without-license' }], error: null };
  };

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
    data: { user: { id: USER } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    if (name === 'get_casillas_access_v2') {
      entitlementReads++;
      return entitlementReads === 1
        ? { data: accessReply(false), error: null }
        : { data: accessReply(true), error: null };
    }
    return {
      data: { result: 'SUCCESS', license_id: 'license-1' },
      error: null
    };
  };

  await checkTrialStatus();
  dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
  await dom.click('btn-submit-activation')();

  assert.deepEqual(calls, [
    'get_casillas_access_v2',
    'activate_casillas_license_v2',
    'get_casillas_access_v2'
  ]);
  assert.equal(dom.elements.get('activation-screen').classList.hidden, true);
});

test('ativação aceita pelo RPC mas sem entitlement confirmado continua bloqueada', async () => {
  const dom = installActivationDom();
  const calls = [];
  let entitlementReads = 0;
  supabase.auth.getUser = async () => ({
    data: { user: { id: USER } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    if (name === 'get_casillas_access_v2') {
      entitlementReads++;
      return { data: accessReply(false), error: null };
    }
    return { data: { result: 'SUCCESS', license_id: 'license-1' }, error: null };
  };

  await checkTrialStatus();
  dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
  await dom.click('btn-submit-activation')();

  assert.deepEqual(calls, [
    'get_casillas_access_v2',
    'activate_casillas_license_v2',
    'get_casillas_access_v2'
  ]);
  assert.equal(entitlementReads, 2);
  assert.equal(dom.elements.get('activation-screen').classList.hidden, false);
});

test('erro na RPC de ativação não consulta entitlement novamente', async () => {
  const dom = installActivationDom();
  const calls = [];
  supabase.auth.getUser = async () => ({
    data: { user: { id: USER } },
    error: null
  });
  supabase.rpc = async (name) => {
    calls.push(name);
    if (name === 'get_casillas_access_v2') return { data: accessReply(false), error: null };
    return { data: null, error: new Error('activation unavailable') };
  };

  await checkTrialStatus();
  dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
  await dom.click('btn-submit-activation')();

  assert.deepEqual(calls, [
    'get_casillas_access_v2',
    'activate_casillas_license_v2'
  ]);
  assert.equal(dom.elements.get('activation-screen').classList.hidden, false);
});

for (const result of ['ACTIVATION_DENIED', 'INVALID_REQUEST', 'RATE_LIMITED', 'UNKNOWN']) {
  test('resultado estruturado ' + result + ' não concede acesso nem revalida entitlement', async () => {
    const dom = installActivationDom();
    const calls = [];
    supabase.auth.getUser = async () => ({ data: { user: { id: USER } }, error: null });
    supabase.rpc = async name => {
      calls.push(name);
      if (name === 'get_casillas_access_v2') return { data: accessReply(false), error: null };
      // Even contradictory/malformed data must not turn a failure into success.
      return { data: { result, license_id: 'must-not-authorize', retry_after_seconds: 30 }, error: null };
    };
      await checkTrialStatus();
    dom.elements.get('activation-code').value = 'CASILLAS-TEST-0001';
    await dom.click('btn-submit-activation')();
    assert.deepEqual(calls, ['get_casillas_access_v2', 'activate_casillas_license_v2']);
    assert.equal(dom.elements.get('activation-screen').classList.hidden, false);
  });
}
