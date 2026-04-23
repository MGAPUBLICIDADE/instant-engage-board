import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarCog,
  Loader2,
  Plus,
  Trash2,
  Stethoscope,
  CalendarX,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMedicos } from "@/hooks/useMedicos";
import {
  useAgendaConfig,
  useSalvarAgendaConfig,
  type AgendaConfigInput,
} from "@/hooks/useAgendaConfig";
import {
  useBloqueioDatas,
  useSalvarBloqueioData,
  useExcluirBloqueioData,
} from "@/hooks/useBloqueioDatas";
import {
  useBloqueioSemana,
  useSalvarBloqueioSemana,
  useExcluirBloqueioSemana,
  DIAS_SEMANA,
} from "@/hooks/useBloqueioSemana";

export const Route = createFileRoute("/configuracoes-agenda")({
  component: AgendaConfigPage,
  head: () => ({
    meta: [
      { title: "Configuração de agenda · Conecta MGA" },
      {
        name: "description",
        content: "Defina horários, intervalos e bloqueios da agenda por médico.",
      },
    ],
  }),
});

const DEFAULT_CONFIG: AgendaConfigInput = {
  medico_id: "",
  hora_inicio: "08:00",
  hora_fim: "18:00",
  duracao_consulta_min: 30,
  intervalo_min: 0,
  almoco_inicio: "12:00",
  almoco_fim: "13:00",
};

