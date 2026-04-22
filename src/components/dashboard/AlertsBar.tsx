import { Sparkles, Clock, Zap, ArrowRight } from "lucide-react";

interface Alert {
  Icon: typeof Zap;
  tone: string;
  iconTone: string;
  text: string;
  sub: string;
  leadId: string;
  pulse?: boolean;
}

const alerts: Alert[] = [
  {
    Icon: Zap,
    tone: "border-primary/40 bg-primary/10 hover:bg-primary/15",
    iconTone: "text-primary",
    text: "Novo lead chegou",
    sub: "Mariana Albuquerque · WhatsApp",
    leadId: "l1",
  },
  {
    Icon: Clock,
    tone: "border-destructive/50 bg-destructive/10 hover:bg-destructive/20",
    iconTone: "text-destructive",
    text: "Cliente aguardando há 48 min",
    sub: "Diego Ferraz · Responder agora",
    leadId: "l6",
    pulse: true,
  },
  {
    Icon: Sparkles,
    tone: "border-info/40 bg-info/10 hover:bg-info/15",
    iconTone: "text-info",
    text: "3 leads prontos para fechar",
    sub: "Verifique 'Em Atendimento'",
    leadId: "l3",
  },
];

interface Props {
  onSelect: (id: string) => void;
}

export function AlertsBar({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      {alerts.map((a, i) => (
        <button
          key={i}
          onClick={() => onSelect(a.leadId)}
          className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all card-lift animate-fade-up ${a.tone} ${a.pulse ? "animate-pulse-soft" : ""}`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/40 ${a.iconTone}`}>
            <a.Icon className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className={`truncate text-xs font-semibold ${a.iconTone}`}>{a.text}</p>
            <p className="truncate text-[10.5px] text-muted-foreground">{a.sub}</p>
          </div>
          <span className={`hidden items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${a.iconTone} bg-background/40 transition-all group-hover:flex`}>
            Responder
            <ArrowRight className="h-3 w-3" strokeWidth={3} />
          </span>
        </button>
      ))}
    </div>
  );
}
