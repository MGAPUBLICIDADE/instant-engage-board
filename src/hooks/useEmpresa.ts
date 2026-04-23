import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { fetchEmpresaWithConfig, saveEmpresaWithConfig } from "@/lib/empresa-api";

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
    queryFn: async (): Promise<EmpresaComConfig | null> => (await fetchEmpresaWithConfig(userId!)) as EmpresaComConfig | null,
  });
}

export function useSalvarEmpresa() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async (input: EmpresaFormInput) => {
      if (!userId) throw new Error("Usuário não autenticado");
      return (await saveEmpresaWithConfig({ user_id: userId, ...input })) as EmpresaComConfig;
    },
    onSuccess: (data) => {
      qc.setQueryData(["empresa", userId], data);
    },
  });
}
