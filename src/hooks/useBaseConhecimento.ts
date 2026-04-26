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

const BUCKET = "conhecimento-clinica";
const TABLE = "conhecimento_clinica";

type ConhecimentoRow = {
  id: string;
  empresa_id: string | null;
  titulo: string | null;
  categoria: string | null;
  conteudo_texto: string | null;
  tipo: string | null;
  url_arquivo: string | null;
  ativo: boolean | null;
  created_at: string | null;
};

function normalizeConhecimento(row: ConhecimentoRow): BaseConhecimento {
  return {
    id: row.id,
    empresa_id: row.empresa_id ?? "",
    titulo: row.titulo ?? "",
    categoria: (row.categoria ?? "outro") as CategoriaConhecimento,
    descricao: null,
    conteudo: row.conteudo_texto,
    tipo: (row.tipo ?? "texto") as TipoConhecimento,
    arquivo_url: row.url_arquivo,
    arquivo_nome: row.url_arquivo ? row.url_arquivo.split("/").pop() ?? null : null,
    ativo: row.ativo ?? true,
    created_at: row.created_at ?? undefined,
  };
}

function toDbPayload(input: BaseConhecimentoInput & { id?: string }, empresaId: string) {
  return {
    empresa_id: empresaId,
    titulo: input.titulo,
    categoria: input.categoria,
    conteudo_texto: input.conteudo ?? input.descricao,
    tipo: input.tipo,
    url_arquivo: input.arquivo_url,
    ativo: input.ativo,
  };
}

export function useBaseConhecimento() {
  const { data: empresa } = useEmpresa();
  const empresaId = empresa?.id;

  return useQuery({
    queryKey: [TABLE, empresaId],
    enabled: !!empresaId,
    queryFn: async (): Promise<BaseConhecimento[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("empresa_id", empresaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as ConhecimentoRow[]).map(normalizeConhecimento);
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
      const payload = toDbPayload(input, empresaId);
      const result = input.id
        ? await supabase
            .from(TABLE)
            .update(payload)
            .eq("id", input.id)
            .select()
            .single()
        : await supabase.from(TABLE).insert(payload).select().single();
      if (result.error) throw result.error;
      return normalizeConhecimento(result.data as ConhecimentoRow);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TABLE, empresaId] });
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
        .from(TABLE)
        .update({ ativo })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return normalizeConhecimento(data as ConhecimentoRow);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TABLE, empresaId] });
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
      const { error } = await supabase.from(TABLE).delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TABLE, empresaId] });
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
