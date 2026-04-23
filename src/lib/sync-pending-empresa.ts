import { supabase } from "@/integrations/supabase/client";

const PENDING_EMPRESA_KEY = "pending_empresa_data";

type PendingEmpresaPayload = Record<string, unknown>;

interface PendingEmpresaData {
  email: string;
  payload: PendingEmpresaPayload;
}

interface SyncPendingEmpresaInput {
  id: string;
  email?: string | null;
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function readPendingEmpresaData(): PendingEmpresaData | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PENDING_EMPRESA_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingEmpresaData;
  } catch {
    localStorage.removeItem(PENDING_EMPRESA_KEY);
    return null;
  }
}

export async function syncPendingEmpresaData(user: SyncPendingEmpresaInput) {
  const pending = readPendingEmpresaData();
  if (!pending) return false;

  if (normalizeEmail(pending.email) !== normalizeEmail(user.email)) {
    return false;
  }

  const { data: empresa, error: empresaError } = await supabase
    .from("empresa")
    .upsert({ user_id: user.id, ...pending.payload }, { onConflict: "user_id" })
    .select()
    .single();

  if (empresaError) throw empresaError;

  const { error: configError } = await supabase
    .from("configuracao_empresa")
    .upsert(
      { empresa_id: (empresa as { id: string }).id, preferencias: {} },
      { onConflict: "empresa_id" },
    );

  if (configError) throw configError;

  localStorage.removeItem(PENDING_EMPRESA_KEY);
  return true;
}