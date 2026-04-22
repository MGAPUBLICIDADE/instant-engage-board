import { useEffect, useState } from "react";
import { Bell, Calendar, Sparkles, X, Plus } from "lucide-react";

export function Header() {
  const [now, setNow] = useState<Date | null>(null);
  const [agendaOpen, setAgendaOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const i = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(i);
  }, []);

  const date =
    now?.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }) ?? "";
  const time = now?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "--:--";

  return (
    <>
      <header className="glass-panel sticky top-0 z-30 flex items-center justify-between gap-4 rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_var(--color-primary)]">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
            <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse-soft rounded-full bg-success ring-2 ring-background" />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-base font-bold tracking-tight">
              CONECTA <span className="text-primary">MGA</span>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Mídia Inteligente
            </p>
          </div>
        </div>

        <div
          className="hidden items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-4 py-1.5 text-sm text-muted-foreground md:flex"
          suppressHydrationWarning
        >
          <Calendar className="h-3.5 w-3.5 text-info" />
          <span className="capitalize" suppressHydrationWarning>{date || "Carregando..."}</span>
          <span className="mx-1 h-3 w-px bg-border" />
          <span className="font-medium text-foreground" suppressHydrationWarning>{time}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAgendaOpen(true)}
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium transition-all hover:border-primary/40 hover:bg-surface-elevated hover:shadow-[0_0_0_1px_var(--color-primary)]"
          >
            <Calendar className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Agenda</span>
          </button>

          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface transition-all hover:border-primary/40 hover:bg-surface-elevated">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
          </button>

          <div className="ml-1 flex items-center gap-3 rounded-xl border border-border bg-surface px-2 py-1.5 pr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-info to-primary text-xs font-bold text-background">
              AS
            </div>
            <div className="hidden leading-tight md:block">
              <p className="text-xs font-semibold">Ana Silva</p>
              <p className="text-[10px] text-muted-foreground">Atendente</p>
            </div>
          </div>
        </div>
      </header>

      {agendaOpen && <AgendaDialog onClose={() => setAgendaOpen(false)} />}
    </>
  );
}

function AgendaDialog({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const monthName = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const events = [
    { day: today.getDate(), title: "Consulta Mariana A. — Harmonização", time: "14:30", tone: "bg-primary/20 text-primary" },
    { day: today.getDate(), title: "Retorno Juliana C. — Dermato", time: "16:00", tone: "bg-success/20 text-success" },
    { day: today.getDate() + 1, title: "Avaliação Diego F. — Ortopedia", time: "10:00", tone: "bg-warning/20 text-warning" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Agenda</h2>
            <p className="text-xs capitalize text-muted-foreground">{monthName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Novo
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <div key={i} className="py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((d) => {
            const isToday = d === today.getDate();
            const hasEvent = events.some((e) => e.day === d);
            return (
              <div
                key={d}
                className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-lg text-xs transition-all hover:bg-surface-elevated ${
                  isToday
                    ? "bg-primary font-bold text-primary-foreground glow-ring"
                    : "text-foreground"
                }`}
              >
                {d}
                {hasEvent && !isToday && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Próximos atendimentos
          </p>
          <div className="space-y-2">
            {events.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${e.tone}`}>
                    {String(e.day).padStart(2, "0")}
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground">{e.time}</p>
                  </div>
                </div>
                <button className="text-[11px] font-semibold text-primary hover:underline">
                  Detalhes
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
