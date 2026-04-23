import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface Prontuario {
  id: string;
  empresa_id: string;
  paciente_id: string;
  medico_id: string | null;
  agendamento_id: string | null;
  data: string | null; // YYYY-MM-DD
  queixa_principal: string | null;
  historico: string | null;
  diagnostico: string | null;
  procedimento: string | null;
  observacoes: string | null;
  prescricao: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ProntuarioInput = Omit<
  Prontuario,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

/** Histórico de prontuários de um paciente (mais recente primeiro). */
export function useProntuariosPaciente(pacienteId: string | undefined) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["prontuarios_paciente", empresaId, pacienteId],
    enabled: !!empresaId && !!pacienteId,
    queryFn: async (): Promise<Prontuario[]> => {
      const { data, error } = await supabase
        .from("prontuarios")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("paciente_id", pacienteId!)
        .order("data", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Prontuario[];
    },
  });
}

/** Prontuário associado a um agendamento (único por consulta). */
export function useProntuarioPorAgendamento(agendamentoId: string | undefined) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["prontuario_por_agendamento", empresaId, agendamentoId],
    enabled: !!empresaId && !!agendamentoId,
    queryFn: async (): Promise<Prontuario | null> => {
      const { data, error } = await supabase
        .from("prontuarios")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("agendamento_id", agendamentoId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Prontuario | null;
    },
  });
}

export function useSalvarProntuario() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: ProntuarioInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase
            .from("prontuarios")
            .update(payload)
            .eq("id", input.id)
            .select()
            .single()
        : await supabase.from("prontuarios").insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as Prontuario;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: ["prontuarios_paciente", empresaId, data.paciente_id],
      });
      if (data.agendamento_id) {
        qc.invalidateQueries({
          queryKey: ["prontuario_por_agendamento", empresaId, data.agendamento_id],
        });
      }
    },
  });
}
