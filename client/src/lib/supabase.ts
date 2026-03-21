import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _initPromise: Promise<SupabaseClient> | null = null;

const CONFIG_FETCH_TIMEOUT_MS = 15_000;

async function fetchAuthConfig(): Promise<{ url: string; anonKey: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CONFIG_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch("/api/auth/config", { signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`/api/auth/config returned ${res.status}`);
    }
    const data = (await res.json()) as { url?: unknown; anonKey?: unknown };
    const url = typeof data.url === "string" ? data.url.trim() : "";
    const anonKey = typeof data.anonKey === "string" ? data.anonKey.trim() : "";
    if (!url || !anonKey) {
      throw new Error("Supabase URL or anon key missing from server config");
    }
    return { url, anonKey };
  } finally {
    clearTimeout(timer);
  }
}

export async function getSupabase(): Promise<SupabaseClient> {
  if (_supabase) return _supabase;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      const { url, anonKey } = await fetchAuthConfig();
      _supabase = createClient(url, anonKey);
      return _supabase;
    } catch (err) {
      _initPromise = null;
      throw err;
    }
  })();

  return _initPromise;
}

export function getSupabaseSync(): SupabaseClient | null {
  return _supabase;
}
