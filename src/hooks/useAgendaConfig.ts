import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export interface AgendaConfig {
  id: string;
  empresa_id: string;
  medico_id: string;
  hora_inicio: string; // "08:00"
  hora_fim: string;
  duracao_consulta_min: number;
  intervalo_min: number;
  almoco_inicio: string | null;
  almoco_fim: string | null;
  created_at?: string;
  updated_at?: string;
}

export type AgendaConfigInput = Omit<
  AgendaConfig,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

export function useAgendaConfig(medicoId: string | undefined) {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["agenda_config", empresaId, medicoId],
    enabled: !!empresaId && !!medicoId,
    queryFn: async (): Promise<AgendaConfig | null> => {
      const { data, error } = await supabase
        .from("agenda_config")
        .select("*")
        .eq("empresa_id", empresaId!)
        .eq("medico_id", medicoId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as AgendaConfig | null;
    },
  });
}

export function useSalvarAgendaConfig() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: AgendaConfigInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const payload = { ...input, empresa_id: empresaId };
      // upsert por medico_id (índice único)
      const { data, error } = await supabase
        .from("agenda_config")
        .upsert(payload, { onConflict: "medico_id" })
        .select()
        .single();
      if (error) throw error;
      return data as AgendaConfig;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["agenda_config", empresaId, vars.medico_id] });
    },
  });
}
