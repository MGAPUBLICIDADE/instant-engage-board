import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface Atendimento {
  id: string;
  empresa_id: string;
  paciente_id: string;
  medico_id: string | null;
  agendamento_id: string | null;
  data: string | null; // YYYY-MM-DD
  hora: string | null; // HH:MM
  anamnese: string | null;
  diagnostico: string | null;
  prescricao: string | null;
  observacoes: string | null;
  valor: number | null;
  created_at?: string;
  updated_at?: string;
}

export type AtendimentoInput = Omit<
  Atendimento,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

/** Histórico de atendimentos de um paciente. */
export function useAtendimentosPaciente(pacienteId: string | undefined) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["atendimentos_paciente", empresaId, pacienteId],
    enabled: !!empresaId && !!pacienteId,
    queryFn: async (): Promise<Atendimento[]> => {
      const { data, error } = await supabase
        .from("atendimentos")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("paciente_id", pacienteId!)
        .order("data", { ascending: false })
        .order("hora", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Atendimento[];
    },
  });
}

/** Atendimento ligado a um agendamento (pode ser único). */
export function useAtendimentoPorAgendamento(agendamentoId: string | undefined) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["atendimento_por_agendamento", empresaId, agendamentoId],
    enabled: !!empresaId && !!agendamentoId,
    queryFn: async (): Promise<Atendimento | null> => {
      const { data, error } = await supabase
        .from("atendimentos")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("agendamento_id", agendamentoId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Atendimento | null;
    },
  });
}

export function useSalvarAtendimento() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: AtendimentoInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase
            .from("atendimentos")
            .update(payload)
            .eq("id", input.id)
            .select()
            .single()
        : await supabase.from("atendimentos").insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as Atendimento;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: ["atendimentos_paciente", empresaId, data.paciente_id],
      });
      if (data.agendamento_id) {
        qc.invalidateQueries({
          queryKey: ["atendimento_por_agendamento", empresaId, data.agendamento_id],
        });
      }
    },
  });
}

export function useExcluirAtendimento() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async ({ id }: { id: string; paciente_id: string }) => {
      const { error } = await supabase.from("atendimentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ["atendimentos_paciente", empresaId, vars.paciente_id],
      });
    },
  });
}
