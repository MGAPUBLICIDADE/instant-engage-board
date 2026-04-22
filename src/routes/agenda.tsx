import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Plus, Clock } from "lucide-react";

export const Route = createFileRoute("/agenda")({
  component: AgendaPage,
  head: () => ({
    meta: [
      { title: "Agenda · Conecta MGA" },
      {
        name: "description",
        content: "Visualize e organize os próximos atendimentos da sua clínica.",
      },
    ],
  }),
});

const today = new Date();
const monthName = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

const events = [
  { day: today.getDate(), title: "Mariana A. — Harmonização facial", time: "14:30", tone: "bg-primary/20 text-primary" },
  { day: today.getDate(), title: "Juliana C. — Avaliação dermatológica", time: "16:00", tone: "bg-success/20 text-success" },
  { day: today.getDate() + 1, title: "Diego F. — Avaliação ortopédica", time: "10:00", tone: "bg-warning/20 text-warning" },
  { day: today.getDate() + 2, title: "Patrícia L. — Retorno botox", time: "09:30", tone: "bg-info/20 text-info" },
];

function AgendaPage() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Agenda</h1>
            <p className="text-xs capitalize text-muted-foreground">{monthName}</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:brightness-110">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Novo agendamento
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
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
                    className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-lg text-sm transition-all hover:bg-surface-elevated ${
                      isToday ? "bg-primary font-bold text-primary-foreground glow-ring" : "text-foreground"
                    }`}
                  >
                    {d}
                    {hasEvent && !isToday && (
                      <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Próximos atendimentos
            </p>
            <div className="space-y-2">
              {events.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 card-lift"
                >
                  <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${e.tone}`}>
                    {String(e.day).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-semibold">{e.title}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {e.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
