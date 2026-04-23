import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ConfiguracaoClinica {
  id?: string;
  empresa_id: string;
  nome_clinica: string | null;
  cnpj: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useConfiguracaoClinica() {
  const { user } = useAuth();
  const empresaId = user?.id;

  return useQuery({
    queryKey: ["configuracao_clinica", empresaId],
    enabled: !!empresaId,
    queryFn: async (): Promise<ConfiguracaoClinica | null> => {
      const { data, error } = await supabase
        .from("configuracao_clinica")
        .select("*")
        .eq("empresa_id", empresaId!)
        .maybeSingle();

      if (error) throw error;
      return data as ConfiguracaoClinica | null;
    },
  });
}

export function useSalvarConfiguracaoClinica() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const empresaId = user?.id;

  return useMutation({
    mutationFn: async (
      input: Omit<ConfiguracaoClinica, "id" | "created_at" | "updated_at" | "empresa_id">,
    ) => {
      if (!empresaId) throw new Error("Usuário não autenticado");
      const payload = { empresa_id: empresaId, ...input };
      const { data, error } = await supabase
        .from("configuracao_clinica")
        .upsert(payload, { onConflict: "empresa_id" })
        .select()
        .single();

      if (error) throw error;
      return data as ConfiguracaoClinica;
    },
    onSuccess: (data) => {
      qc.setQueryData(["configuracao_clinica", empresaId], data);
    },
  });
}
