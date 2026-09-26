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

export async function signOut() {
  return supabase.auth.signOut({
    scope: 'local'
  });
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
