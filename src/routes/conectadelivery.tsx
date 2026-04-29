import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Clock3, Flame, ReceiptText, ShoppingBag, Star, TrendingUp } from "lucide-react";
import { DeliveryLayout } from "@/components/conectadelivery/DeliveryLayout";
import { menuHighlights } from "@/lib/conectadelivery-data";
import burgerHero from "@/assets/conectadelivery-burger-hero.jpg";

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
        <div className="relative min-h-[390px] overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)] md:p-8">
          <img
            src={burgerHero}
            alt="Hambúrguer artesanal premium em cozinha de hamburgueria urbana"
            width={1536}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/78 to-background/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/95 to-transparent" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Flame className="h-3.5 w-3.5" /> Operação quente agora
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Hamburgueria premium pronta para receber pedidos online.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Página empresa do delivery: vitrine da marca, cardápio premium, combos e botão de pedido para o cliente comprar com facilidade.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/conectadelivery-cardapio" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110">
                Fazer pedido <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/conectadelivery-pedidos" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-5 py-3 text-sm font-semibold hover:border-primary/50">
                Painel da cozinha
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
            <h2 className="font-display text-xl font-bold">Cardápio para pedidos</h2>
            <span className="text-xs font-semibold text-muted-foreground">cliente · escolha · compra</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {menuHighlights.map(({ name, tag, price, Icon }) => (
              <div key={name} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-bold text-primary">{tag}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Blend premium, pão artesanal, molho da casa e finalização de hamburgueria de alto padrão.</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-primary">{price}</span>
                  <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-all hover:brightness-110">
                    <ShoppingBag className="h-3.5 w-3.5" /> Pedir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-bold">Experiência da loja</h2>
          <div className="mt-4 space-y-3">
            {[
              { title: "Avaliação premium", text: "4.9 estrelas em pedidos recentes", Icon: Star },
              { title: "Entrega rastreável", text: "Motoboy, retirada e previsão clara", Icon: Bike },
              { title: "Compra rápida", text: "Cliente escolhe, paga e acompanha", Icon: ReceiptText },
            ].map(({ title, text, Icon }) => (
              <div key={title} className="rounded-xl border border-border bg-background/45 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                  <div><p className="font-bold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DeliveryLayout>
  );
}