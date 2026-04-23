import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Stethoscope,
  Trash2,
  CalendarCog,
  Stethoscope as AtenderIcon,
} from "lucide-react";
import { toast } from "sonner";

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

import { useMedicos, type Medico } from "@/hooks/useMedicos";
import { usePacientes } from "@/hooks/usePacientes";
import { useAgendaConfig } from "@/hooks/useAgendaConfig";
import { useBloqueioSemana } from "@/hooks/useBloqueioSemana";
import { useBloqueioDatas } from "@/hooks/useBloqueioDatas";
import {
  useAgendamentosMes,
  useAgendamentosDia,
  useSalvarAgendamento,
  useExcluirAgendamento,
} from "@/hooks/useAgendamentos";
import { gerarSlots, type Slot } from "@/lib/agenda-slots";

export const Route = createFileRoute("/agenda")({
  component: AgendaPage,
  head: () => ({
    meta: [
      { title: "Agenda · Conecta MGA" },
      {
        name: "description",
        content: "Visualize e organize os atendimentos por médico.",
      },
    ],
  }),
});

function AgendaPage() {
  const { data: medicos = [], isLoading } = useMedicos();
  const ativos = useMemo(() => medicos.filter((m) => m.ativo), [medicos]);
  const [medicoSel, setMedicoSel] = useState<Medico | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (medicoSel) {
    return <AgendaMedico medico={medicoSel} onVoltar={() => setMedicoSel(null)} />;
  }

  return <ListaMedicos medicos={ativos} onSelect={setMedicoSel} />;
}

/* ============================================================
 * Lista de médicos
 * ============================================================ */
