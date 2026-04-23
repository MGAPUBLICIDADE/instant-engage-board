import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Loader2,
  Plus,
  Save,
  Search,
  Stethoscope,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientOnly } from "@/components/ClientOnly";

import { usePacientes, type Paciente } from "@/hooks/usePacientes";
import { useMedicos } from "@/hooks/useMedicos";
import {
  useAtendimentosPaciente,
  useSalvarAtendimento,
  useExcluirAtendimento,
  type Atendimento,
} from "@/hooks/useAtendimentos";

const search = z.object({
  paciente: z.string().optional(),
  agendamento: z.string().optional(),
  medico: z.string().optional(),
});

export const Route = createFileRoute("/atendimento")({
  component: AtendimentoRoute,
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Atendimento · Conecta MGA" },
      {
        name: "description",
        content:
          "Prontuário do paciente: anamnese, diagnóstico e prescrição vinculados ao agendamento.",
      },
    ],
  }),
});

function AtendimentoRoute() {
  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Carregando prontuário...
        </div>
      }
    >
      <Atendimento />
    </ClientOnly>
  );
}

function Atendimento() {
  const sp = Route.useSearch();
  const navigate = useNavigate();
  const { data: pacientes = [], isLoading } = usePacientes();
  const ativos = useMemo(() => pacientes.filter((p) => p.ativo), [pacientes]);

  const [busca, setBusca] = useState("");
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return ativos;
    return ativos.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        (p.telefone ?? "").toLowerCase().includes(q) ||
        (p.cpf ?? "").toLowerCase().includes(q),
    );
  }, [ativos, busca]);

  const pacienteSel = useMemo(
    () => pacientes.find((p) => p.id === sp.paciente) ?? null,
    [pacientes, sp.paciente],
  );

  function selecionar(p: Paciente | null) {
    navigate({
      to: "/atendimento",
      search: p ? { paciente: p.id } : {},
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pacienteSel) {
    return (
      <PacienteProntuario
        paciente={pacienteSel}
        agendamentoId={sp.agendamento}
        medicoIdInicial={sp.medico}
        onVoltar={() => selecionar(null)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[900px]">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">Atendimento</h1>
          <p className="text-sm text-muted-foreground">
            Selecione um paciente para abrir o prontuário.
          </p>
        </header>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone ou CPF"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {filtrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <User className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Nenhum paciente encontrado</p>
            <Link
              to="/configuracoes-pacientes"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Cadastrar paciente
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtrados.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => selecionar(p)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-surface-elevated card-lift"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                    {iniciais(p.nome)}
                  </div>
                  <div className="flex-1 leading-tight">
                    <p className="text-sm font-bold">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.telefone ?? p.email ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Abrir prontuário →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Prontuário do paciente
 * ============================================================ */
function PacienteProntuario({
  paciente,
  agendamentoId,
  medicoIdInicial,
  onVoltar,
}: {
  paciente: Paciente;
  agendamentoId?: string;
  medicoIdInicial?: string;
  onVoltar: () => void;
}) {
  const { data: medicos = [] } = useMedicos();
  const medicosAtivos = useMemo(() => medicos.filter((m) => m.ativo), [medicos]);
  const { data: historico = [], isLoading } = useAtendimentosPaciente(paciente.id);

  // Edita um atendimento existente OU cria um novo (eventualmente vinculado a um agendamento)
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Ao abrir vindo de um agendamento, tenta achar atendimento já existente
  useEffect(() => {
    if (agendamentoId && historico.length) {
      const ja = historico.find((a) => a.agendamento_id === agendamentoId);
      if (ja) setEditandoId(ja.id);
    }
  }, [agendamentoId, historico]);

  const editando = useMemo(
    () => historico.find((a) => a.id === editandoId) ?? null,
    [historico, editandoId],
  );

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={onVoltar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-elevated"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {iniciais(paciente.nome)}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold tracking-tight">{paciente.nome}</h1>
            <p className="text-xs text-muted-foreground">
              {paciente.telefone ?? "—"}
              {paciente.data_nascimento
                ? ` · ${idade(paciente.data_nascimento)} anos`
                : ""}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Histórico */}
          <aside className="glass-panel rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-bold">
                <ClipboardList className="h-4 w-4 text-primary" />
                Histórico
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditandoId(null)}
              >
                <Plus className="h-3.5 w-3.5" /> Novo
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : historico.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                Nenhum atendimento registrado.
              </p>
            ) : (
              <ul className="max-h-[60vh] space-y-1.5 overflow-auto pr-1">
                {historico.map((a) => {
                  const ativo = a.id === editandoId;
                  const med = medicos.find((m) => m.id === a.medico_id);
                  return (
                    <li key={a.id}>
                      <button
                        onClick={() => setEditandoId(a.id)}
                        className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                          ativo
                            ? "border-primary/50 bg-primary/5"
                            : "border-border bg-surface hover:bg-surface-elevated"
                        }`}
                      >
                        <FileText className="mt-0.5 h-3.5 w-3.5 text-primary" />
                        <div className="flex-1 leading-tight">
                          <p className="text-xs font-semibold">
                            {a.data
                              ? new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR")
                              : "—"}
                            {a.hora ? ` · ${a.hora.slice(0, 5)}` : ""}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {med?.nome ?? "—"}
                          </p>
                          {a.diagnostico && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-foreground/80">
                              {a.diagnostico}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Form */}
          <FormAtendimento
            key={editando?.id ?? `novo-${agendamentoId ?? "blank"}`}
            paciente={paciente}
            atendimento={editando}
            agendamentoId={editando ? editando.agendamento_id ?? undefined : agendamentoId}
            medicoIdInicial={editando?.medico_id ?? medicoIdInicial}
            medicos={medicosAtivos}
            onSalvo={(novo) => setEditandoId(novo.id)}
            onExcluir={() => setEditandoId(null)}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Formulário (cria/edita)
 * ============================================================ */
function FormAtendimento({
  paciente,
  atendimento,
  agendamentoId,
  medicoIdInicial,
  medicos,
  onSalvo,
  onExcluir,
}: {
  paciente: Paciente;
  atendimento: Atendimento | null;
  agendamentoId?: string;
  medicoIdInicial?: string;
  medicos: ReturnType<typeof useMedicos>["data"];
  onSalvo: (a: Atendimento) => void;
  onExcluir: () => void;
}) {
  const salvar = useSalvarAtendimento();
  const excluir = useExcluirAtendimento();

  const hojeIso = toIsoDate(new Date());
  const horaAgora = new Date().toTimeString().slice(0, 5);

  const [medicoId, setMedicoId] = useState<string>(
    atendimento?.medico_id ?? medicoIdInicial ?? medicos?.[0]?.id ?? "",
  );
  const [data, setData] = useState<string>(atendimento?.data ?? hojeIso);
  const [hora, setHora] = useState<string>(
    (atendimento?.hora ?? horaAgora).slice(0, 5),
  );
  const [anamnese, setAnamnese] = useState(atendimento?.anamnese ?? "");
  const [diagnostico, setDiagnostico] = useState(atendimento?.diagnostico ?? "");
  const [prescricao, setPrescricao] = useState(atendimento?.prescricao ?? "");
  const [obs, setObs] = useState(atendimento?.observacoes ?? "");
  const [valor, setValor] = useState(
    atendimento?.valor ? String(atendimento.valor) : "",
  );

  function handleSalvar() {
    if (!medicoId) {
      toast.error("Selecione o médico responsável");
      return;
    }
    salvar.mutate(
      {
        id: atendimento?.id,
        paciente_id: paciente.id,
        medico_id: medicoId,
        agendamento_id: agendamentoId ?? null,
        data,
        hora,
        anamnese: anamnese.trim() || null,
        diagnostico: diagnostico.trim() || null,
        prescricao: prescricao.trim() || null,
        observacoes: obs.trim() || null,
        valor: valor ? Number(valor.replace(",", ".")) : null,
      },
      {
        onSuccess: (a) => {
          toast.success(atendimento ? "Atendimento atualizado" : "Atendimento registrado");
          onSalvo(a);
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : "Erro ao salvar";
          toast.error(msg);
        },
      },
    );
  }

  function handleExcluir() {
    if (!atendimento) return;
    if (!confirm("Excluir este atendimento?")) return;
    excluir.mutate(
      { id: atendimento.id, paciente_id: paciente.id },
      {
        onSuccess: () => {
          toast.success("Atendimento excluído");
          onExcluir();
        },
      },
    );
  }

  return (
    <section className="glass-panel rounded-2xl p-5">
      <header className="mb-4 flex items-center gap-2">
        <Stethoscope className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold">
          {atendimento ? "Editar atendimento" : "Novo atendimento"}
        </p>
        {agendamentoId && !atendimento && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            do agendamento
          </span>
        )}
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label className="text-xs">Médico</Label>
          <Select value={medicoId} onValueChange={setMedicoId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {(medicos ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Data</Label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Hora</Label>
          <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        </div>
      </div>

      <div className="mt-3">
        <Label className="text-xs">Anamnese</Label>
        <Textarea
          rows={3}
          value={anamnese}
          onChange={(e) => setAnamnese(e.target.value)}
          placeholder="Queixa, histórico, sintomas..."
        />
      </div>
      <div className="mt-3">
        <Label className="text-xs">Diagnóstico</Label>
        <Textarea
          rows={2}
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
          placeholder="Hipótese diagnóstica / CID"
        />
      </div>
      <div className="mt-3">
        <Label className="text-xs">Prescrição / conduta</Label>
        <Textarea
          rows={3}
          value={prescricao}
          onChange={(e) => setPrescricao(e.target.value)}
          placeholder="Medicamentos, exames, orientações..."
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
        <div>
          <Label className="text-xs">Observações</Label>
          <Textarea
            rows={2}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Notas internas"
          />
        </div>
        <div>
          <Label className="text-xs">Valor (R$)</Label>
          <Input
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {atendimento ? (
          <Button variant="ghost" onClick={handleExcluir} disabled={excluir.isPending}>
            <Trash2 className="h-4 w-4 text-destructive" />
            Excluir
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={handleSalvar} disabled={salvar.isPending}>
          {salvar.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
    </section>
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */
function iniciais(nome: string) {
  return nome
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function idade(iso: string) {
  const n = new Date(iso + "T00:00:00");
  const h = new Date();
  let a = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) a--;
  return a;
}
