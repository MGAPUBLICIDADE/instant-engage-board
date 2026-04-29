import { createFileRoute } from "@tanstack/react-router";
import { Boxes, ChefHat, Flame, Plus, ShieldCheck } from "lucide-react";
import { DeliveryLayout } from "@/components/conectadelivery/DeliveryLayout";
import { menuHighlights } from "@/lib/conectadelivery-data";

export const Route = createFileRoute("/conectadelivery-cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio · ConectaDelivery" },
      { name: "description", content: "Cardápio visual premium do ConectaDelivery com burgers, adicionais, preços e margem." },
      { property: "og:title", content: "Cardápio · ConectaDelivery" },
      { property: "og:description", content: "Organize produtos premium, combos, adicionais e rentabilidade do delivery." },
    ],
  }),
  component: CardapioPage,
});

function CardapioPage() {
  return (
    <DeliveryLayout>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">Cardápio premium</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">Produtos de alto valor, combos inteligentes, adicionais e controle visual de margem.</p>
        </div>
        <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" /> Novo item</button>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {menuHighlights.map(({ name, tag, price, margin, Icon }) => (
          <article key={name} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex aspect-[5/3] items-center justify-center bg-surface-elevated">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary"><Icon className="h-10 w-10" /></div>
            </div>
            <div className="p-5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{tag}</span>
              <h2 className="mt-2 font-display text-xl font-bold">{name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-background/45 p-3"><p className="text-muted-foreground">Preço</p><p className="mt-1 font-bold text-primary">{price}</p></div>
                <div className="rounded-xl bg-background/45 p-3"><p className="text-muted-foreground">Margem</p><p className="mt-1 font-bold text-success">{margin}</p></div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { title: "Combos", value: "12 ativos", Icon: Boxes },
          { title: "Assinaturas", value: "4 burgers", Icon: ChefHat },
          { title: "Premium", value: "7 itens", Icon: ShieldCheck },
          { title: "Mais vendidos", value: "Top 10", Icon: Flame },
        ].map(({ title, value, Icon }) => (
          <div key={title} className="rounded-2xl border border-border bg-surface p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-sm text-muted-foreground">{title}</p><p className="mt-1 font-display text-2xl font-bold">{value}</p></div>
        ))}
      </section>
    </DeliveryLayout>
  );
}