function ListaMedicos({
  medicos,
  onSelect,
}: {
  medicos: Medico[];
  onSelect: (m: Medico) => void;
}) {
  const hoje = new Date();
  const mes = hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[900px]">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm capitalize text-muted-foreground">{mes}</p>
        </header>

        {medicos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Nenhum médico ativo</p>
            <p className="text-xs text-muted-foreground">
              Cadastre um médico para começar a agendar.
            </p>
            <Link
              to="/configuracoes-medicos"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Cadastrar médico
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Selecione um médico
            </p>
            <div className="space-y-2">
              {medicos.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelect(m)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-4 text-left transition-all hover:border-primary/40 hover:bg-surface-elevated card-lift"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ background: m.cor ?? "#3b82f6" }}
                  >
                    {iniciais(m.nome)}
                  </div>
                  <div className="flex-1 leading-tight">
                    <p className="text-sm font-bold">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.especialidade ?? "—"}
                      {m.crm ? ` · CRM ${m.crm}${m.conselho_uf ? `/${m.conselho_uf}` : ""}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Abrir agenda →
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Agenda do médico
 * ============================================================ */
function AgendaMedico({ medico, onVoltar }: { medico: Medico; onVoltar: () => void }) {
  const hoje = new Date();
  const [mesRef, setMesRef] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1),
  );
  const [diaSel, setDiaSel] = useState<string>(toIsoDate(hoje));

  const ym = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;

  const { data: config } = useAgendaConfig(medico.id);
  const { data: bloqSemana = [] } = useBloqueioSemana(medico.id);
  const { data: bloqData = [] } = useBloqueioDatas(medico.id);
  const { data: contagem = {} } = useAgendamentosMes(medico.id, ym);
  const { data: agDia = [] } = useAgendamentosDia(medico.id, diaSel);

  const slots = useMemo(
    () =>
      gerarSlots({
        data: diaSel,
        config: config ?? null,
        bloqSemana,
        bloqData,
        agendamentos: agDia,
      }),
    [diaSel, config, bloqSemana, bloqData, agDia],
  );

  const [novoOpen, setNovoOpen] = useState(false);
  const [horaSel, setHoraSel] = useState<string>("");

  function abrirNovo(hora: string) {
    setHoraSel(hora);
    setNovoOpen(true);
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={onVoltar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-elevated"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ background: medico.cor ?? "#3b82f6" }}
          >
            {iniciais(medico.nome)}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold tracking-tight">{medico.nome}</h1>
            <p className="text-xs text-muted-foreground">
              {medico.especialidade ?? "—"}
            </p>
          </div>
          {!config && (
            <Link
              to="/configuracoes-agenda"
              className="inline-flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-semibold text-warning"
            >
              <CalendarCog className="h-3.5 w-3.5" /> Configurar agenda
            </Link>
          )}
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Calendário do mês */}
          <CalendarioMes
            mesRef={mesRef}
            onMudarMes={setMesRef}
            diaSel={diaSel}
            onSelecionar={setDiaSel}
            contagem={contagem}
          />

          {/* Slots do dia */}
          <SlotsDia
            data={diaSel}
            slots={slots}
            temConfig={!!config}
            medicoId={medico.id}
            onNovo={abrirNovo}
          />
        </div>
      </div>

      <NovoAgendamentoDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        medicoId={medico.id}
        data={diaSel}
        hora={horaSel}
        duracao={config?.duracao_consulta_min ?? 30}
      />
    </div>
  );
}

/* ============================================================
 * Calendário do mês
 * ============================================================ */
function CalendarioMes({
  mesRef,
  onMudarMes,
  diaSel,
  onSelecionar,
  contagem,
}: {
  mesRef: Date;
  onMudarMes: (d: Date) => void;
  diaSel: string;
  onSelecionar: (iso: string) => void;
  contagem: Record<string, number>;
}) {
  const ano = mesRef.getFullYear();
  const mes = mesRef.getMonth();
  const firstDay = new Date(ano, mes, 1).getDay();
  const dias = new Date(ano, mes + 1, 0).getDate();
  const hoje = toIsoDate(new Date());

  const nomeMes = mesRef.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => onMudarMes(new Date(ano, mes - 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface-elevated"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold capitalize">{nomeMes}</p>
        <button
          onClick={() => onMudarMes(new Date(ano, mes + 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface-elevated"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: dias }, (_, i) => i + 1).map((d) => {
          const iso = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isToday = iso === hoje;
          const isSel = iso === diaSel;
          const qtd = contagem[iso] ?? 0;
          return (
            <button
              key={d}
              onClick={() => onSelecionar(iso)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-all ${
                isSel
                  ? "bg-primary font-bold text-primary-foreground"
                  : isToday
                    ? "border border-primary/50 font-semibold text-foreground"
                    : "text-foreground hover:bg-surface-elevated"
              }`}
            >
              <span>{d}</span>
              {qtd > 0 && (
                <span
                  className={`mt-0.5 text-[9px] font-bold ${
                    isSel ? "text-primary-foreground/80" : "text-primary"
                  }`}
                >
                  {qtd}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
 * Slots do dia
 * ============================================================ */
function SlotsDia({
  data,
  slots,
  temConfig,
  medicoId,
  onNovo,
}: {
  data: string;
  slots: Slot[];
  temConfig: boolean;
  medicoId: string;
  onNovo: (hora: string) => void;
}) {
  const dataLabel = new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="glass-panel rounded-2xl p-5">
      <header className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold capitalize">{dataLabel}</p>
      </header>

      {!temConfig ? (
        <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Configure os horários do médico para gerar a agenda.
        </div>
      ) : slots.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sem horários disponíveis.</p>
      ) : slots.length === 1 && slots[0].status === "bloqueado" && slots[0].hora === "—" ? (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-center text-xs font-semibold text-warning">
          Dia bloqueado{slots[0].motivo ? `: ${slots[0].motivo}` : ""}
        </div>
      ) : (
        <ul className="max-h-[60vh] space-y-1.5 overflow-auto pr-1">
          {slots.map((s, i) => (
            <SlotItem key={i} slot={s} onNovo={onNovo} medicoId={medicoId} data={data} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SlotItem({
  slot,
  onNovo,
  medicoId,
  data,
}: {
  slot: Slot;
  onNovo: (hora: string) => void;
  medicoId: string;
  data: string;
}) {
  const excluir = useExcluirAgendamento();
  const navigate = useNavigate();

  if (slot.status === "almoco") {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 opacity-60">
        <span className="w-12 text-xs font-bold text-muted-foreground">{slot.hora}</span>
        <span className="text-xs italic text-muted-foreground">Almoço</span>
      </li>
    );
  }
  if (slot.status === "bloqueado") {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 opacity-60">
        <span className="w-12 text-xs font-bold text-muted-foreground">{slot.hora}</span>
        <span className="text-xs italic text-muted-foreground">
          {slot.motivo ?? "Bloqueado"}
        </span>
      </li>
    );
  }
  if (slot.status === "ocupado" && slot.agendamento) {
    const ag = slot.agendamento;
    return (
      <li className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
        <span className="w-12 text-xs font-bold text-primary">{slot.hora}</span>
        <div className="flex-1 leading-tight">
          <p className="text-xs font-semibold">
            {ag.procedimento ?? "Consulta"}
            <span className="ml-2 text-[10px] uppercase text-muted-foreground">
              {ag.status}
            </span>
          </p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {ag.duracao_min} min
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs"
          onClick={() =>
            navigate({
              to: "/atendimento",
              search: {
                paciente: ag.paciente_id,
                agendamento: ag.id,
                medico: medicoId,
              },
            })
          }
        >
          <AtenderIcon className="h-3.5 w-3.5" />
          Atender
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            excluir.mutate(
              { id: ag.id, medico_id: medicoId, data },
              { onSuccess: () => toast.success("Agendamento removido") },
            )
          }
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </li>
    );
  }
  return (
    <li>
      <button
        onClick={() => onNovo(slot.hora)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-left hover:border-primary/40 hover:bg-surface-elevated"
      >
        <span className="w-12 text-xs font-bold text-foreground">{slot.hora}</span>
        <span className="flex-1 text-xs text-muted-foreground">Disponível</span>
        <Plus className="h-3.5 w-3.5 text-primary" />
      </button>
    </li>
  );
}

/* ============================================================
 * Dialog: novo agendamento
 * ============================================================ */
function NovoAgendamentoDialog({
  open,
  onOpenChange,
  medicoId,
  data,
  hora,
  duracao,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  medicoId: string;
  data: string;
  hora: string;
  duracao: number;
}) {
  const { data: pacientes = [] } = usePacientes();
  const ativos = useMemo(() => pacientes.filter((p) => p.ativo), [pacientes]);
  const salvar = useSalvarAgendamento();

  const [pacienteId, setPacienteId] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");

  function salvarAgendamento() {
    if (!pacienteId) {
      toast.error("Selecione um paciente");
      return;
    }
    salvar.mutate(
      {
        medico_id: medicoId,
        paciente_id: pacienteId,
        data,
        hora,
        duracao_min: duracao,
        procedimento: procedimento || null,
        valor: valor ? Number(valor.replace(",", ".")) : null,
        observacoes: obs || null,
        status: "agendado",
      },
      {
        onSuccess: () => {
          toast.success("Agendamento criado");
          onOpenChange(false);
          setPacienteId("");
          setProcedimento("");
          setValor("");
          setObs("");
        },
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Novo agendamento · {hora} ({duracao} min)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
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
                  <SelectValue placeholder="Selecione" />
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
          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={salvarAgendamento} disabled={salvar.isPending}>
            {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
