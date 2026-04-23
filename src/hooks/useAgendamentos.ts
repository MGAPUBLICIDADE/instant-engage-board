import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export type StatusAgendamento =
  | "agendado"
  | "confirmado"
  | "atendido"
  | "cancelado"
  | "faltou";

export interface Agendamento {
  id: string;
  empresa_id: string;
  medico_id: string;
  paciente_id: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM[:SS]
  duracao_min: number;
  procedimento: string | null;
  valor: number | null;
  status: StatusAgendamento;
  observacoes: string | null;
  created_at?: string;
  updated_at?: string;
}

export type AgendamentoInput = Omit<
  Agendamento,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

/** Conta agendamentos por dia para um médico em um mês (YYYY-MM). */
export function useAgendamentosMes(medicoId: string | undefined, ym: string) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["agendamentos_mes", empresaId, medicoId, ym],
    enabled: !!empresaId && !!medicoId,
    queryFn: async (): Promise<Record<string, number>> => {
      const inicio = `${ym}-01`;
      const [y, m] = ym.split("-").map(Number);
      const ultimoDia = new Date(y, m, 0).getDate();
      const fim = `${ym}-${String(ultimoDia).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("agendamentos")
        .select("data,status")
        .eq("empresa_id", empresaId!)
        .eq("medico_id", medicoId!)
        .gte("data", inicio)
        .lte("data", fim);
      if (error) throw error;

      const map: Record<string, number> = {};
      (data ?? []).forEach((row: { data: string; status: string }) => {
        if (row.status === "cancelado") return;
        map[row.data] = (map[row.data] ?? 0) + 1;
      });
      return map;
    },
  });
}

/** Lista agendamentos de um dia. */
export function useAgendamentosDia(
  medicoId: string | undefined,
  data: string | undefined,
) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["agendamentos_dia", empresaId, medicoId, data],
    enabled: !!empresaId && !!medicoId && !!data,
    queryFn: async (): Promise<Agendamento[]> => {
      const { data: rows, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("medico_id", medicoId!)
        .eq("data", data!)
        .order("hora", { ascending: true });
      if (error) throw error;
      return (rows ?? []) as Agendamento[];
    },
  });
}

export function useSalvarAgendamento() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: AgendamentoInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase.from("agendamentos").update(payload).eq("id", input.id).select().single()
        : await supabase.from("agendamentos").insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as Agendamento;
    },
    onSuccess: (_d, vars) => {
      const ym = vars.data?.slice(0, 7);
      qc.invalidateQueries({ queryKey: ["agendamentos_mes", empresaId, vars.medico_id, ym] });
      qc.invalidateQueries({ queryKey: ["agendamentos_dia", empresaId, vars.medico_id, vars.data] });
    },
  });
}

export function useExcluirAgendamento() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async ({ id }: { id: string; medico_id: string; data: string }) => {
      const { error } = await supabase.from("agendamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      const ym = vars.data?.slice(0, 7);
      qc.invalidateQueries({ queryKey: ["agendamentos_mes", empresaId, vars.medico_id, ym] });
      qc.invalidateQueries({ queryKey: ["agendamentos_dia", empresaId, vars.medico_id, vars.data] });
    },
  });
}
