import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface WhatsappInstancia {
  id: string;
  empresa_id: string;
  numero_whatsapp: string;
  instance_id: string;
  token_api: string;
  nome_instancia: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export type WhatsappInstanciaInput = Omit<
  WhatsappInstancia,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

const TABLE = "whatsapp_instancias";

type DbRow = Record<string, unknown>;
type DbError = { message?: string; code?: string; details?: string; hint?: string };

function normalizeWhatsapp(row: DbRow | null): WhatsappInstancia | null {
  if (!row) return null;
  const status = String(row.status ?? "ativo").toLowerCase();
  return {
    id: String(row.id ?? ""),
    empresa_id: String(row.empresa_id ?? ""),
    numero_whatsapp: String(row.numero_whatsapp ?? row.numero ?? row.whatsapp ?? ""),
    instance_id: String(row.instance_id ?? row.zapi_instance_id ?? ""),
    token_api: "",
    nome_instancia: row.nome_instancia || row.nome || row.instance_name ? String(row.nome_instancia ?? row.nome ?? row.instance_name) : null,
    ativo: typeof row.ativo === "boolean" ? row.ativo : status !== "inativo",
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function formatDbError(error: DbError) {
  const message = [error.message, error.code, error.details, error.hint].filter(Boolean).join(" · ");
  return message || "Erro desconhecido retornado pelo banco.";
}

function logDbError(context: string, payload: DbRow | string, error: DbError) {
  console.error(`[WhatsApp] ${context}`, {
    payload,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export function useWhatsappInstancia() {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: [TABLE, empresaId],
    enabled: !!empresaId,
    queryFn: async (): Promise<WhatsappInstancia | null> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("id, empresa_id, numero_whatsapp, instance_id, nome_instancia, ativo, created_at, updated_at")
        .eq("empresa_id", empresaId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        logDbError("Erro ao carregar instância", "select whatsapp_instancias", error);
        throw new Error(formatDbError(error));
      }
      return normalizeWhatsapp(data as DbRow | null);
    },
  });
}

export function useSalvarWhatsappInstancia() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: WhatsappInstanciaInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const payload = {
        empresa_id: empresaId,
        instance_id: input.instance_id,
        token: input.token_api,
      };
      const result = input.id
        ? await supabase.from(TABLE).update(payload).eq("id", input.id).select().single()
        : await supabase.from(TABLE).insert(payload).select().single();
      if (result.error) {
        logDbError(input.id ? "Erro ao atualizar instância" : "Erro ao inserir instância", payload, result.error);
        throw new Error(formatDbError(result.error));
      }
      return normalizeWhatsapp(result.data as DbRow)!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TABLE, empresaId] });
    },
  });
}