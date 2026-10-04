import { supabase } from './supabase.bundle.js';

export async function getCurrentUser() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  return {
    user: user ?? null,
    error
  };
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
  return supabase.auth.signOut({
    scope: 'local'
  });
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
