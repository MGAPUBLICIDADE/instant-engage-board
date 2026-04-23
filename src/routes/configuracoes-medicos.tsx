import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Stethoscope, Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  useMedicos,
  useSalvarMedico,
  useExcluirMedico,
  type Medico,
  type MedicoFormInput,
} from "@/hooks/useMedicos";

export const Route = createFileRoute("/configuracoes-medicos")({
  component: MedicosPage,
  head: () => ({
    meta: [
      { title: "Médicos · Conecta MGA" },
      {
        name: "description",
        content: "Cadastre e gerencie a equipe médica da sua clínica.",
      },
    ],
  }),
});

const EMPTY: MedicoFormInput = {
  nome: "",
  especialidade: "",
  crm: "",
  conselho_uf: "",
  cpf: "",
  email: "",
  telefone: "",
  whatsapp: "",
  cor: "#3b82f6",
  ativo: true,
  observacoes: "",
};

const CORES = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function MedicosPage() {
  const { data: medicos = [], isLoading, error } = useMedicos();
  const salvar = useSalvarMedico();
  const excluir = useExcluirMedico();
  const [open, setOpen] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Medico | null>(null);
  const [editando, setEditando] = useState<Medico | null>(null);
  const [form, setForm] = useState<MedicoFormInput>(EMPTY);
  const [busca, setBusca] = useState("");

  const filtrados = medicos.filter((m) =>
    m.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (m.especialidade ?? "").toLowerCase().includes(busca.toLowerCase()),
  );

  const abrirNovo = () => {
    setEditando(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const abrirEdicao = (m: Medico) => {
    setEditando(m);
    setForm({
      nome: m.nome ?? "",
      especialidade: m.especialidade ?? "",
      crm: m.crm ?? "",
      conselho_uf: m.conselho_uf ?? "",
      cpf: m.cpf ?? "",
      email: m.email ?? "",
      telefone: m.telefone ?? "",
      whatsapp: m.whatsapp ?? "",
      cor: m.cor ?? "#3b82f6",
      ativo: m.ativo ?? true,
      observacoes: m.observacoes ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe o nome do médico");
      return;
    }
    try {
      await salvar.mutateAsync({
        ...form,
        nome: form.nome.trim(),
        especialidade: form.especialidade?.trim() || null,
        crm: form.crm?.trim() || null,
        conselho_uf: form.conselho_uf?.trim().toUpperCase() || null,
        cpf: form.cpf?.trim() || null,
        email: form.email?.trim() || null,
        telefone: form.telefone?.trim() || null,
        whatsapp: form.whatsapp?.trim() || null,
        observacoes: form.observacoes?.trim() || null,
        id: editando?.id,
      });
      toast.success(editando ? "Médico atualizado" : "Médico cadastrado");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const handleExcluir = async () => {
    if (!confirmarExclusao) return;
    try {
      await excluir.mutateAsync(confirmarExclusao.id);
      toast.success("Médico removido");
      setConfirmarExclusao(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-6">
          <Link
            to="/configuracoes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para configurações
          </Link>
        </div>

        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Stethoscope className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Médicos</h1>
              <p className="text-sm text-muted-foreground">
                Cadastre os profissionais que atendem na clínica.
              </p>
            </div>
          </div>
          <Button onClick={abrirNovo} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo médico
          </Button>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Erro ao carregar: {error.message}
          </div>
        )}

        <div className="mb-4 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou especialidade..."
            className="pl-9"
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {medicos.length === 0
                ? "Nenhum médico cadastrado ainda. Clique em \"Novo médico\" para começar."
                : "Nenhum resultado para essa busca."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtrados.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-elevated transition-colors"
                >
                  <span
                    aria-hidden
                    className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: m.cor ?? "#3b82f6" }}
                  >
                    {m.nome.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      {m.nome}
                      {!m.ativo && (
                        <span className="text-[10px] uppercase tracking-wider rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                          inativo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[m.especialidade, m.crm && `CRM ${m.crm}${m.conselho_uf ? "/" + m.conselho_uf : ""}`]
                        .filter(Boolean)
                        .join(" · ") || "Sem especialidade"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => abrirEdicao(m)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmarExclusao(m)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar médico" : "Novo médico"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input
                  id="especialidade"
                  value={form.especialidade ?? ""}
                  onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                  placeholder="Dermatologia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={form.cpf ?? ""}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
              <div className="space-y-2">
                <Label htmlFor="crm">CRM</Label>
                <Input
                  id="crm"
                  value={form.crm ?? ""}
                  onChange={(e) => setForm({ ...form, crm: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  maxLength={2}
                  value={form.conselho_uf ?? ""}
                  onChange={(e) => setForm({ ...form, conselho_uf: e.target.value })}
                  placeholder="SP"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={form.telefone ?? ""}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp ?? ""}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor da agenda</Label>
              <div className="flex flex-wrap gap-2">
                {CORES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setForm({ ...form, cor: c })}
                    aria-label={`Cor ${c}`}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      form.cor === c ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                rows={2}
                value={form.observacoes ?? ""}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">Médico ativo</p>
                <p className="text-xs text-muted-foreground">Inativos não aparecem na agenda</p>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvar.isPending}>
                {salvar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmarExclusao}
        onOpenChange={(o) => !o && setConfirmarExclusao(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover médico?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os agendamentos vinculados podem ser afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
