import { supabase } from "@/integrations/supabase/client";
import { saveEmpresaWithConfig } from "@/lib/empresa-api";

const PENDING_EMPRESA_KEY = "pending_empresa_data";

type PendingEmpresaPayload = Record<string, unknown>;
type UserMetadata = Record<string, unknown>;

interface PendingEmpresaData {
  email: string;
  payload: PendingEmpresaPayload;
}

interface SyncPendingEmpresaInput {
  id: string;
  email?: string | null;
  metadata?: UserMetadata | null;
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function readPendingEmpresaFromMetadata(user: SyncPendingEmpresaInput): PendingEmpresaData | null {
  if (!isRecord(user.metadata)) return null;

  const payload = user.metadata.pending_empresa;
  if (!isRecord(payload)) return null;

  const email =
    typeof user.metadata.pending_empresa_email === "string"
      ? user.metadata.pending_empresa_email
      : user.email ?? "";

  return { email, payload };
}

function getPendingEmpresaData(user: SyncPendingEmpresaInput) {
  const fromStorage = readPendingEmpresaData();
  if (fromStorage && normalizeEmail(fromStorage.email) === normalizeEmail(user.email)) {
    return fromStorage;
  }

  const fromMetadata = readPendingEmpresaFromMetadata(user);
  if (fromMetadata && normalizeEmail(fromMetadata.email) === normalizeEmail(user.email)) {
    return fromMetadata;
  }

  return null;
}

async function clearPendingEmpresaMetadata(metadata?: UserMetadata | null) {
  if (!isRecord(metadata)) return;
  if (!("pending_empresa" in metadata) && !("pending_empresa_email" in metadata)) return;

  await supabase.auth.updateUser({
    data: {
      ...metadata,
      pending_empresa: null,
      pending_empresa_email: null,
    },
  });
}

export async function syncPendingEmpresaData(user: SyncPendingEmpresaInput) {
  const pending = getPendingEmpresaData(user);
  if (!pending) return false;

  await saveEmpresaWithConfig({ user_id: user.id, ...pending.payload });

  if (typeof window !== "undefined") {
    localStorage.removeItem(PENDING_EMPRESA_KEY);
  }

  await clearPendingEmpresaMetadata(user.metadata).catch(() => undefined);
  return true;
}