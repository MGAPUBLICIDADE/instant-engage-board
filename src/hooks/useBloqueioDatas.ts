import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface BloqueioData {
  id: string;
  empresa_id: string;
  medico_id: string;
  data: string; // YYYY-MM-DD
  dia_inteiro: boolean;
  hora_inicio: string | null;
  hora_fim: string | null;
  motivo: string | null;
  created_at?: string;
  updated_at?: string;
}

export type BloqueioDataInput = Omit<
  BloqueioData,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

export function useBloqueioDatas(medicoId: string | undefined) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["bloqueio_datas", empresaId, medicoId],
    enabled: !!empresaId && !!medicoId,
    queryFn: async (): Promise<BloqueioData[]> => {
      const { data, error } = await supabase
        .from("bloqueio_datas")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("medico_id", medicoId!)
        .order("data", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BloqueioData[];
    },
  });
}

export function useSalvarBloqueioData() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: BloqueioDataInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase.from("bloqueio_datas").update(payload).eq("id", input.id).select().single()
        : await supabase.from("bloqueio_datas").insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as BloqueioData;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["bloqueio_datas", empresaId, vars.medico_id] });
    },
  });
}

export function useExcluirBloqueioData() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async ({ id }: { id: string; medico_id: string }) => {
      const { error } = await supabase.from("bloqueio_datas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["bloqueio_datas", empresaId, vars.medico_id] });
    },
  });
}
