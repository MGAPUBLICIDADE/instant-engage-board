import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface Medico {
  id: string;
  empresa_id: string;
  nome: string;
  especialidade: string | null;
  crm: string | null;
  conselho_uf: string | null;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cor: string | null;
  ativo: boolean;
  observacoes: string | null;
  created_at?: string;
  updated_at?: string;
}

export type MedicoFormInput = Omit<Medico, "id" | "empresa_id" | "created_at" | "updated_at">;

export function useMedicos() {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["medicos", empresaId],
    enabled: !!empresaId,
    queryFn: async (): Promise<Medico[]> => {
      const { data, error } = await supabase
        .from("medicos")
        .select("*")
        .eq("empresa_id", empresaId!)
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Medico[];
    },
  });
}

export function useSalvarMedico() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: MedicoFormInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro em Configurações > Dados da clínica");
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase.from("medicos").update(payload).eq("id", input.id).select().single()
        : await supabase.from("medicos").insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as Medico;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicos", empresaId] });
    },
  });
}

export function useExcluirMedico() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("medicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicos", empresaId] });
    },
  });
}
