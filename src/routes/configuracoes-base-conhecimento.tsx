import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CATEGORIAS,
  useBaseConhecimento,
  useExcluirConhecimento,
  useSalvarConhecimento,
  useToggleConhecimentoAtivo,
  useUploadConhecimentoArquivo,
  type BaseConhecimento,
  type CategoriaConhecimento,
  type TipoConhecimento,
} from "@/hooks/useBaseConhecimento";

export const Route = createFileRoute("/configuracoes-base-conhecimento")({
  component: BaseConhecimentoPage,
  head: () => ({
    meta: [
      { title: "Base de Conhecimento · Conecta MGA" },
      {
        name: "description",
        content:
          "Gerencie conteúdos (preços, convênios, procedimentos) que alimentam os agentes de IA.",
      },
    ],
  }),
});

function BaseConhecimentoPage() {
  const { data: itens = [], isLoading } = useBaseConhecimento();
  const [editando, setEditando] = useState<BaseConhecimento | null>(null);
  const [criando, setCriando] = useState(false);

  const ativos = itens.filter((i) => i.ativo).length;

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/configuracoes"
              className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Configurações
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Base de Conhecimento
            </h1>
            <p className="text-sm text-muted-foreground">
              Conteúdos usados para alimentar os agentes de IA da clínica.{" "}
              <span className="text-foreground">
                {ativos}/{itens.length} ativos
              </span>
              .
            </p>
          </div>
          <Button onClick={() => setCriando(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo conteúdo
          </Button>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 py-20 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold">
              Nenhum conteúdo cadastrado
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Adicione PDFs, imagens ou textos com informações sobre preços, convênios e
              procedimentos.
            </p>
            <Button onClick={() => setCriando(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Novo conteúdo
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {itens.map((item) => (
              <ItemCard key={item.id} item={item} onEditar={() => setEditando(item)} />
            ))}
          </div>
        )}
      </div>

      {(criando || editando) && (
        <ConhecimentoDialog
          item={editando}
          onClose={() => {
            setCriando(false);
            setEditando(null);
          }}
        />
      )}
    </div>
  );
}

function ItemCard({
  item,
  onEditar,
}: {
  item: BaseConhecimento;
  onEditar: () => void;
}) {
  const toggle = useToggleConhecimentoAtivo();
  const excluir = useExcluirConhecimento();

  const Icon = item.tipo === "pdf" ? FileText : item.tipo === "imagem" ? ImageIcon : BookOpen;
  const catLabel = CATEGORIAS.find((c) => c.value === item.categoria)?.label ?? item.categoria;

  const onExcluir = async () => {
    if (!confirm(`Excluir "${item.titulo}"?`)) return;
    try {
      await excluir.mutateAsync(item);
      toast.success("Conteúdo excluído");
    } catch (e) {
      toast.error("Erro ao excluir", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/40 sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold">{item.titulo}</h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {catLabel}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {item.tipo}
          </span>
        </div>
        {item.descricao && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.descricao}</p>
        )}
        {item.arquivo_url && (
          <a
            href={item.arquivo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <FileText className="h-3 w-3" />
            {item.arquivo_nome ?? "Abrir arquivo"}
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={item.ativo}
            onCheckedChange={(v) =>
              toggle
                .mutateAsync({ id: item.id, ativo: v })
                .then(() => toast.success(v ? "Ativado" : "Desativado"))
                .catch((e) =>
                  toast.error("Erro", {
                    description: e instanceof Error ? e.message : undefined,
                  }),
                )
            }
          />
          <span className="text-xs text-muted-foreground">
            {item.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onEditar} aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onExcluir}
          className="text-destructive hover:text-destructive"
          aria-label="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

interface FormState {
  titulo: string;
  categoria: CategoriaConhecimento;
  descricao: string;
  conteudo: string;
  tipo: TipoConhecimento;
  arquivo_url: string | null;
  arquivo_nome: string | null;
  ativo: boolean;
}

function ConhecimentoDialog({
  item,
  onClose,
}: {
  item: BaseConhecimento | null;
  onClose: () => void;
}) {
  const salvar = useSalvarConhecimento();
  const upload = useUploadConhecimentoArquivo();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    titulo: item?.titulo ?? "",
    categoria: (item?.categoria as CategoriaConhecimento) ?? "procedimento",
    descricao: item?.descricao ?? "",
    conteudo: item?.conteudo ?? "",
    tipo: item?.tipo ?? "texto",
    arquivo_url: item?.arquivo_url ?? null,
    arquivo_nome: item?.arquivo_nome ?? null,
    ativo: item?.ativo ?? true,
  }));

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onPickFile = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo maior que 20MB");
      return;
    }
    try {
      const { url, nome } = await upload.mutateAsync(file);
      const tipo: TipoConhecimento = file.type.startsWith("image/") ? "imagem" : "pdf";
      setForm((f) => ({
        ...f,
        arquivo_url: url,
        arquivo_nome: nome,
        tipo,
        titulo: f.titulo || nome.replace(/\.[^.]+$/, ""),
      }));
      toast.success("Arquivo enviado");
    } catch (err) {
      toast.error("Erro no upload", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const onSubmit = async () => {
    if (!form.titulo.trim()) {
      toast.error("Informe um título");
      return;
    }
    try {
      await salvar.mutateAsync({
        ...(item?.id ? { id: item.id } : {}),
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        descricao: form.descricao.trim() || null,
        conteudo: form.conteudo.trim() || null,
        tipo: form.tipo,
        arquivo_url: form.arquivo_url,
        arquivo_nome: form.arquivo_nome,
        ativo: form.ativo,
      });
      toast.success(item ? "Conteúdo atualizado" : "Conteúdo criado");
      onClose();
    } catch (e) {
      toast.error("Erro ao salvar", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <BookOpen className="h-5 w-5 text-primary" />
            {item ? "Editar conteúdo" : "Novo conteúdo"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Título *</Label>
            <Input
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ex.: Tabela de preços 2025"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Categoria *</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => set("categoria", v as CategoriaConhecimento)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v as TipoConhecimento)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="texto">Texto manual</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="imagem">Imagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Descrição</Label>
            <Textarea
              rows={2}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Resumo do conteúdo (visível na listagem)"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Arquivo (PDF ou imagem)</Label>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={onFile}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onPickFile}
                disabled={upload.isPending}
                className="gap-2"
              >
                {upload.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {form.arquivo_url ? "Trocar arquivo" : "Enviar arquivo"}
              </Button>
              {form.arquivo_url && (
                <>
                  <a
                    href={form.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <FileText className="h-3 w-3" />
                    {form.arquivo_nome ?? "Abrir"}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      set("arquivo_url", null);
                      set("arquivo_nome", null);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    Remover
                  </Button>
                </>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">Até 20MB.</p>
          </div>

          <div className="grid gap-1.5">
            <Label>Conteúdo textual</Label>
            <Textarea
              rows={8}
              value={form.conteudo}
              onChange={(e) => set("conteudo", e.target.value)}
              placeholder="Texto que será lido pelos agentes de IA. Ex.: 'Consulta cardiológica: R$ 350. Aceitamos Unimed, Bradesco Saúde...'"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
            <Switch checked={form.ativo} onCheckedChange={(v) => set("ativo", v)} />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {form.ativo ? "Ativo" : "Inativo"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Apenas conteúdos ativos são usados pela IA.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={salvar.isPending} className="gap-2">
            {salvar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
