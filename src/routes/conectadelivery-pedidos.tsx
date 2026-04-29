import { createFileRoute } from "@tanstack/react-router";
import { Bike, ChefHat, Clock3, PackageCheck, ReceiptText } from "lucide-react";
import { DeliveryLayout } from "@/components/conectadelivery/DeliveryLayout";
import { liveOrders } from "@/lib/conectadelivery-data";

export const Route = createFileRoute("/conectadelivery-pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos · ConectaDelivery" },
      { name: "description", content: "Tela visual de pedidos do ConectaDelivery para acompanhar a operação de uma hamburgueria premium." },
      { property: "og:title", content: "Pedidos · ConectaDelivery" },
      { property: "og:description", content: "Acompanhe pedidos, preparo, entrega, valores e prioridades em tempo real." },
    ],
  }),
  component: PedidosPage,
});

const columns = [
  { title: "Novo", Icon: ReceiptText, tone: "text-info" },
  { title: "Em preparo", Icon: ChefHat, tone: "text-primary" },
  { title: "Saiu para entrega", Icon: Bike, tone: "text-warning" },
  { title: "Finalizado", Icon: PackageCheck, tone: "text-success" },
];

function PedidosPage() {
  return (
    <DeliveryLayout>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">Pedidos</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">Operação visual para cozinha, balcão e entrega acompanharem cada pedido sem perder ritmo.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-primary">R$ 8.742,30 vendidos hoje</div>
      </div>

      <section className="mt-6 grid gap-4 xl:grid-cols-4">
        {columns.map(({ title, Icon, tone }, index) => (
          <div key={title} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${tone}`} /><h2 className="text-sm font-bold">{title}</h2></div>
              <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-bold">{index === 0 ? 6 : index === 1 ? 9 : index === 2 ? 4 : 28}</span>
            </div>
            <div className="mt-4 space-y-3">
              {liveOrders.filter((_, itemIndex) => itemIndex % 4 === index || itemIndex === index).slice(0, 3).map((order) => (
                <article key={`${title}-${order.id}`} className={`rounded-xl border bg-background/45 p-4 ${order.priority ? "border-primary/45 glow-hot" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-2"><p className="font-bold">{order.id}</p><span className="text-xs font-bold text-primary">{order.value}</span></div>
                  <p className="mt-2 text-sm font-semibold">{order.client}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{order.items}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {order.eta}</span><span>{order.stage}</span></div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </DeliveryLayout>
  );
}