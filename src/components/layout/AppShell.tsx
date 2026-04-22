import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  Calendar,
  MessageSquare,
  Share2,
  Settings,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

const nav = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/agenda", label: "Agenda", Icon: Calendar },
  { to: "/atendimento", label: "Atendimento", Icon: MessageSquare },
  { to: "/redes-sociais", label: "Redes Sociais", Icon: Share2 },
  { to: "/configuracoes", label: "Configurações", Icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface/80 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_var(--color-primary)]">
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse-soft rounded-full bg-success ring-2 ring-surface" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-tight">
                CONECTA <span className="text-primary">MGA</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Mídia Inteligente
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-elevated"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map(({ to, label, Icon }) => {
            const active =
              to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_var(--color-primary)]"
                    : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    active ? "" : "text-primary"
                  }`}
                  strokeWidth={2.2}
                />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-2 py-1.5 pr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-info to-primary text-xs font-bold text-background">
              AS
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold">Ana Silva</p>
              <p className="text-[10px] text-muted-foreground">Atendente</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
