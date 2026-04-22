import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ConfiguracaoClinica {
  id?: string;
  empresa_id: string;
  nome_clinica: string | null;
  endereco: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  created_at?: string;
  updated_at?: string;
}

// TEMP: Enquanto não temos auth/multi-tenancy, usamos um empresa_id fixo.
// Quando integrarmos auth, isso vem do perfil do usuário logado.
export const DEFAULT_EMPRESA_ID = "00000000-0000-0000-0000-000000000001";

const QUERY_KEY = ["configuracao_clinica", DEFAULT_EMPRESA_ID] as const;

export function useConfiguracaoClinica() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<ConfiguracaoClinica | null> => {
      const { data, error } = await supabase
        .from("configuracao_clinica")
        .select("*")
        .eq("empresa_id", DEFAULT_EMPRESA_ID)
        .maybeSingle();

      if (error) throw error;
      return data as ConfiguracaoClinica | null;
    },
  });
}

export function useSalvarConfiguracaoClinica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<ConfiguracaoClinica, "id" | "created_at" | "updated_at" | "empresa_id">) => {
      const payload = {
        empresa_id: DEFAULT_EMPRESA_ID,
        ...input,
      };
      const { data, error } = await supabase
        .from("configuracao_clinica")
        .upsert(payload, { onConflict: "empresa_id" })
        .select()
        .single();

      if (error) throw error;
      return data as ConfiguracaoClinica;
    },
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEY, data);
    },
  });
}
