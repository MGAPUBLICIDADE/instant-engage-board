import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface BloqueioSemana {
  id: string;
  empresa_id: string;
  medico_id: string;
  dia_semana: number; // 0=domingo ... 6=sábado
  hora_inicio: string;
  hora_fim: string;
  motivo: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export type BloqueioSemanaInput = Omit<
  BloqueioSemana,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

export const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function useBloqueioSemana(medicoId: string | undefined) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["bloqueio_semana", empresaId, medicoId],
    enabled: !!empresaId && !!medicoId,
    queryFn: async (): Promise<BloqueioSemana[]> => {
      const { data, error } = await supabase
        .from("bloqueio_semana")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("medico_id", medicoId!)
        .order("dia_semana", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BloqueioSemana[];
    },
  });
}

export function useSalvarBloqueioSemana() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: BloqueioSemanaInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase.from("bloqueio_semana").update(payload).eq("id", input.id).select().single()
        : await supabase.from("bloqueio_semana").insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as BloqueioSemana;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["bloqueio_semana", empresaId, vars.medico_id] });
    },
  });
}

export function useExcluirBloqueioSemana() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async ({ id }: { id: string; medico_id: string }) => {
      const { error } = await supabase.from("bloqueio_semana").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["bloqueio_semana", empresaId, vars.medico_id] });
    },
  });
}
