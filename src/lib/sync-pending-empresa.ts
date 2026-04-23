import { saveEmpresaWithConfig } from "@/lib/empresa-api";

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

  await saveEmpresaWithConfig({ user_id: user.id, ...pending.payload });

  localStorage.removeItem(PENDING_EMPRESA_KEY);
  return true;
}