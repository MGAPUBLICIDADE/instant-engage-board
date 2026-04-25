import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface WhatsappInstancia {
  id: string;
  empresa_id: string;
  numero: string;
  instance_id: string;
  token: string;
  nome: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export type WhatsappInstanciaInput = Omit<
  WhatsappInstancia,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

const TABLE = "whatsapp_instancias";

export function useWhatsappInstancia() {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: [TABLE, empresaId],
    enabled: !!empresaId,
    queryFn: async (): Promise<WhatsappInstancia | null> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("id, empresa_id, numero, instance_id, nome, ativo, created_at, updated_at")
        .eq("empresa_id", empresaId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as WhatsappInstancia | null;
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
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase
            .from(TABLE)
            .update(payload)
            .eq("id", input.id)
            .select()
            .single()
        : await supabase.from(TABLE).insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as WhatsappInstancia;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TABLE, empresaId] });
    },
  });
}