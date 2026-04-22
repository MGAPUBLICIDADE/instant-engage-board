import { useEffect, useState } from "react";
import { Bell, Calendar, Sparkles } from "lucide-react";

export function Header() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(i);
  }, []);

  const date = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
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

      <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-4 py-1.5 text-sm text-muted-foreground md:flex">
        <Calendar className="h-3.5 w-3.5 text-info" />
        <span className="capitalize">{date}</span>
        <span className="mx-1 h-3 w-px bg-border" />
        <span className="font-medium text-foreground">{time}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="group inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium transition-all hover:border-primary/40 hover:bg-surface-elevated">
          <Calendar className="h-4 w-4 text-primary" />
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
  );
}
