import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Clock3, Flame, ReceiptText, TrendingUp } from "lucide-react";
import { DeliveryLayout } from "@/components/conectadelivery/DeliveryLayout";
import { liveOrders, menuHighlights, orderFlow } from "@/lib/conectadelivery-data";

export const Route = createFileRoute("/conectadelivery")({
  head: () => ({
    meta: [
      { title: "ConectaDelivery · Gestão premium para hamburguerias" },
      { name: "description", content: "Painel visual do ConectaDelivery para pedidos, atendimento, cardápio e operação de hamburguerias premium." },
      { property: "og:title", content: "ConectaDelivery · Gestão premium para hamburguerias" },
      { property: "og:description", content: "Controle atendimento, pedidos e cardápio de uma operação delivery de alto padrão." },
    ],
  }),
  component: ConectaDeliveryHome,
});

function ConectaDeliveryHome() {
  return (
    <DeliveryLayout>
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)] md:p-8">
          <div className="absolute right-0 top-0 h-52 w-52 bg-primary/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Flame className="h-3.5 w-3.5" /> Operação quente agora
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Delivery de alto padrão com atendimento que vende mais.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Visão executiva da hamburgueria: conversas, pedidos, cozinha, entrega, ticket médio e itens premium em um só painel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/conectadelivery-pedidos" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110">
                Abrir pedidos <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/conectadelivery-configuracoes" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-5 py-3 text-sm font-semibold hover:border-primary/50">
                Configurar loja
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {[
            { label: "Pedidos hoje", value: "147", Icon: ReceiptText, tone: "text-primary" },
            { label: "Ticket médio", value: "R$ 92", Icon: TrendingUp, tone: "text-success" },
            { label: "Tempo médio", value: "28 min", Icon: Clock3, tone: "text-warning" },
            { label: "Entregas ativas", value: "14", Icon: Bike, tone: "text-info" },
          ].map(({ label, value, Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface p-5">
              <Icon className={`h-5 w-5 ${tone}`} />
              <p className="mt-4 text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Kanban de atendimento</h2>
            <span className="text-xs font-semibold text-muted-foreground">pré-pedido</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {orderFlow.map(({ title, Icon, count, tone, items }) => (
              <div key={title} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${tone}`} /><p className="text-sm font-bold">{title}</p></div>
                  <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-bold">{count}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.name} className="rounded-xl border border-border bg-background/45 p-3">
                      <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{item.name}</p><span className="text-[11px] text-muted-foreground">{item.time}</span></div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-bold">Pedidos em destaque</h2>
          <div className="mt-4 space-y-3">
            {liveOrders.slice(0, 3).map((order) => (
              <div key={order.id} className={`rounded-xl border bg-background/45 p-4 ${order.priority ? "border-primary/45" : "border-border"}`}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{order.id} · {order.client}</p><p className="mt-1 text-sm text-muted-foreground">{order.items}</p></div><span className="text-sm font-bold text-primary">{order.value}</span></div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{order.stage}</span><span>{order.eta}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {menuHighlights.map(({ name, tag, price, margin, Icon }) => (
          <div key={name} className="rounded-2xl border border-border bg-surface p-5">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{tag}</p>
            <h3 className="mt-1 font-display text-lg font-bold">{name}</h3>
            <div className="mt-4 flex items-center justify-between"><span className="font-bold text-primary">{price}</span><span className="text-xs text-success">margem {margin}</span></div>
          </div>
        ))}
      </section>
    </DeliveryLayout>
  );
}