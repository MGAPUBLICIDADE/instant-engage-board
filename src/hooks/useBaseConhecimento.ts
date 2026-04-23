import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "./useEmpresa";

export type CategoriaConhecimento =
  | "preco"
  | "convenio"
  | "procedimento"
  | "horario"
  | "outro";

export type TipoConhecimento = "texto" | "pdf" | "imagem";

export interface BaseConhecimento {
  id: string;
  empresa_id: string;
  titulo: string;
  categoria: CategoriaConhecimento;
  descricao: string | null;
  conteudo: string | null;
  tipo: TipoConhecimento;
  arquivo_url: string | null;
  arquivo_nome: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export type BaseConhecimentoInput = Omit<
  BaseConhecimento,
  "id" | "empresa_id" | "created_at" | "updated_at"
>;

const BUCKET = "base-conhecimento";

export function useBaseConhecimento() {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: ["base_conhecimento", empresaId],
    enabled: !!empresaId,
    queryFn: async (): Promise<BaseConhecimento[]> => {
      const { data, error } = await supabase
        .from("base_conhecimento")
        .select("*")
        .eq("empresa_id", empresaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BaseConhecimento[];
    },
  });
}

export function useUploadConhecimentoArquivo() {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (file: File) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${empresaId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { path, url: data.publicUrl, nome: file.name };
    },
  });
}

export function useSalvarConhecimento() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (input: BaseConhecimentoInput & { id?: string }) => {
      if (!empresaId) throw new Error("Cadastre a clínica primeiro");
      const payload = { ...input, empresa_id: empresaId };
      const result = input.id
        ? await supabase
            .from("base_conhecimento")
            .update(payload)
            .eq("id", input.id)
            .select()
            .single()
        : await supabase.from("base_conhecimento").insert(payload).select().single();
      if (result.error) throw result.error;
      return result.data as BaseConhecimento;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["base_conhecimento", empresaId] });
    },
  });
}

export function useToggleConhecimentoAtivo() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { data, error } = await supabase
        .from("base_conhecimento")
        .update({ ativo })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as BaseConhecimento;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["base_conhecimento", empresaId] });
    },
  });
}

export function useExcluirConhecimento() {
  const qc = useQueryClient();
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useMutation({
    mutationFn: async (item: BaseConhecimento) => {
      // tenta remover o arquivo do storage se houver path da empresa
      if (item.arquivo_url) {
        const marker = `/${BUCKET}/`;
        const idx = item.arquivo_url.indexOf(marker);
        if (idx >= 0) {
          const path = item.arquivo_url.slice(idx + marker.length);
          await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
        }
      }
      const { error } = await supabase.from("base_conhecimento").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["base_conhecimento", empresaId] });
    },
  });
}

export const CATEGORIAS: { value: CategoriaConhecimento; label: string }[] = [
  { value: "preco", label: "Preço" },
  { value: "convenio", label: "Convênio" },
  { value: "procedimento", label: "Procedimento" },
  { value: "horario", label: "Horário" },
  { value: "outro", label: "Outro" },
];
