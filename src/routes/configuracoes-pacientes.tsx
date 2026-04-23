import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Users, Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
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
  usePacientes,
  useSalvarPaciente,
  useExcluirPaciente,
  type Paciente,
  type PacienteFormInput,
} from "@/hooks/usePacientes";

export const Route = createFileRoute("/configuracoes-pacientes")({
  component: PacientesPage,
  head: () => ({
    meta: [
      { title: "Pacientes · Conecta MGA" },
      {
        name: "description",
        content: "Cadastre e gerencie os pacientes da sua clínica.",
      },
    ],
  }),
});

const EMPTY: PacienteFormInput = {
  nome: "",
  email: "",
  telefone: "",
  whatsapp: "",
  cpf: "",
  data_nascimento: "",
  sexo: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  observacoes: "",
  ativo: true,
};

function PacientesPage() {
  const { data: pacientes = [], isLoading, error } = usePacientes();
  const salvar = useSalvarPaciente();
  const excluir = useExcluirPaciente();
  const [open, setOpen] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Paciente | null>(null);
  const [editando, setEditando] = useState<Paciente | null>(null);
  const [form, setForm] = useState<PacienteFormInput>(EMPTY);
  const [busca, setBusca] = useState("");

  const filtrados = pacientes.filter((p) => {
    const q = busca.toLowerCase();
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.cpf ?? "").toLowerCase().includes(q) ||
      (p.telefone ?? "").includes(q) ||
      (p.whatsapp ?? "").includes(q)
    );
  });

  const abrirNovo = () => {
    setEditando(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const abrirEdicao = (p: Paciente) => {
    setEditando(p);
    setForm({
      nome: p.nome ?? "",
      email: p.email ?? "",
      telefone: p.telefone ?? "",
      whatsapp: p.whatsapp ?? "",
      cpf: p.cpf ?? "",
      data_nascimento: p.data_nascimento ?? "",
      sexo: p.sexo ?? "",
      endereco: p.endereco ?? "",
      cidade: p.cidade ?? "",
      estado: p.estado ?? "",
      cep: p.cep ?? "",
      observacoes: p.observacoes ?? "",
      ativo: p.ativo ?? true,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe o nome do paciente");
      return;
    }
    try {
      await salvar.mutateAsync({
        ...form,
        nome: form.nome.trim(),
        email: form.email?.trim() || null,
        telefone: form.telefone?.trim() || null,
        whatsapp: form.whatsapp?.trim() || null,
        cpf: form.cpf?.trim() || null,
        data_nascimento: form.data_nascimento || null,
        sexo: form.sexo?.trim() || null,
        endereco: form.endereco?.trim() || null,
        cidade: form.cidade?.trim() || null,
        estado: form.estado?.trim().toUpperCase() || null,
        cep: form.cep?.trim() || null,
        observacoes: form.observacoes?.trim() || null,
        id: editando?.id,
      });
      toast.success(editando ? "Paciente atualizado" : "Paciente cadastrado");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const handleExcluir = async () => {
    if (!confirmarExclusao) return;
    try {
      await excluir.mutateAsync(confirmarExclusao.id);
      toast.success("Paciente removido");
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
              <Users className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Pacientes</h1>
              <p className="text-sm text-muted-foreground">
                {pacientes.length} {pacientes.length === 1 ? "paciente cadastrado" : "pacientes cadastrados"}
              </p>
            </div>
          </div>
          <Button onClick={abrirNovo} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo paciente
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
            placeholder="Buscar por nome, CPF ou telefone..."
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
              {pacientes.length === 0
                ? "Nenhum paciente cadastrado ainda."
                : "Nenhum resultado para essa busca."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtrados.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-elevated transition-colors"
                >
                  <span className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {p.nome.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      {p.nome}
                      {!p.ativo && (
                        <span className="text-[10px] uppercase tracking-wider rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                          inativo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[p.whatsapp || p.telefone, p.email].filter(Boolean).join(" · ") ||
                        "Sem contato"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => abrirEdicao(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmarExclusao(p)}
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
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar paciente" : "Novo paciente"}</DialogTitle>
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
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={form.cpf ?? ""}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dn">Data de nascimento</Label>
                <Input
                  id="dn"
                  type="date"
                  value={form.data_nascimento ?? ""}
                  onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
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
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={form.endereco ?? ""}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_100px_100px]">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={form.cidade ?? ""}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">UF</Label>
                <Input
                  id="estado"
                  maxLength={2}
                  value={form.estado ?? ""}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={form.cep ?? ""}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                />
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
                <p className="text-sm font-medium">Paciente ativo</p>
                <p className="text-xs text-muted-foreground">Inativos ficam ocultos na agenda</p>
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
            <AlertDialogTitle>Remover paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Histórico de atendimentos pode ser afetado.
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
