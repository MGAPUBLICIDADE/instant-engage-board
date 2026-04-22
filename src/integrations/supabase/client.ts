import { createClient } from "@supabase/supabase-js";

// Credenciais públicas do projeto Supabase (URL + anon/publishable key).
// Estas são chaves públicas — seguras para o front-end. A segurança real é feita via RLS no banco.
const SUPABASE_URL = "https://ynhbvjmdfndskntzhzti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_VtZr9YtXzHUSxK4f-Ztoog_qhaeoiUM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
