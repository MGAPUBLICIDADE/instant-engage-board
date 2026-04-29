import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, SlidersHorizontal } from "lucide-react";
import { DeliveryLayout } from "@/components/conectadelivery/DeliveryLayout";
import { configCards } from "@/lib/conectadelivery-data";

export const Route = createFileRoute("/conectadelivery-configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · ConectaDelivery" },
      { name: "description", content: "Configurações visuais do ConectaDelivery para loja, horários, entrega e pagamentos." },
      { property: "og:title", content: "Configurações · ConectaDelivery" },
      { property: "og:description", content: "Configure a operação premium de delivery por loja e canal de venda." },
    ],
  }),
  component: ConfiguracoesDeliveryPage,
});

function ConfiguracoesDeliveryPage() {
  return (
    <DeliveryLayout>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">Configurações</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">Central visual para preparar cada empresa, unidade e operação de delivery antes de vender.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-primary"><SlidersHorizontal className="h-4 w-4" /> Modo implantação</div>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {configCards.map(({ title, description, Icon, status }) => {
          const ready = status === "Pronto";
          return (
            <article key={title} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
                  <div><h2 className="font-display text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${ready ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                  {ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
                  {status}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl font-bold">Checklist de lançamento</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {["Cardápio revisado", "Taxas por bairro", "Pix configurado", "Equipe conectada"].map((item, index) => (
            <div key={item} className="rounded-xl border border-border bg-background/45 p-4">
              <div className={`mb-3 h-2 rounded-full ${index < 2 ? "bg-success" : "bg-warning"}`} />
              <p className="text-sm font-bold">{item}</p>
              <p className="mt-1 text-xs text-muted-foreground">{index < 2 ? "Conferido" : "Aguardando ajuste"}</p>
            </div>
          ))}
        </div>
      </section>
    </DeliveryLayout>
  );
}