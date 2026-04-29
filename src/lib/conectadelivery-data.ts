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
    | "/conectadelivery-pedidos"
    | "/conectadelivery-cardapio"
    | "/conectadelivery-configuracoes";
  label: string;
  Icon: LucideIcon;
};

export const deliveryNav: DeliveryNavItem[] = [
  { to: "/conectadelivery", label: "Home", Icon: Store },
  { to: "/conectadelivery-pedidos", label: "Pedidos", Icon: ShoppingBag },
  { to: "/conectadelivery-cardapio", label: "Cardápio", Icon: Utensils },
  { to: "/conectadelivery-configuracoes", label: "Configurações", Icon: Settings2 },
];

export const orderFlow = [
  {
    title: "Novo contato",
    Icon: MessageSquare,
    count: 8,
    tone: "text-info",
    items: [
      { name: "Mesa Burger Club", detail: "Dúvida sobre combo premium", time: "2 min" },
      { name: "Ana Paula", detail: "Quer montar pedido para 4 pessoas", time: "5 min" },
    ],
  },
  {
    title: "Qualificação",
    Icon: Sparkles,
    count: 5,
    tone: "text-primary",
    items: [
      { name: "Rafael N.", detail: "Escolhendo ponto da carne", time: "9 min" },
      { name: "Condomínio Jardins", detail: "Pedido corporativo", time: "13 min" },
    ],
  },
  {
    title: "Pedido montado",
    Icon: PackageCheck,
    count: 11,
    tone: "text-warning",
    items: [
      { name: "Marina C.", detail: "Aguardando Pix", time: "agora" },
      { name: "Lucas T.", detail: "Adicionar sobremesa", time: "7 min" },
    ],
  },
  {
    title: "Fechado",
    Icon: CheckCircle2,
    count: 19,
    tone: "text-success",
    items: [
      { name: "VIP #8421", detail: "Pagamento aprovado", time: "12 min" },
      { name: "Bia L.", detail: "Retirada no balcão", time: "18 min" },
    ],
  },
];

export const liveOrders = [
  { id: "#8427", client: "Henrique A.", items: "2x Black Angus Royale", stage: "Em preparo", eta: "18 min", value: "R$ 148,80", priority: true },
  { id: "#8426", client: "Laura M.", items: "1x Truffle Smash + Fries", stage: "Saiu para entrega", eta: "9 min", value: "R$ 86,40", priority: false },
  { id: "#8425", client: "Bruno e equipe", items: "Combo executivo premium", stage: "Novo", eta: "32 min", value: "R$ 312,00", priority: true },
  { id: "#8424", client: "Patrícia S.", items: "1x Wagyu House + Shake", stage: "Finalizado", eta: "Entregue", value: "R$ 119,90", priority: false },
];

export const menuHighlights = [
  { name: "Black Angus Royale", tag: "Mais vendido", price: "R$ 74,90", margin: "38%", Icon: Flame },
  { name: "Truffle Smash", tag: "Assinatura", price: "R$ 68,40", margin: "41%", Icon: ChefHat },
  { name: "Wagyu House", tag: "Premium", price: "R$ 96,90", margin: "35%", Icon: ShieldCheck },
  { name: "Loaded Fries", tag: "Adicional", price: "R$ 32,90", margin: "52%", Icon: Boxes },
];

export const configCards = [
  { title: "Loja", description: "Nome, unidade, identidade e canais ativos", Icon: Store, status: "Pronto" },
  { title: "Horários", description: "Turnos, pausa da cozinha e retirada", Icon: Clock3, status: "Ajustar" },
  { title: "Entrega", description: "Áreas, taxas, raios e motoboys", Icon: Bike, status: "Pronto" },
  { title: "Pagamentos", description: "Pix, cartão, dinheiro e conciliação", Icon: CreditCard, status: "Pendente" },
];