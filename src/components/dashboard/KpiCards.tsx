import { TrendingUp, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Kpi {
  label: string;
  value: number;
  delta: string;
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
  { label: "Leads Hoje", value: 24, delta: "+18% vs ontem", Icon: TrendingUp, tone: "primary" },
  { label: "Conversas Ativas", value: 9, delta: "5 não lidas", Icon: MessageCircle, tone: "info" },
  { label: "Aguardando Resposta", value: 4, delta: "2 urgentes", Icon: Clock, tone: "warning" },
  { label: "Convertidos", value: 7, delta: "Meta: 10", Icon: CheckCircle2, tone: "success" },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {data.map((k, i) => {
        const t = toneMap[k.tone];
        return (
          <div
            key={k.label}
            className="glass-panel group relative overflow-hidden rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:border-border/80"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`absolute inset-x-0 top-0 h-[2px] ${t.bar} opacity-70`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </p>
                <p className="mt-2 font-display text-3xl font-bold tracking-tight">
                  {k.value}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.bg} ${t.text}`}>
                <k.Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
            </div>
            <p className={`mt-3 text-xs font-medium ${t.text}`}>{k.delta}</p>
          </div>
        );
      })}
    </div>
  );
}
