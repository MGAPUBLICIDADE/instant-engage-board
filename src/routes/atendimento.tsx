import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { ClientOnly } from "@/components/ClientOnly";

import { usePacientes, type Paciente } from "@/hooks/usePacientes";
import { useMedicos, type Medico } from "@/hooks/useMedicos";
import {
  useAgendamentosDiaClinica,
  useAtualizarStatusAgendamento,
  useSalvarAgendamento,
  type Agendamento,
  type StatusAgendamento,
} from "@/hooks/useAgendamentos";
import { useAgendaConfig } from "@/hooks/useAgendaConfig";
import { useBloqueioSemana } from "@/hooks/useBloqueioSemana";
import { useBloqueioDatas } from "@/hooks/useBloqueioDatas";
import {
  useAtendimentosPaciente,
  useSalvarAtendimento,
  useExcluirAtendimento,
  type Atendimento,
} from "@/hooks/useAtendimentos";
import { gerarSlots } from "@/lib/agenda-slots";

const search = z.object({
  paciente: z.string().optional(),
  agendamento: z.string().optional(),
  medico: z.string().optional(),
  data: z.string().optional(),
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
          "Kanban dinâmico do dia com pacientes agendados, encaixe manual e prontuário integrado.",
      },
    ],
  }),
});

function AtendimentoRoute() {
  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Carregando atendimento...
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
  const { data: pacientes = [] } = usePacientes();
  const pacienteSel = useMemo(
    () => pacientes.find((p) => p.id === sp.paciente) ?? null,
    [pacientes, sp.paciente],
  );

  function fecharProntuario() {
    navigate({ to: "/atendimento", search: {} });
  }

  if (pacienteSel) {
    return (
      <PacienteProntuario
        paciente={pacienteSel}
        agendamentoId={sp.agendamento}
        medicoIdInicial={sp.medico}
        onVoltar={fecharProntuario}
      />
    );
  }

  return <KanbanDia />;
}

/* ============================================================
 * KANBAN DO DIA
 * ============================================================ */

const COLUNAS: { id: StatusAgendamento; titulo: string; tone: string; dot: string }[] = [
  { id: "agendado", titulo: "Consultas agendadas", tone: "border-info/40", dot: "bg-info" },
  { id: "confirmado", titulo: "Consultas confirmadas", tone: "border-warning/40", dot: "bg-warning" },
  { id: "atendido", titulo: "Pacientes atendidos", tone: "border-success/40", dot: "bg-success" },
  { id: "faltou", titulo: "Pacientes que faltaram", tone: "border-destructive/40", dot: "bg-destructive" },
];

