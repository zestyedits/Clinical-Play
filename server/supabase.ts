import { createClient } from "@supabase/supabase-js";
import { resolveSupabaseUrl, stripEnvValue } from "./supabase-env";

const supabaseUrl = resolveSupabaseUrl();
const supabaseServiceKey = stripEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase admin config: set SUPABASE_SERVICE_ROLE_KEY and either SUPABASE_URL or a Supabase DATABASE_URL (db.<ref>.supabase.co) so the API URL can be resolved.",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
