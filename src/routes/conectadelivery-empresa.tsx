import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock3,
  Flame,
  Heart,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Star,
  Timer,
} from "lucide-react";
import { DeliveryLayout } from "@/components/conectadelivery/DeliveryLayout";
import { menuHighlights } from "@/lib/conectadelivery-data";
import burgerHero from "@/assets/conectadelivery-burger-hero.jpg";

const featuredProducts = [
  {
    name: "Black Angus Royale",
    tag: "Destaque da casa",
    description: "Blend 180g, cheddar inglês, bacon caramelizado, cebola crispy e molho defumado.",
    price: "R$ 74,90",
    oldPrice: "R$ 84,90",
    score: "4.9",
  },
  {
    name: "Truffle Smash Duplo",
    tag: "Mais pedido",
    description:
      "Dois smash burgers, queijo prato, maionese trufada, picles artesanal e pão brioche.",
    price: "R$ 68,40",
    oldPrice: "R$ 76,00",
    score: "4.8",
  },
  {
    name: "Combo Família Premium",
    tag: "Combo",
    description:
      "4 burgers assinatura, 2 batatas grandes, 4 bebidas e brownie artesanal para dividir.",
    price: "R$ 219,90",
    oldPrice: "R$ 252,00",
    score: "5.0",
  },
];

const productGrid = [
  { name: "Wagyu House", category: "Premium", price: "R$ 96,90", add: "+ cheddar maturado" },
  { name: "Classic Smash", category: "Clássicos", price: "R$ 42,90", add: "+ batata pequena" },
  { name: "Loaded Fries", category: "Acompanhamento", price: "R$ 32,90", add: "+ bacon crocante" },
  { name: "Onion Rings", category: "Acompanhamento", price: "R$ 28,90", add: "+ molho barbecue" },
  { name: "Milkshake Vanilla", category: "Bebidas", price: "R$ 26,90", add: "+ calda extra" },
  { name: "Brownie da Casa", category: "Sobremesa", price: "R$ 24,90", add: "+ sorvete artesanal" },
];

export const Route = createFileRoute("/conectadelivery-empresa")({
  head: () => ({
    meta: [
      { title: "Página Empresa · ConectaDelivery" },
      {
        name: "description",
        content:
          "Página da empresa no ConectaDelivery para clientes verem produtos, preços e fazerem pedidos online.",
      },
      { property: "og:title", content: "Página Empresa · ConectaDelivery" },
      {
        property: "og:description",
        content:
          "Cliente acessa a empresa, escolhe produtos, confere preços e monta o pedido online.",
      },
    ],
  }),
  component: DeliveryEmpresaPage,
});

function DeliveryEmpresaPage() {
  return (
    <DeliveryLayout publicStorefront>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)] md:p-8">
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
              <Flame className="h-3.5 w-3.5" /> Aberto para pedidos
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Página empresa para o cliente escolher e pedir agora.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Produtos em destaque, preços claros, combos, adicionais e uma experiência visual de
              compra pensada para vender mais no delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#produtos"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
              >
                Fazer pedido <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {["Entrega 25-35 min", "Pix e cartão", "Retirada disponível"].map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/55 px-3 py-2 text-xs font-bold backdrop-blur"
                >
                  <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Seu pedido
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">Sacola ilustrativa</h2>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              3 itens
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { item: "Black Angus Royale", qty: 1, price: "R$ 74,90" },
              { item: "Truffle Smash Duplo", qty: 2, price: "R$ 136,80" },
              { item: "Loaded Fries", qty: 1, price: "R$ 32,90" },
            ].map(({ item, qty, price }) => (
              <div
                key={item}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/45 p-3"
              >
                <div>
                  <p className="text-sm font-bold">{item}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Quantidade: {qty}</p>
                </div>
                <p className="text-sm font-bold text-primary">{price}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>R$ 244,60</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Entrega</span>
              <span>R$ 8,90</span>
            </div>
            <div className="flex justify-between font-display text-2xl font-bold">
              <span>Total</span>
              <span className="text-primary">R$ 253,50</span>
            </div>
          </div>
          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110">
            Finalizar pedido <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section id="produtos" className="mt-8">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Produtos em destaque
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Vitrine principal com preço, avaliação e botão de pedido para o cliente.
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["Todos", "Burgers", "Combos", "Acompanhamentos", "Bebidas"].map((category, index) => (
              <button
                key={category}
                className={`min-w-fit rounded-full border px-4 py-2 text-xs font-bold ${index === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <article
              key={product.name}
              className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
                <img
                  src={burgerHero}
                  alt={`Produto ${product.name} do cardápio ConectaDelivery`}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {product.tag}
                </div>
                <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur">
                  <Heart className="h-4 w-4 text-primary" />
                </button>
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1 text-xs font-bold backdrop-blur">
                  <Star className="h-3.5 w-3.5 text-warning" /> {product.score}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-bold">{product.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground line-through">{product.oldPrice}</p>
                    <p className="font-display text-3xl font-bold text-primary">{product.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/45">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">1</span>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110">
                  <ShoppingBag className="h-4 w-4" /> Adicionar ao pedido
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <div>
          <h2 className="font-display text-2xl font-bold">Mais opções do cardápio</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {productGrid.map((product) => (
              <article
                key={product.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.category} · {product.add}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{product.price}</p>
                  <button className="mt-2 inline-flex items-center gap-1 rounded-lg border border-border bg-background/45 px-3 py-1.5 text-xs font-bold">
                    <Plus className="h-3.5 w-3.5" /> Pedir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-2xl font-bold">Experiência de compra</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                title: "Pedido rápido",
                text: "Cliente escolhe produto, quantidade e finaliza sem confusão.",
                Icon: ReceiptText,
              },
              {
                title: "Entrega acompanhada",
                text: "Tempo estimado, retirada e motoboy visíveis para o cliente.",
                Icon: Bike,
              },
              {
                title: "Produtos valorizados",
                text: "Destaques, combos e avaliações aumentam desejo de compra.",
                Icon: Star,
              },
              {
                title: "Preparo transparente",
                text: "Status claro do pedido até sair para entrega.",
                Icon: Timer,
              },
            ].map(({ title, text, Icon }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/45 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DeliveryLayout>
  );
}
