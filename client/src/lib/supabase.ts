import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _initPromise: Promise<SupabaseClient> | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
  if (_supabase) return _supabase;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const res = await fetch("/api/auth/config");
    const { url, anonKey } = await res.json();
    _supabase = createClient(url, anonKey, {
      auth: { detectSessionInUrl: true },
    });
    return _supabase;
  })();

  return _initPromise;
}

export function getSupabaseSync(): SupabaseClient | null {
  return _supabase;
}
