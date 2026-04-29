import { Link, useLocation } from "@tanstack/react-router";
import { Flame, RadioTower } from "lucide-react";
import { deliveryNav } from "@/lib/conectadelivery-data";

export function DeliveryLayout({
  children,
  publicStorefront = false,
}: {
  children: React.ReactNode;
  publicStorefront?: boolean;
}) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="border-b border-border bg-surface/70 px-4 py-4 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3 pl-10 lg:pl-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_12px_30px_-12px_var(--color-primary)]">
              <Flame className="h-6 w-6" strokeWidth={2.6} />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none tracking-tight">ConectaDelivery</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hamburgueria premium</p>
            </div>
          </div>

          {!publicStorefront && (
            <nav className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
              {deliveryNav.map(({ to, label, Icon }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex min-w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_28px_-16px_var(--color-primary)]"
                        : "border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-success xl:flex">
            <RadioTower className="h-4 w-4" />
            Loja online ativa
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}