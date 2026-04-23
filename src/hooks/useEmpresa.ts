import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Modelo de dados:
 * - tabela `empresa`: dados cadastrais da empresa (1 por usuário, user_id = auth.uid())
 * - tabela `configuracao_empresa`: preferências e configurações da empresa (FK -> empresa.id)
 */

export interface Empresa {
  id?: string;
  user_id: string;
  nome: string | null;
  cnpj: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  whatsapp: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ConfiguracaoEmpresa {
  id?: string;
  empresa_id: string;
  // espaço para preferências futuras (tema, notificações, etc.)
  preferencias?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmpresaComConfig extends Empresa {
  configuracao?: ConfiguracaoEmpresa | null;
}

export type EmpresaFormInput = Omit<Empresa, "id" | "user_id" | "created_at" | "updated_at">;

export function useEmpresa() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["empresa", userId],
    enabled: !!userId,
    queryFn: async (): Promise<EmpresaComConfig | null> => {
      const { data: empresa, error } = await supabase
        .from("empresa")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();

      if (error) throw error;
      if (!empresa) return null;

      const { data: config } = await supabase
        .from("configuracao_empresa")
        .select("*")
        .eq("empresa_id", (empresa as Empresa).id!)
        .maybeSingle();

      return { ...(empresa as Empresa), configuracao: (config as ConfiguracaoEmpresa) ?? null };
    },
  });
}

export function useSalvarEmpresa() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async (input: EmpresaFormInput) => {
      if (!userId) throw new Error("Usuário não autenticado");

      // 1) upsert em empresa (user_id é único)
      const payload = { user_id: userId, ...input };
      const { data: empresa, error: empErr } = await supabase
        .from("empresa")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (empErr) throw empErr;
      const empresaRow = empresa as Empresa;

      // 2) garante linha em configuracao_empresa (1:1 com empresa)
      const { data: config, error: cfgErr } = await supabase
        .from("configuracao_empresa")
        .upsert(
          { empresa_id: empresaRow.id!, preferencias: {} },
          { onConflict: "empresa_id", ignoreDuplicates: false },
        )
        .select()
        .single();

      if (cfgErr) throw cfgErr;

      return { ...empresaRow, configuracao: config as ConfiguracaoEmpresa };
    },
    onSuccess: (data) => {
      qc.setQueryData(["empresa", userId], data);
    },
  });
}
