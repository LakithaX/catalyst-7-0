import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export function requireSupabase() {
  if (!supabase) throw new Error('Registration and orders are not available yet. Please try again once event booking opens.');
  return supabase;
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message :
  typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Something went wrong. Please try again.';
