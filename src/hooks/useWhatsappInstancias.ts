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
      const errors: string[] = [];
      for (const columns of SELECTS) {
        const { data, error } = await supabase
          .from(TABLE)
          .select(columns)
          .eq("empresa_id", empresaId!)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error) return normalizeWhatsapp(data as DbRow | null);
        logDbError("Erro ao carregar instância", columns, error);
        errors.push(formatDbError(error));
      }
      throw new Error(errors.join(" | "));
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
      const status = input.ativo ? "ativo" : "inativo";
      const payloads: DbRow[] = [
        { empresa_id: empresaId, numero_whatsapp: input.numero_whatsapp, instance_id: input.instance_id, token_api: input.token_api, nome_instancia: input.nome_instancia, ativo: input.ativo },
        { empresa_id: empresaId, numero: input.numero_whatsapp, instance_id: input.instance_id, token: input.token_api, nome: input.nome_instancia, ativo: input.ativo },
        { empresa_id: empresaId, whatsapp: input.numero_whatsapp, instance_id: input.instance_id, token_api: input.token_api, nome_instancia: input.nome_instancia, status },
        { empresa_id: empresaId, numero_whatsapp: input.numero_whatsapp, zapi_instance_id: input.instance_id, api_token: input.token_api, instance_name: input.nome_instancia, status },
      ];
      if (user?.id) {
        payloads.push(...payloads.map((payload) => ({ ...payload, user_id: user.id })));
      }

      const errors: string[] = [];
      for (const payload of payloads) {
        const result = input.id
          ? await supabase.from(TABLE).update(payload).eq("id", input.id)
          : await supabase.from(TABLE).upsert(payload, { onConflict: "empresa_id" });
        if (!result.error) return normalizeWhatsapp({ id: input.id ?? "", ...payload })!;
        logDbError(input.id ? "Erro ao atualizar instância" : "Erro ao salvar instância", payload, result.error);

        const insert = input.id ? null : await supabase.from(TABLE).insert(payload);
        if (insert && !insert.error) return normalizeWhatsapp({ id: "", ...payload })!;
        if (insert?.error) logDbError("Erro ao inserir instância", payload, insert.error);

        errors.push(formatDbError((insert?.error ?? result.error) as DbError));
      }
      throw new Error(errors.join(" | "));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TABLE, empresaId] });
    },
  });
}