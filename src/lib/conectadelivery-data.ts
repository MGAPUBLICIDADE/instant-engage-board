import type { LucideIcon } from "lucide-react";
import {
  Bike,
  Boxes,
  CheckCircle2,
  ChefHat,
  Clock3,
  CreditCard,
  Flame,
  MessageSquare,
  PackageCheck,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";

export type DeliveryNavItem = {
  to:
    | "/conectadelivery"
    | "/conectadelivery-empresa"
    | "/conectadelivery-pedidos"
    | "/conectadelivery-cardapio"
    | "/conectadelivery-configuracoes";
  label: string;
  Icon: LucideIcon;
};

export const deliveryNav: DeliveryNavItem[] = [
  { to: "/conectadelivery", label: "Home", Icon: Store },
  { to: "/conectadelivery-empresa", label: "Página empresa", Icon: Flame },
  { to: "/conectadelivery-pedidos", label: "Pedidos", Icon: ShoppingBag },
  { to: "/conectadelivery-cardapio", label: "Cardápio", Icon: Utensils },
  { to: "/conectadelivery-configuracoes", label: "Configurações", Icon: Settings2 },
];

export const orderFlow = [
  {
    title: "Pedidos recebidos",
    Icon: MessageSquare,
    count: 8,
    tone: "text-info",
    items: [
      { name: "Pedido #8432", detail: "2x Angus Royale + batata trufada", time: "2 min" },
      { name: "Pedido #8431", detail: "Combo premium para 4 pessoas", time: "5 min" },
    ],
  },
  {
    title: "Itens em preparo",
    Icon: Sparkles,
    count: 5,
    tone: "text-primary",
    items: [
      { name: "Pedido #8430", detail: "Ponto da carne + cheddar extra", time: "9 min" },
      { name: "Pedido #8429", detail: "Evento corporativo com 18 burgers", time: "13 min" },
    ],
  },
  {
    title: "Aguardando pagamento",
    Icon: PackageCheck,
    count: 11,
    tone: "text-warning",
    items: [
      { name: "Pedido #8428", detail: "Aguardando Pix para iniciar cozinha", time: "agora" },
      { name: "Pedido #8427", detail: "Adicionar brownie artesanal", time: "7 min" },
    ],
  },
  {
    title: "Liberado para entrega",
    Icon: CheckCircle2,
    count: 19,
    tone: "text-success",
    items: [
      { name: "Pedido #8426", detail: "Pagamento aprovado · enviar para chapa", time: "12 min" },
      { name: "Pedido #8425", detail: "Retirada premium no balcão", time: "18 min" },
    ],
  },
];

export const liveOrders = [
  {
    id: "#8427",
    client: "Henrique A.",
    items: "2x Black Angus Royale",
    stage: "Em preparo",
    eta: "18 min",
    value: "R$ 148,80",
    priority: true,
  },
  {
    id: "#8426",
    client: "Laura M.",
    items: "1x Truffle Smash + Fries",
    stage: "Saiu para entrega",
    eta: "9 min",
    value: "R$ 86,40",
    priority: false,
  },
  {
    id: "#8425",
    client: "Bruno e equipe",
    items: "Combo executivo premium",
    stage: "Novo",
    eta: "32 min",
    value: "R$ 312,00",
    priority: true,
  },
  {
    id: "#8424",
    client: "Patrícia S.",
    items: "1x Wagyu House + Shake",
    stage: "Finalizado",
    eta: "Entregue",
    value: "R$ 119,90",
    priority: false,
  },
];

export const menuHighlights = [
  {
    name: "Black Angus Royale",
    tag: "Mais vendido",
    price: "R$ 74,90",
    margin: "38%",
    Icon: Flame,
  },
  { name: "Truffle Smash", tag: "Assinatura", price: "R$ 68,40", margin: "41%", Icon: ChefHat },
  { name: "Wagyu House", tag: "Premium", price: "R$ 96,90", margin: "35%", Icon: ShieldCheck },
  { name: "Loaded Fries", tag: "Adicional", price: "R$ 32,90", margin: "52%", Icon: Boxes },
];

export const configCards = [
  {
    title: "Loja",
    description: "Nome, unidade, identidade e canais ativos",
    Icon: Store,
    status: "Pronto",
  },
  {
    title: "Horários",
    description: "Turnos, pausa da cozinha e retirada",
    Icon: Clock3,
    status: "Ajustar",
  },
  { title: "Entrega", description: "Áreas, taxas, raios e motoboys", Icon: Bike, status: "Pronto" },
  {
    title: "Pagamentos",
    description: "Pix, cartão, dinheiro e conciliação",
    Icon: CreditCard,
    status: "Pendente",
  },
];
