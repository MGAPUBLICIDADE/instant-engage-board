import { TrendingUp, MessageCircle, Clock, CheckCircle2, Timer, Target, ArrowUp, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Kpi {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  trendValue: string;
  Icon: LucideIcon;
  tone: "primary" | "info" | "warning" | "success";
}

const toneMap: Record<Kpi["tone"], { bg: string; text: string; bar: string }> = {
  primary: { bg: "bg-primary/12", text: "text-primary", bar: "bg-primary" },
  info: { bg: "bg-info/12", text: "text-info", bar: "bg-info" },
  warning: { bg: "bg-warning/12", text: "text-warning", bar: "bg-warning" },
  success: { bg: "bg-success/12", text: "text-success", bar: "bg-success" },
};

const data: Kpi[] = [
  { label: "Pacientes Hoje", value: "24", delta: "vs ontem", trend: "up", trendValue: "+18%", Icon: TrendingUp, tone: "primary" },
  { label: "Atendimentos em andamento", value: "9", delta: "5 não lidos", trend: "up", trendValue: "+12%", Icon: MessageCircle, tone: "info" },
  { label: "Aguardando retorno", value: "4", delta: "2 urgentes", trend: "down", trendValue: "-8%", Icon: Clock, tone: "warning" },
  { label: "Agendamentos confirmados", value: "7", delta: "Meta: 10", trend: "up", trendValue: "+25%", Icon: CheckCircle2, tone: "success" },
  { label: "Tempo Médio Resposta", value: "3m 42s", delta: "Primeiro contato", trend: "down", trendValue: "-22%", Icon: Timer, tone: "info" },
  { label: "Taxa de Agendamento", value: "29,1%", delta: "vs semana ant.", trend: "up", trendValue: "+4,3%", Icon: Target, tone: "success" },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {data.map((k, i) => {
        const t = toneMap[k.tone];
        const TrendIcon = k.trend === "up" ? ArrowUp : ArrowDown;
        const trendColor = k.trend === "up" ? "text-success" : "text-destructive";
        return (
          <div
            key={k.label}
            className="glass-panel card-lift group relative overflow-hidden rounded-2xl p-4 hover:border-border/80 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`absolute inset-x-0 top-0 h-[2px] ${t.bar} opacity-70`} />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </p>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight lg:text-[26px]">
                  {k.value}
                </p>
              </div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.bg} ${t.text} transition-transform group-hover:scale-110`}>
                <k.Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-0.5 rounded-md bg-surface-elevated px-1.5 py-0.5 text-[10px] font-bold ${trendColor}`}>
                <TrendIcon className="h-2.5 w-2.5" strokeWidth={3} />
                {k.trendValue}
              </span>
              <span className="truncate text-[10.5px] text-muted-foreground">{k.delta}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