function AgendaConfigPage() {
  const { data: medicos = [], isLoading: loadingMedicos } = useMedicos();
  const medicosAtivos = useMemo(() => medicos.filter((m) => m.ativo), [medicos]);

  const [medicoId, setMedicoId] = useState<string>("");

  useEffect(() => {
    if (!medicoId && medicosAtivos.length > 0) {
      setMedicoId(medicosAtivos[0].id);
    }
  }, [medicoId, medicosAtivos]);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[900px]">
        <header className="mb-6 flex items-center gap-3">
          <Link
            to="/configuracoes"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-elevated"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarCog className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Configuração de agenda
            </h1>
            <p className="text-sm text-muted-foreground">
              Horários, almoço e bloqueios por médico.
            </p>
          </div>
        </header>

        {loadingMedicos ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando médicos...
          </div>
        ) : medicosAtivos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Nenhum médico ativo</p>
            <p className="text-xs text-muted-foreground">
              Cadastre um médico antes de configurar a agenda.
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
            <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
              <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Médico
              </Label>
              <Select value={medicoId} onValueChange={setMedicoId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {medicosAtivos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome} {m.especialidade ? `· ${m.especialidade}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {medicoId && (
              <div className="space-y-6">
                <ConfigBaseSection medicoId={medicoId} />
                <BloqueioSemanaSection medicoId={medicoId} />
                <BloqueioDataSection medicoId={medicoId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Horário base
 * ============================================================ */
function ConfigBaseSection({ medicoId }: { medicoId: string }) {
  const { data: config, isLoading } = useAgendaConfig(medicoId);
  const salvar = useSalvarAgendaConfig();
  const [form, setForm] = useState<AgendaConfigInput>(DEFAULT_CONFIG);
  const [usaAlmoco, setUsaAlmoco] = useState(true);

  useEffect(() => {
    if (config) {
      setForm({
        medico_id: medicoId,
        hora_inicio: config.hora_inicio?.slice(0, 5) ?? "08:00",
        hora_fim: config.hora_fim?.slice(0, 5) ?? "18:00",
        duracao_consulta_min: config.duracao_consulta_min ?? 30,
        intervalo_min: config.intervalo_min ?? 0,
        almoco_inicio: config.almoco_inicio?.slice(0, 5) ?? null,
        almoco_fim: config.almoco_fim?.slice(0, 5) ?? null,
      });
      setUsaAlmoco(!!config.almoco_inicio && !!config.almoco_fim);
    } else {
      setForm({ ...DEFAULT_CONFIG, medico_id: medicoId });
      setUsaAlmoco(true);
    }
  }, [config, medicoId]);

  function handleSalvar() {
    if (form.hora_inicio >= form.hora_fim) {
      toast.error("Hora final deve ser maior que hora inicial");
      return;
    }
    salvar.mutate(
      {
        ...form,
        id: config?.id,
        almoco_inicio: usaAlmoco ? form.almoco_inicio : null,
        almoco_fim: usaAlmoco ? form.almoco_fim : null,
      },
      {
        onSuccess: () => toast.success("Horário salvo"),
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
      },
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <header className="mb-4 flex items-center gap-2">
        <CalendarCog className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold">Horário de atendimento</h2>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Início</Label>
              <Input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Fim</Label>
              <Input
                type="time"
                value={form.hora_fim}
                onChange={(e) => setForm({ ...form, hora_fim: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Duração da consulta (min)</Label>
              <Input
                type="number"
                min={5}
                step={5}
                value={form.duracao_consulta_min}
                onChange={(e) =>
                  setForm({ ...form, duracao_consulta_min: Number(e.target.value) || 30 })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Intervalo entre consultas (min)</Label>
              <Input
                type="number"
                min={0}
                step={5}
                value={form.intervalo_min}
                onChange={(e) =>
                  setForm({ ...form, intervalo_min: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Pausa para almoço</Label>
              <Switch checked={usaAlmoco} onCheckedChange={setUsaAlmoco} />
            </div>
            {usaAlmoco && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Início</Label>
                  <Input
                    type="time"
                    value={form.almoco_inicio ?? "12:00"}
                    onChange={(e) => setForm({ ...form, almoco_inicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Fim</Label>
                  <Input
                    type="time"
                    value={form.almoco_fim ?? "13:00"}
                    onChange={(e) => setForm({ ...form, almoco_fim: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSalvar} disabled={salvar.isPending} className="w-full">
            {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar horário
          </Button>
        </div>
      )}
    </section>
  );
}

/* ============================================================
 * Bloqueios por dia da semana
 * ============================================================ */
function BloqueioSemanaSection({ medicoId }: { medicoId: string }) {
  const { data: bloqueios = [], isLoading } = useBloqueioSemana(medicoId);
  const salvar = useSalvarBloqueioSemana();
  const excluir = useExcluirBloqueioSemana();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    dias: number[];
    hora_inicio: string;
    hora_fim: string;
    motivo: string;
  }>({
    dias: [1],
    hora_inicio: "12:00",
    hora_fim: "13:00",
    motivo: "",
  });

  function toggleDia(i: number) {
    setForm((f) => ({
      ...f,
      dias: f.dias.includes(i) ? f.dias.filter((d) => d !== i) : [...f.dias, i].sort(),
    }));
  }

  async function handleAdd() {
    if (form.dias.length === 0) {
      toast.error("Selecione ao menos um dia");
      return;
    }
    if (form.hora_inicio >= form.hora_fim) {
      toast.error("Hora final deve ser maior que hora inicial");
      return;
    }
    try {
      for (const dia of form.dias) {
        await salvar.mutateAsync({
          medico_id: medicoId,
          dia_semana: dia,
          hora_inicio: form.hora_inicio,
          hora_fim: form.hora_fim,
          motivo: form.motivo || null,
          ativo: true,
        });
      }
      toast.success(
        form.dias.length > 1
          ? `${form.dias.length} bloqueios adicionados`
          : "Bloqueio adicionado",
      );
      setOpen(false);
      setForm({ dias: [1], hora_inicio: "12:00", hora_fim: "13:00", motivo: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">Bloqueio por dia da semana</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
        </Button>
      </header>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : bloqueios.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sem bloqueios recorrentes.</p>
      ) : (
        <ul className="space-y-2">
          {bloqueios.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3 py-2"
            >
              <div className="text-sm">
                <span className="font-semibold">{DIAS_SEMANA[b.dia_semana]}</span>
                <span className="ml-2 text-muted-foreground">
                  {b.hora_inicio?.slice(0, 5)} - {b.hora_fim?.slice(0, 5)}
                </span>
                {b.motivo && (
                  <span className="ml-2 text-xs text-muted-foreground">· {b.motivo}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={b.ativo}
                  onCheckedChange={(v) =>
                    salvar.mutate({
                      id: b.id,
                      medico_id: medicoId,
                      dia_semana: b.dia_semana,
                      hora_inicio: b.hora_inicio,
                      hora_fim: b.hora_fim,
                      motivo: b.motivo,
                      ativo: v,
                    })
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => excluir.mutate({ id: b.id, medico_id: medicoId })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo bloqueio recorrente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="mb-2 block text-xs">Dias da semana</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DIAS_SEMANA.map((d, i) => {
                  const selected = form.dias.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDia(i)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface-elevated hover:bg-surface"
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Toque para selecionar um ou mais dias.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Início</Label>
                <Input
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Fim</Label>
                <Input
                  type="time"
                  value={form.hora_fim}
                  onChange={(e) => setForm({ ...form, hora_fim: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Motivo (opcional)</Label>
              <Input
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                placeholder="Almoço, reunião..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={salvar.isPending}>
              {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ============================================================
 * Bloqueios por data
 * ============================================================ */
function BloqueioDataSection({ medicoId }: { medicoId: string }) {
  const { data: bloqueios = [], isLoading } = useBloqueioDatas(medicoId);
  const salvar = useSalvarBloqueioData();
  const excluir = useExcluirBloqueioData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    dia_inteiro: true,
    hora_inicio: "08:00",
    hora_fim: "18:00",
    motivo: "",
  });

  function handleAdd() {
    salvar.mutate(
      {
        medico_id: medicoId,
        data: form.data,
        dia_inteiro: form.dia_inteiro,
        hora_inicio: form.dia_inteiro ? null : form.hora_inicio,
        hora_fim: form.dia_inteiro ? null : form.hora_fim,
        motivo: form.motivo || null,
      },
      {
        onSuccess: () => {
          toast.success("Bloqueio adicionado");
          setOpen(false);
        },
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
      },
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarX className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">Bloqueio por data</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
        </Button>
      </header>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : bloqueios.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sem datas bloqueadas.</p>
      ) : (
        <ul className="space-y-2">
          {bloqueios.map((b) => {
            const d = new Date(b.data + "T00:00:00");
            return (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3 py-2"
              >
                <div className="text-sm">
                  <span className="font-semibold">
                    {d.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {b.dia_inteiro
                      ? "Dia inteiro"
                      : `${b.hora_inicio?.slice(0, 5)} - ${b.hora_fim?.slice(0, 5)}`}
                  </span>
                  {b.motivo && (
                    <span className="ml-2 text-xs text-muted-foreground">· {b.motivo}</span>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => excluir.mutate({ id: b.id, medico_id: medicoId })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear data</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Data</Label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label className="text-sm">Dia inteiro</Label>
              <Switch
                checked={form.dia_inteiro}
                onCheckedChange={(v) => setForm({ ...form, dia_inteiro: v })}
              />
            </div>
            {!form.dia_inteiro && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Início</Label>
                  <Input
                    type="time"
                    value={form.hora_inicio}
                    onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Fim</Label>
                  <Input
                    type="time"
                    value={form.hora_fim}
                    onChange={(e) => setForm({ ...form, hora_fim: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs">Motivo (opcional)</Label>
              <Input
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                placeholder="Feriado, viagem..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={salvar.isPending}>
              {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
