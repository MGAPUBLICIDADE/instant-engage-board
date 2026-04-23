import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface Paciente {
  id: string;
  empresa_id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  sexo: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PacienteFormInput = Omit<Paciente, "id" | "empresa_id" | "created_at" | "updated_at">;

export function usePacientes() {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["pacientes", empresaId],
    enabled: !!empresaId,
    queryFn: async (): Promise<Paciente[]> => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("empresa_id", empresaId!)
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Paciente[];
    },
  });
}

export function useSalvarPaciente() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: PacienteFormInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro em Configurações > Dados da clínica");
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase.from("pacientes").update(payload).eq("id", input.id).select().single()
        : await supabase.from("pacientes").insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as Paciente;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pacientes", empresaId] });
    },
  });
}

export function useExcluirPaciente() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pacientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pacientes", empresaId] });
    },
  });
}
