import { supabase } from './supabase.bundle.js';

export function getCachedUser() {
  try { return readCachedSessionUser(globalThis.localStorage, supabase.auth.storageKey); }
  catch { return null; }
}
export async function getCurrentUser() {
  if (globalThis.navigator?.onLine === false) return { user: getCachedUser(), error: null, offline: true };
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (isNetworkFailure(error)) return { user: getCachedUser(), error: null, offline: true };
    return { user: user ?? null, error };
  } catch (error) {
    if (isNetworkFailure(error)) return { user: getCachedUser(), error: null, offline: true };
    return { user: null, error };
  }
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function signUp(email, password) {
  return supabase.auth.signUp({
    email,
    password
  });
}

export async function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL('auth.html', window.location.href).href
  });
}

export async function updatePassword(password) {
  return supabase.auth.updateUser({ password });
}

export async function signOut() {
  try { clearAccessLease(globalThis.localStorage); } catch {}
  return supabase.auth.signOut({
    scope: 'local'
  });
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// Operational continuity, not cryptographic proof. Only server validation renews a lease.
export const LEASE_KEY = 'casillas-offline-lease-v1';
export const CLOCK_KEY = 'casillas-lease-clock-v1';
const DAY = 86400000;
const sources = new Set(['LICENSE', 'TRIAL', 'GRANT', 'PROMOTION', 'ADMIN']);
const uuid = v => typeof v === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
const stamp = v => typeof v === 'string' && /(?:Z|[+-]\d\d:\d\d)$/.test(v) ? Date.parse(v) : NaN;
export function isNetworkFailure(error) {
  return !Number(error?.status) && /failed to fetch|fetch failed|networkerror|network request failed|load failed/i.test(String(error?.message || error));
}
export function readCachedSessionUser(storage, key) {
  try {
    const session = JSON.parse(storage.getItem(key));
    const parts = session?.access_token?.split('.');
    if (parts?.length !== 3 || !uuid(session?.user?.id)) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.sub === session.user.id && payload.role === 'authenticated' ? { id: session.user.id } : null;
  } catch { return null; }
}
export function clearAccessLease(storage) {
  try { storage.removeItem(LEASE_KEY); } catch { /* unavailable storage cannot grant access */ }
}
export function createLeaseController({ storage, now = Date.now, online, identity, cachedUser, request }) {
  let epoch = 0, pending;
  const denied = reason => ({ ok: false, activated: false, daysLeft: 0, reason });
  const invalidate = () => { epoch++; try { clearAccessLease(storage()); } catch {} };
  function inspect(user = cachedUser()) {
    try {
      const store = storage(), l = JSON.parse(store.getItem(LEASE_KEY));
      const marker = Number(store.getItem(CLOCK_KEY));
      const at = stamp(l?.validated_at), end = l?.valid_until === null ? Infinity : stamp(l?.valid_until);
      const expiry = Math.min(at + 7 * DAY, end);
      if (!uuid(user?.id) || l?.formatVersion !== 1 || l.user_id !== user.id || l.product !== 'casillas' ||
          !sources.has(l.source) || !Number.isFinite(at) || !(end > at) ||
          (l.source === 'TRIAL' && !Number.isFinite(end)) || stamp(l.leaseExpiresAt) !== expiry ||
          !Number.isFinite(l.localValidatedAt) || !Number.isFinite(l.maxObservedLocalTime) ||
          l.maxObservedLocalTime < l.localValidatedAt || !Number.isFinite(marker) || marker <= 0) return denied('invalid-lease');
      const observed = Math.max(now(), marker, l.maxObservedLocalTime);
      const effective = at + Math.max(0, observed - l.localValidatedAt);
      store.setItem(CLOCK_KEY, String(observed));
      l.maxObservedLocalTime = observed;
      store.setItem(LEASE_KEY, JSON.stringify(l));
      if (effective >= expiry) { clearAccessLease(store); return denied('lease-expired'); }
      return { ok: true, activated: l.source !== 'TRIAL', source: l.source,
        daysLeft: l.source === 'TRIAL' ? Math.ceil((end - effective) / DAY) : Infinity,
        offline: true, leaseExpiresAt: l.leaseExpiresAt, remainingMs: expiry - effective };
    } catch { return denied('invalid-lease'); }
  }
  async function validate(allowOffline) {
    const generation = epoch, started = now();
    let ident;
    try { ident = await identity(); } catch { invalidate(); return denied('auth-error'); }
    if (generation !== epoch) return denied('identity-changed');
    if (ident?.error || !uuid(ident?.user?.id)) { invalidate(); return denied('not-authenticated'); }
    if (!online() || ident.offline) return allowOffline ? inspect(ident.user) : denied('online-required');
    let result;
    try { result = await request('get_casillas_access_v2'); }
    catch (error) { result = { error }; }
    if (generation !== epoch || cachedUser()?.id !== ident.user.id) return denied('identity-changed');
    if (result?.error) {
      if (isNetworkFailure(result.error)) return allowOffline ? inspect(ident.user) : denied('online-required');
      invalidate(); return denied('authority-error');
    }
    const d = result?.data;
    const at = stamp(d?.validated_at), end = d?.valid_until === null ? Infinity : stamp(d?.valid_until);
    if (d?.contract_version !== 2 || d.user_id !== ident.user.id || d.product !== 'casillas' ||
        d.has_access !== true || d.state !== 'VALID' || !sources.has(d.source) ||
        !Number.isFinite(at) || !(end > at) || (d.source === 'TRIAL' && !Number.isFinite(end))) {
      invalidate(); return denied(d?.state || 'invalid-authority-response');
    }
    try {
      const store = storage(), marker = Number(store.getItem(CLOCK_KEY));
      const local = started;
      const observed = Math.max(local, now(), Number.isFinite(marker) ? marker : local);
      const lease = { formatVersion: 1, user_id: d.user_id, product: 'casillas', source: d.source,
        validated_at: d.validated_at, valid_until: d.valid_until,
        leaseExpiresAt: new Date(Math.min(at + 7 * DAY, end)).toISOString(),
        localValidatedAt: local, maxObservedLocalTime: observed };
      store.setItem(CLOCK_KEY, String(lease.maxObservedLocalTime));
      store.setItem(LEASE_KEY, JSON.stringify(lease));
      return { ...inspect(ident.user), offline: false };
    } catch { invalidate(); return denied('storage-unavailable'); }
  }
  return { invalidate, inspect, check(options = {}) {
    if (!pending) pending = validate(options.allowOffline !== false).finally(() => { pending = null; });
    return pending;
  } };
}
export function startAccessLifecycle({ events, document, refresh, now = Date.now,
  setTimer = setTimeout, clearTimer = clearTimeout, initialResult, onExpiry }) {
  let stopped = false, paused = false, timer, expiryTimer, last = -Infinity, pending;
  function schedule(result) {
    clearTimer(timer);
    clearTimer(expiryTimer);
    if (stopped) return;
    const remaining = result?.ok ? result.remainingMs : Infinity;
    const expire = () => { onExpiry?.(); return run(true); };
    timer = setTimer(remaining <= 900000 ? expire : () => run(true),
      Math.max(1, Math.min(900000, remaining)));
    if (Number.isFinite(remaining) && remaining > 900000) {
      expiryTimer = setTimer(expire, remaining);
    }
  }
  async function run(force = false) {
    if (stopped) return;
    if (document.visibilityState === 'hidden') { paused = true; return; }
    if (pending) return pending;
    const elapsed = now() - last;
    if (!force && !paused && elapsed >= 0 && elapsed < 60000) return;
    paused = false;
    last = now();
    pending = Promise.resolve().then(refresh).then(schedule).finally(() => { pending = null; });
    return pending;
  }
  const event = () => run(false);
  const connectivity = () => run(true);
  events.addEventListener('online', connectivity);
  events.addEventListener('offline', connectivity);
  events.addEventListener('focus', event);
  document.addEventListener('visibilitychange', event);
  if (initialResult) schedule(initialResult);
  return () => {
    stopped = true; clearTimer(timer); clearTimer(expiryTimer);
    events.removeEventListener('online', connectivity); events.removeEventListener('offline', connectivity);
    events.removeEventListener('focus', event);
    document.removeEventListener('visibilitychange', event);
  };
}
