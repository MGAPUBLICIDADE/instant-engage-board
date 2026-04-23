import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  Save,
  Stethoscope,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
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

import { useMedicos } from "@/hooks/useMedicos";
import { usePacientes } from "@/hooks/usePacientes";
import {
  useAgendamentosDia,
  useAtualizarStatusAgendamento,
  type Agendamento,
} from "@/hooks/useAgendamentos";
import {
  useAtendimentoPorAgendamento,
  useSalvarAtendimento,
  type AtendimentoInput,
} from "@/hooks/useAtendimentos";

export const Route = createFileRoute("/portal-medico")({
  component: PortalMedicoPage,
});

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmtDataLong = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function PortalMedicoPage() {
  const [data, setData] = useState<string>(todayISO());
  const [medicoId, setMedicoId] = useState<string>("");
  const [agendamentoAtivo, setAgendamentoAtivo] = useState<Agendamento | null>(null);

  const { data: medicos = [], isLoading: loadingMedicos } = useMedicos();
  const { data: pacientes = [] } = usePacientes();
  const pacienteMap = useMemo(
    () => Object.fromEntries(pacientes.map((p) => [p.id, p])),
    [pacientes],
  );

  // Auto-seleciona o primeiro médico
  useEffect(() => {
    if (!medicoId && medicos.length > 0) setMedicoId(medicos[0].id);
  }, [medicos, medicoId]);

  const { data: agendamentos = [], isLoading: loadingAg } = useAgendamentosDia(
    medicoId || undefined,
    data,
  );

  const consultasOrdenadas = useMemo(
    () =>
      [...agendamentos]
        .filter((a) => a.status !== "cancelado")
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    [agendamentos],
  );

  const shiftDia = (delta: number) => {
    const [y, m, d] = data.split("-").map(Number);
    const dt = new Date(y, m - 1, d + delta);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    setData(`${yy}-${mm}-${dd}`);
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        <header className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Portal do Médico
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              Agenda do Dia
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {fmtDataLong(data)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => shiftDia(-1)}
                aria-label="Dia anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-9 w-[160px] border-0 bg-transparent"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => shiftDia(1)}
                aria-label="Próximo dia"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setData(todayISO())}>
              Hoje
            </Button>
            <Select value={medicoId} onValueChange={setMedicoId}>
              <SelectTrigger className="h-10 w-[240px]">
                <SelectValue
                  placeholder={
                    loadingMedicos ? "Carregando..." : "Selecione o médico"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {medicos.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-3.5 w-3.5 text-primary" />
                      <span>{m.nome}</span>
                      {m.especialidade && (
                        <span className="text-xs text-muted-foreground">
                          · {m.especialidade}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {!medicoId ? (
          <EmptyState
            icon={<Stethoscope className="h-10 w-10" />}
            title="Selecione um médico"
            desc="Escolha o médico para visualizar a agenda do dia."
          />
        ) : loadingAg ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : consultasOrdenadas.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="Nenhuma consulta para esta data"
            desc="Quando houver agendamentos, eles aparecerão aqui."
          />
        ) : (
          <div className="grid gap-3">
            {consultasOrdenadas.map((ag) => {
              const pac = pacienteMap[ag.paciente_id];
              return (
                <ConsultaCard
                  key={ag.id}
                  ag={ag}
                  pacienteNome={pac?.nome ?? "Paciente"}
                  pacienteContato={pac?.whatsapp ?? pac?.telefone ?? null}
                  onAtender={() => setAgendamentoAtivo(ag)}
                />
              );
            })}
          </div>
        )}
      </div>

      {agendamentoAtivo && (
        <ProntuarioDialog
          agendamento={agendamentoAtivo}
          pacienteNome={pacienteMap[agendamentoAtivo.paciente_id]?.nome ?? "Paciente"}
          onClose={() => setAgendamentoAtivo(null)}
        />
      )}
    </AppShell>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 py-20 text-center">
      <div className="mb-3 text-muted-foreground">{icon}</div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function ConsultaCard({
  ag,
  pacienteNome,
  pacienteContato,
  onAtender,
}: {
  ag: Agendamento;
  pacienteNome: string;
  pacienteContato: string | null;
  onAtender: () => void;
}) {
  const statusLabel: Record<string, string> = {
    agendado: "Agendado",
    confirmado: "Confirmado",
    atendido: "Atendido",
    faltou: "Faltou",
    cancelado: "Cancelado",
  };
  const statusTone: Record<string, string> = {
    agendado: "bg-info/15 text-info",
    confirmado: "bg-success/15 text-success",
    atendido: "bg-primary/15 text-primary",
    faltou: "bg-destructive/15 text-destructive",
    cancelado: "bg-muted text-muted-foreground",
  };

  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_var(--color-primary)] sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 sm:w-32">
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-display text-sm font-bold">
            {ag.hora.slice(0, 5)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground sm:hidden">
          {ag.duracao_min} min
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold">{pacienteNome}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusTone[ag.status]}`}
          >
            {statusLabel[ag.status]}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClipboardList className="h-3 w-3" />
            {ag.procedimento || "Consulta"}
          </span>
          {pacienteContato && (
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {pacienteContato}
            </span>
          )}
          <span className="hidden sm:inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {ag.duracao_min} min
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onAtender} className="gap-2">
          <Stethoscope className="h-4 w-4" />
          Atender
        </Button>
      </div>
    </article>
  );
}

interface ProntuarioForm {
  queixa_principal: string;
  historico: string;
  diagnostico: string;
  procedimento: string;
  observacoes: string;
  prescricao: string;
  valor: string;
}

const emptyForm: ProntuarioForm = {
  queixa_principal: "",
  historico: "",
  diagnostico: "",
  procedimento: "",
  observacoes: "",
  prescricao: "",
  valor: "",
};

function ProntuarioDialog({
  agendamento,
  pacienteNome,
  onClose,
}: {
  agendamento: Agendamento;
  pacienteNome: string;
  onClose: () => void;
}) {
  const { data: existente, isLoading } = useAtendimentoPorAgendamento(agendamento.id);
  const salvar = useSalvarAtendimento();
  const atualizarStatus = useAtualizarStatusAgendamento();
  const [form, setForm] = useState<ProntuarioForm>(emptyForm);

  // Carrega prontuário existente (anamnese guarda queixa+histórico em blocos)
  useEffect(() => {
    if (!existente) {
      setForm(emptyForm);
      return;
    }
    // Decodifica anamnese: tenta separar "Queixa principal:" e "Histórico:"
    const anamn = existente.anamnese ?? "";
    const queixaMatch = anamn.match(/Queixa principal:\s*([\s\S]*?)(?=\n\nHistórico:|$)/);
    const histMatch = anamn.match(/Histórico:\s*([\s\S]*)$/);
    setForm({
      queixa_principal: queixaMatch?.[1]?.trim() ?? (queixaMatch ? "" : anamn),
      historico: histMatch?.[1]?.trim() ?? "",
      diagnostico: existente.diagnostico ?? "",
      procedimento: "",
      observacoes: existente.observacoes ?? "",
      prescricao: existente.prescricao ?? "",
      valor: existente.valor != null ? String(existente.valor) : "",
    });
  }, [existente]);

  const set = <K extends keyof ProntuarioForm>(k: K, v: ProntuarioForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSalvar = async () => {
    const anamnese = [
      form.queixa_principal && `Queixa principal:\n${form.queixa_principal}`,
      form.historico && `Histórico:\n${form.historico}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const observacoes = [
      form.procedimento && `Procedimento: ${form.procedimento}`,
      form.observacoes,
    ]
      .filter(Boolean)
      .join("\n\n");

    const payload: AtendimentoInput & { id?: string } = {
      paciente_id: agendamento.paciente_id,
      medico_id: agendamento.medico_id,
      agendamento_id: agendamento.id,
      data: agendamento.data,
      hora: agendamento.hora,
      anamnese: anamnese || null,
      diagnostico: form.diagnostico || null,
      prescricao: form.prescricao || null,
      observacoes: observacoes || null,
      valor: form.valor ? Number(form.valor) : null,
      ...(existente?.id ? { id: existente.id } : {}),
    };

    try {
      await salvar.mutateAsync(payload);
      // Marca consulta como atendida
      if (agendamento.status !== "atendido") {
        await atualizarStatus.mutateAsync({
          id: agendamento.id,
          status: "atendido",
          medico_id: agendamento.medico_id,
          data: agendamento.data,
        });
      }
      toast.success("Prontuário salvo");
      onClose();
    } catch (e) {
      toast.error("Erro ao salvar prontuário", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border bg-surface/60 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Prontuário
          </DialogTitle>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" /> {pacienteNome}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {fmtDataLong(agendamento.data)} às {agendamento.hora.slice(0, 5)}
            </span>
            {agendamento.procedimento && (
              <span className="inline-flex items-center gap-1">
                <ClipboardList className="h-3 w-3" />
                {agendamento.procedimento}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              <Field label="Queixa principal">
                <Textarea
                  rows={2}
                  value={form.queixa_principal}
                  onChange={(e) => set("queixa_principal", e.target.value)}
                  placeholder="Motivo da consulta..."
                />
              </Field>

              <Field label="Histórico">
                <Textarea
                  rows={3}
                  value={form.historico}
                  onChange={(e) => set("historico", e.target.value)}
                  placeholder="História clínica, antecedentes..."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Diagnóstico">
                  <Textarea
                    rows={3}
                    value={form.diagnostico}
                    onChange={(e) => set("diagnostico", e.target.value)}
                    placeholder="CID, hipóteses..."
                  />
                </Field>
                <Field label="Procedimento">
                  <Textarea
                    rows={3}
                    value={form.procedimento}
                    onChange={(e) => set("procedimento", e.target.value)}
                    placeholder="Procedimentos realizados..."
                  />
                </Field>
              </div>

              <Field label="Prescrição">
                <Textarea
                  rows={4}
                  value={form.prescricao}
                  onChange={(e) => set("prescricao", e.target.value)}
                  placeholder="Medicamentos, posologia..."
                />
              </Field>

              <Field label="Observações">
                <Textarea
                  rows={3}
                  value={form.observacoes}
                  onChange={(e) => set("observacoes", e.target.value)}
                  placeholder="Outras observações..."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Valor (R$)">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor}
                    onChange={(e) => set("valor", e.target.value)}
                    placeholder="0,00"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border bg-surface/60 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSalvar}
            disabled={salvar.isPending || isLoading}
            className="gap-2"
          >
            {salvar.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar prontuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