function KanbanDia() {
  const navigate = useNavigate();
  const sp = Route.useSearch();
  const { data: medicos = [] } = useMedicos();
  const { data: pacientes = [] } = usePacientes();
  const ativos = useMemo(() => medicos.filter((m) => m.ativo), [medicos]);

  const hojeIso = toIsoDate(new Date());
  const [dataSel, setDataSel] = useState<string>(sp.data ?? hojeIso);
  const [medicoFiltro, setMedicoFiltro] = useState<string>(sp.medico ?? "todos");

  const medicoQuery = medicoFiltro === "todos" ? undefined : medicoFiltro;
  const { data: agendamentos = [], isLoading } = useAgendamentosDiaClinica(
    dataSel,
    medicoQuery,
  );

  const atualizarStatus = useAtualizarStatusAgendamento();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detalhes, setDetalhes] = useState<Agendamento | null>(null);
  const [encaixeOpen, setEncaixeOpen] = useState(false);

  const grouped = useMemo(() => {
    const g: Record<StatusAgendamento, Agendamento[]> = {
      agendado: [],
      confirmado: [],
      atendido: [],
      cancelado: [],
      faltou: [],
    };
    agendamentos.forEach((a) => {
      if (a.status === "cancelado") return;
      g[a.status].push(a);
    });
    return g;
  }, [agendamentos]);

  const totalDia = agendamentos.filter((a) => a.status !== "cancelado").length;
  const activeAg = agendamentos.find((a) => a.id === activeId) ?? null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overId = e.over?.id as StatusAgendamento | undefined;
    if (!overId) return;
    const ag = agendamentos.find((a) => a.id === e.active.id);
    if (!ag || ag.status === overId) return;
    atualizarStatus.mutate(
      { id: ag.id, status: overId, medico_id: ag.medico_id, data: ag.data },
      {
        onSuccess: () => toast.success(`Movido para ${labelStatus(overId)}`),
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : "Erro ao mover"),
      },
    );
  }

  function mudarData(delta: number) {
    const d = new Date(dataSel + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setDataSel(toIsoDate(d));
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <h1 className="font-display text-2xl font-bold tracking-tight">Kanban da Clínica</h1>
            <p className="text-sm text-muted-foreground">
              Consultas, pacientes e médicos do dia · sem pedidos de delivery
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
            <button
              onClick={() => mudarData(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-elevated"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="date"
              value={dataSel}
              onChange={(e) => setDataSel(e.target.value)}
              className="bg-transparent px-2 py-1 text-sm font-semibold outline-none"
            />
            <button
              onClick={() => mudarData(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-elevated"
              aria-label="Próximo dia"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {dataSel !== hojeIso && (
              <button
                onClick={() => setDataSel(hojeIso)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-surface-elevated"
              >
                Hoje
              </button>
            )}
          </div>

          <Select value={medicoFiltro} onValueChange={setMedicoFiltro}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Médico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os médicos</SelectItem>
              {ativos.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setEncaixeOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Encaixar
          </Button>
        </header>

        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(dataSel + "T00:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </span>
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-semibold">
            {totalDia} {totalDia === 1 ? "paciente" : "pacientes"}
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : ativos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Nenhum médico ativo</p>
            <Link
              to="/configuracoes-medicos"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Cadastrar médico
            </Link>
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {COLUNAS.map((c) => (
                <Coluna
                  key={c.id}
                  coluna={c}
                  agendamentos={grouped[c.id]}
                  medicos={medicos}
                  pacientes={pacientes}
                  onClickCard={(ag) => setDetalhes(ag)}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeAg ? (
                <CardAgendamento
                  ag={activeAg}
                  medicos={medicos}
                  pacientes={pacientes}
                  dragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {detalhes && (
        <DetalhesDialog
          ag={detalhes}
          medicos={medicos}
          pacientes={pacientes}
          onClose={() => setDetalhes(null)}
          onAbrirProntuario={() => {
            navigate({
              to: "/atendimento",
              search: {
                paciente: detalhes.paciente_id,
                agendamento: detalhes.id,
                medico: detalhes.medico_id,
              },
            });
          }}
        />
      )}

      <EncaixeDialog
        open={encaixeOpen}
        onOpenChange={setEncaixeOpen}
        data={dataSel}
        medicos={ativos}
        medicoIdInicial={medicoFiltro !== "todos" ? medicoFiltro : undefined}
      />
    </div>
  );
}

function usePacientesList() {
  const { data: pacientes = [] } = usePacientes();
  return pacientes;
}

/** Aux: lista de pacientes da empresa para uso nos cards. */
function getPaciente(pacientes: Paciente[], id: string) {
  return pacientes.find((p) => p.id === id);
}
function getMedico(medicos: Medico[], id: string) {
  return medicos.find((m) => m.id === id);
}

function Coluna({
  coluna,
  agendamentos,
  medicos,
  pacientes,
  onClickCard,
}: {
  coluna: (typeof COLUNAS)[number];
  agendamentos: Agendamento[];
  medicos: Medico[];
  pacientes: Paciente[];
  onClickCard: (ag: Agendamento) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border bg-surface/40 transition-all ${
        isOver ? `${coluna.tone} bg-surface-elevated` : "border-border/50"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${coluna.dot}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider">{coluna.titulo}</h3>
        </div>
        <span className="rounded-md bg-surface-elevated px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
          {agendamentos.length}
        </span>
      </div>
      <div className="flex min-h-[200px] flex-1 flex-col gap-2 overflow-auto p-2">
        {agendamentos.map((ag) => (
          <DraggableCard
            key={ag.id}
            ag={ag}
            medicos={medicos}
            pacientes={pacientes}
            onClick={() => onClickCard(ag)}
          />
        ))}
        {agendamentos.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/40 py-6 text-[11px] text-muted-foreground">
            Vazio
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  ag,
  medicos,
  pacientes,
  onClick,
}: {
  ag: Agendamento;
  medicos: Medico[];
  pacientes: Paciente[];
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: ag.id });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="group cursor-pointer"
    >
      <CardAgendamento
        ag={ag}
        medicos={medicos}
        pacientes={pacientes}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function CardAgendamento({
  ag,
  medicos,
  pacientes,
  dragging,
  dragHandleProps,
}: {
  ag: Agendamento;
  medicos: Medico[];
  pacientes: Paciente[];
  dragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}) {
  const paciente = getPaciente(pacientes, ag.paciente_id);
  const medico = getMedico(medicos, ag.medico_id);
  const cor = medico?.cor ?? "#3b82f6";
  return (
    <div
      className={`relative rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-border ${
        dragging ? "shadow-[var(--shadow-elevated)] rotate-1 scale-105" : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
          style={{ background: cor }}
        >
          {iniciais(paciente?.nome ?? "?")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{paciente?.nome ?? "Paciente"}</p>
            <button
              {...dragHandleProps}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              aria-label="Arrastar"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {medico?.nome ?? "—"}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1 font-bold text-primary">
              <Clock className="h-3 w-3" />
              {ag.hora.slice(0, 5)}
            </span>
            <span className="truncate text-muted-foreground">
              {ag.procedimento ?? "Consulta"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * DIALOG: Detalhes do agendamento
 * ============================================================ */
function DetalhesDialog({
  ag,
  medicos,
  pacientes,
  onClose,
  onAbrirProntuario,
}: {
  ag: Agendamento;
  medicos: Medico[];
  pacientes: Paciente[];
  onClose: () => void;
  onAbrirProntuario: () => void;
}) {
  const paciente = getPaciente(pacientes, ag.paciente_id);
  const medico = getMedico(medicos, ag.medico_id);
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <Linha label="Paciente" valor={paciente?.nome ?? "—"} />
          <Linha label="Telefone" valor={paciente?.telefone ?? "—"} />
          <Linha label="Médico" valor={medico?.nome ?? "—"} />
          <Linha
            label="Data"
            valor={new Date(ag.data + "T00:00:00").toLocaleDateString("pt-BR")}
          />
          <Linha label="Hora" valor={`${ag.hora.slice(0, 5)} (${ag.duracao_min} min)`} />
          <Linha label="Procedimento" valor={ag.procedimento ?? "Consulta"} />
          <Linha label="Status" valor={labelStatus(ag.status)} />
          {ag.valor != null && (
            <Linha label="Valor" valor={`R$ ${ag.valor.toFixed(2)}`} />
          )}
          {ag.observacoes && (
            <div className="rounded-lg border border-border bg-surface p-2 text-xs">
              <p className="mb-1 font-semibold uppercase tracking-wider text-muted-foreground">
                Observações
              </p>
              <p>{ag.observacoes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onAbrirProntuario} className="gap-2">
            <Stethoscope className="h-4 w-4" />
            Abrir prontuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right">{valor}</span>
    </div>
  );
}

/* ============================================================
 * DIALOG: Encaixe manual
 * ============================================================ */
function EncaixeDialog({
  open,
  onOpenChange,
  data,
  medicos,
  medicoIdInicial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: string;
  medicos: Medico[];
  medicoIdInicial?: string;
}) {
  const { data: pacientes = [] } = usePacientes();
  const ativos = useMemo(() => pacientes.filter((p) => p.ativo), [pacientes]);
  const salvar = useSalvarAgendamento();

  const [medicoId, setMedicoId] = useState<string>(medicoIdInicial ?? medicos[0]?.id ?? "");
  const [pacienteId, setPacienteId] = useState("");
  const [hora, setHora] = useState<string>("");
  const [procedimento, setProcedimento] = useState("");
  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (open) {
      setMedicoId(medicoIdInicial ?? medicos[0]?.id ?? "");
      setPacienteId("");
      setHora("");
      setProcedimento("");
      setValor("");
      setObs("");
    }
  }, [open, medicoIdInicial, medicos]);

  const { data: config } = useAgendaConfig(medicoId);
  const { data: bloqSemana = [] } = useBloqueioSemana(medicoId);
  const { data: bloqData = [] } = useBloqueioDatas(medicoId);
  const { data: agDia = [] } = useAgendamentosDiaClinica(data, medicoId);

  const slots = useMemo(
    () =>
      gerarSlots({
        data,
        config: config ?? null,
        bloqSemana,
        bloqData,
        agendamentos: agDia,
      }),
    [data, config, bloqSemana, bloqData, agDia],
  );
  const livres = useMemo(() => slots.filter((s) => s.status === "livre"), [slots]);

  function handleSalvar() {
    if (!medicoId) {
      toast.error("Selecione o médico");
      return;
    }
    if (!pacienteId) {
      toast.error("Selecione o paciente");
      return;
    }
    if (!hora) {
      toast.error("Escolha um horário");
      return;
    }
    salvar.mutate(
      {
        medico_id: medicoId,
        paciente_id: pacienteId,
        data,
        hora,
        duracao_min: config?.duracao_consulta_min ?? 30,
        procedimento: procedimento || null,
        valor: valor ? Number(valor.replace(",", ".")) : null,
        observacoes: obs || null,
        status: "agendado",
      },
      {
        onSuccess: () => {
          toast.success("Paciente encaixado");
          onOpenChange(false);
        },
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Erro ao encaixar"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Encaixar paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Médico</Label>
              <Select value={medicoId} onValueChange={setMedicoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {medicos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Data</Label>
              <Input
                value={new Date(data + "T00:00:00").toLocaleDateString("pt-BR")}
                disabled
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Paciente *</Label>
            {ativos.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-3 text-xs">
                Nenhum paciente ativo.{" "}
                <Link to="/configuracoes-pacientes" className="font-semibold text-primary">
                  Cadastrar
                </Link>
              </div>
            ) : (
              <Select value={pacienteId} onValueChange={setPacienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {ativos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label className="text-xs">Horário disponível *</Label>
            {!config ? (
              <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                Configure a agenda do médico em{" "}
                <Link to="/configuracoes-agenda" className="font-semibold text-primary">
                  Configurações
                </Link>
                .
              </p>
            ) : livres.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                Nenhum horário livre nesse dia. Você ainda pode digitar um horário manual abaixo.
              </p>
            ) : (
              <div className="grid max-h-[180px] grid-cols-4 gap-1.5 overflow-y-auto rounded-lg border border-border bg-surface p-2 sm:grid-cols-6">
                {livres.map((s) => (
                  <button
                    key={s.hora}
                    type="button"
                    onClick={() => setHora(s.hora)}
                    className={`rounded-md px-2 py-1.5 text-xs font-bold transition-all ${
                      hora === s.hora
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-elevated hover:bg-primary/20"
                    }`}
                  >
                    {s.hora}
                  </button>
                ))}
              </div>
            )}
            <Input
              className="mt-2"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              placeholder="HH:MM"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Procedimento</Label>
              <Input
                value={procedimento}
                onChange={(e) => setProcedimento(e.target.value)}
                placeholder="Consulta, retorno..."
              />
            </div>
            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvar.isPending}>
            {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Encaixar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
 * Prontuário do paciente (mantido)
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

  const [editandoId, setEditandoId] = useState<string | null>(null);

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
          <aside className="glass-panel rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-bold">
                <ClipboardList className="h-4 w-4 text-primary" />
                Histórico
              </p>
              <Button size="sm" variant="ghost" onClick={() => setEditandoId(null)}>
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

      <footer className="mt-5 flex items-center justify-between">
        {atendimento ? (
          <Button variant="ghost" onClick={handleExcluir} disabled={excluir.isPending}>
            <Trash2 className="mr-1 h-4 w-4 text-destructive" />
            Excluir
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={handleSalvar} disabled={salvar.isPending}>
          {salvar.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>
      </footer>
    </section>
  );
}

/* ============================================================
 * helpers
 * ============================================================ */
function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function idade(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const nasc = new Date(y, (m ?? 1) - 1, d ?? 1);
  const hoje = new Date();
  let a = hoje.getFullYear() - nasc.getFullYear();
  const mDiff = hoje.getMonth() - nasc.getMonth();
  if (mDiff < 0 || (mDiff === 0 && hoje.getDate() < nasc.getDate())) a--;
  return a;
}
function labelStatus(s: StatusAgendamento) {
  switch (s) {
    case "agendado":
      return "Agendado";
    case "confirmado":
      return "Confirmado";
    case "atendido":
      return "Atendido";
    case "cancelado":
      return "Cancelado";
    case "faltou":
      return "Faltou";
  }
}
