/**
 * Resolve Supabase API URL and keys from process.env.
 * PATTERN: Some hosts (incl. bundled Vercel functions) have been observed to omit
 * SUPABASE_URL at runtime even when set in the dashboard; DATABASE_URL from the same
 * Supabase project always includes the project ref and can derive the REST URL.
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are accepted as fallbacks when only
 * Vite-prefixed names were added in the host dashboard.
 */

export function stripEnvValue(value: string | undefined): string {
  if (value == null) return "";
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** e.g. postgresql://...@db.yfuptowzeweubkdcqguu.supabase.co:5432/postgres */
export function inferSupabaseApiUrlFromDatabaseUrl(databaseUrl: string): string | null {
  const direct = databaseUrl.match(/@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?/i);
  if (direct?.[1]) return `https://${direct[1]}.supabase.co`;

  const poolerUser = databaseUrl.match(/\/\/postgres\.([a-z0-9]+):/i);
  if (poolerUser?.[1]) return `https://${poolerUser[1]}.supabase.co`;

  return null;
}

export function resolveSupabaseUrl(): string {
  const direct = stripEnvValue(process.env.SUPABASE_URL);
  if (direct) return direct;
  const vite = stripEnvValue(process.env.VITE_SUPABASE_URL);
  if (vite) return vite;
  const dbUrl = stripEnvValue(process.env.DATABASE_URL);
  if (dbUrl) {
    const inferred = inferSupabaseApiUrlFromDatabaseUrl(dbUrl);
    if (inferred) return inferred;
  }
  return "";
}

export function resolveSupabaseAnonKey(): string {
  return (
    stripEnvValue(process.env.SUPABASE_ANON_KEY) ||
    stripEnvValue(process.env.VITE_SUPABASE_ANON_KEY)
  );
}
