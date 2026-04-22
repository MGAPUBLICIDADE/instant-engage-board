import { Sparkles, Clock, Zap } from "lucide-react";

const alerts = [
  { Icon: Zap, tone: "text-primary border-primary/30 bg-primary/10", text: "Novo lead chegou", sub: "Mariana Albuquerque · WhatsApp" },
  { Icon: Clock, tone: "text-destructive border-destructive/30 bg-destructive/10", text: "Cliente aguardando há 48 min", sub: "Diego Ferraz · Responder agora" },
  { Icon: Sparkles, tone: "text-info border-info/30 bg-info/10", text: "3 leads prontos para fechar", sub: "Verifique a coluna Em Atendimento" },
];

export function AlertsBar() {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${a.tone} animate-fade-up`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/40">
            <a.Icon className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold">{a.text}</p>
            <p className="truncate text-[10.5px] opacity-80">{a.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
