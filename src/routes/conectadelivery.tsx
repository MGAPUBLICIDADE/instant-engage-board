import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChefHat, ClipboardList, Settings2, ShoppingBag, Store } from "lucide-react";
import { DeliveryLayout } from "@/components/conectadelivery/DeliveryLayout";
import { liveOrders, menuHighlights } from "@/lib/conectadelivery-data";

export const Route = createFileRoute("/conectadelivery")({
  head: () => ({
    meta: [
      { title: "Home · ConectaDelivery" },
      {
        name: "description",
        content:
          "Home operacional do ConectaDelivery com acesso rápido à página empresa, pedidos, cardápio e configurações.",
      },
      { property: "og:title", content: "Home · ConectaDelivery" },
      {
        property: "og:description",
        content:
          "Resumo da operação delivery e atalhos para loja online, pedidos, cardápio e configurações.",
      },
    ],
  }),
  component: ConectaDeliveryHome,
});

const shortcuts = [
  {
    to: "/conectadelivery-empresa",
    title: "Página empresa",
    text: "Visual público onde clientes acessam produtos, preços e fazem pedidos.",
    Icon: Store,
  },
  {
    to: "/conectadelivery-pedidos",
    title: "Pedidos",
    text: "Kanban operacional da cozinha, balcão e entrega.",
    Icon: ShoppingBag,
  },
  {
    to: "/conectadelivery-cardapio",
    title: "Cardápio",
    text: "Cadastro visual dos produtos, combos e adicionais.",
    Icon: ChefHat,
  },
  {
    to: "/conectadelivery-configuracoes",
    title: "Configurações",
    text: "Horários, entrega, pagamentos e identidade da loja.",
    Icon: Settings2,
  },
] as const;

function ConectaDeliveryHome() {
  return (
    <DeliveryLayout>
      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)] md:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <ClipboardList className="h-3.5 w-3.5" /> Home da operação
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Controle do ConectaDelivery separado da página do cliente.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Use esta home para acessar as áreas internas. A vitrine de produtos e pedidos dos
            clientes fica em Página empresa.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {shortcuts.map(({ to, title, text, Icon }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-2xl border border-border bg-background/45 p-5 transition-all hover:border-primary/50 hover:bg-surface-elevated"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl font-bold">Resumo rápido</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { label: "Pedidos ativos", value: String(liveOrders.length) },
              { label: "Produtos em destaque", value: String(menuHighlights.length) },
              { label: "Ticket ilustrativo", value: "R$ 92" },
              { label: "Tempo médio", value: "28 min" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-background/45 p-4"
              >
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-display text-3xl font-bold text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DeliveryLayout>
  );
}
