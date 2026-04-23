import type { AgendaConfig } from "@/hooks/useAgendaConfig";
import type { BloqueioSemana } from "@/hooks/useBloqueioSemana";
import type { BloqueioData } from "@/hooks/useBloqueioDatas";
import type { Agendamento } from "@/hooks/useAgendamentos";

export interface Slot {
  hora: string; // "HH:MM"
  status: "livre" | "ocupado" | "bloqueado" | "almoco";
  agendamento?: Agendamento;
  motivo?: string;
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const overlap = (aIni: number, aFim: number, bIni: number, bFim: number) =>
  aIni < bFim && bIni < aFim;

/**
 * Gera os slots do dia para um médico considerando:
 * - configuração base (jornada, duração, intervalo, almoço)
 * - bloqueio_semana (recorrente)
 * - bloqueio_datas (específico)
 * - agendamentos do dia
 */
export function gerarSlots(params: {
  data: string; // YYYY-MM-DD
  config: AgendaConfig | null | undefined;
  bloqSemana: BloqueioSemana[];
  bloqData: BloqueioData[];
  agendamentos: Agendamento[];
}): Slot[] {
  const { data, config, bloqSemana, bloqData, agendamentos } = params;
  if (!config) return [];

  const dataObj = new Date(data + "T00:00:00");
  const diaSemana = dataObj.getDay();

  // Bloqueio de dia inteiro nessa data?
  const blocoDiaTodo = bloqData.find((b) => b.data === data && b.dia_inteiro);
  if (blocoDiaTodo) {
    return [{ hora: "—", status: "bloqueado", motivo: blocoDiaTodo.motivo ?? "Dia bloqueado" }];
  }

  const ini = toMin(config.hora_inicio);
  const fim = toMin(config.hora_fim);
  const passo = (config.duracao_consulta_min ?? 30) + (config.intervalo_min ?? 0);

  const almIni = config.almoco_inicio ? toMin(config.almoco_inicio) : null;
  const almFim = config.almoco_fim ? toMin(config.almoco_fim) : null;

  const blocosSemana = bloqSemana
    .filter((b) => b.ativo && b.dia_semana === diaSemana)
    .map((b) => ({
      ini: toMin(b.hora_inicio),
      fim: toMin(b.hora_fim),
      motivo: b.motivo ?? "Bloqueado",
    }));

  const blocosData = bloqData
    .filter((b) => b.data === data && !b.dia_inteiro && b.hora_inicio && b.hora_fim)
    .map((b) => ({
      ini: toMin(b.hora_inicio!),
      fim: toMin(b.hora_fim!),
      motivo: b.motivo ?? "Bloqueado",
    }));

  const slots: Slot[] = [];
  for (let t = ini; t + (config.duracao_consulta_min ?? 30) <= fim; t += passo) {
    const slotFim = t + (config.duracao_consulta_min ?? 30);
    const hora = toHHMM(t);

    if (almIni !== null && almFim !== null && overlap(t, slotFim, almIni, almFim)) {
      slots.push({ hora, status: "almoco", motivo: "Almoço" });
      continue;
    }

    const bloqueioSem = blocosSemana.find((b) => overlap(t, slotFim, b.ini, b.fim));
    if (bloqueioSem) {
      slots.push({ hora, status: "bloqueado", motivo: bloqueioSem.motivo });
      continue;
    }
    const bloqueioDt = blocosData.find((b) => overlap(t, slotFim, b.ini, b.fim));
    if (bloqueioDt) {
      slots.push({ hora, status: "bloqueado", motivo: bloqueioDt.motivo });
      continue;
    }

    const ag = agendamentos.find((a) => {
      if (a.status === "cancelado") return false;
      const aIni = toMin(a.hora);
      const aFim = aIni + (a.duracao_min ?? 30);
      return overlap(t, slotFim, aIni, aFim);
    });
    if (ag) {
      slots.push({ hora, status: "ocupado", agendamento: ag });
      continue;
    }

    slots.push({ hora, status: "livre" });
  }

  return slots;
}
