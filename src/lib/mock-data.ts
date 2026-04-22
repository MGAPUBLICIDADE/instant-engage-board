export type Channel = "whatsapp" | "instagram";
export type Priority = "low" | "medium" | "high";
export type LeadStatus = "novo" | "atendimento" | "aguardando" | "finalizado";
export type LeadTag = "Urgente" | "Hot Lead" | "Fechando" | "Convertido" | "Novo";

export interface Lead {
  id: string;
  name: string;
  avatar: string;
  channel: Channel;
  lastMessage: string;
  lastMessageAt: string; // ISO
  status: LeadStatus;
  priority: Priority;
  unread: number;
  tag?: LeadTag;
  procedure?: string;
}

export interface Message {
  id: string;
  leadId: string;
  from: "client" | "agent";
  text: string;
  at: string; // ISO
  channel: Channel;
}

// Use a deterministic base so SSR and client agree on initial timestamps.
// We pick a fixed reference; UI components compute "minutes ago" only on the client.
const BASE = new Date("2025-01-15T13:00:00.000Z").getTime();
const m = (min: number) => new Date(BASE - min * 60_000).toISOString();

export const leads: Lead[] = [
  {
    id: "l1",
    name: "Mariana Albuquerque",
    avatar: "MA",
    channel: "whatsapp",
    lastMessage: "Olá! Gostaria de marcar uma avaliação de harmonização facial.",
    lastMessageAt: m(2),
    status: "novo",
    priority: "high",
    unread: 3,
    tag: "Hot Lead",
    procedure: "Harmonização facial",
  },
  {
    id: "l2",
    name: "Rafael Monteiro",
    avatar: "RM",
    channel: "instagram",
    lastMessage: "Vocês fazem limpeza de pele profunda? Qual valor?",
    lastMessageAt: m(8),
    status: "novo",
    priority: "medium",
    unread: 1,
    tag: "Novo",
    procedure: "Limpeza de pele",
  },
  {
    id: "l3",
    name: "Juliana Castro",
    avatar: "JC",
    channel: "whatsapp",
    lastMessage: "Perfeito, podemos confirmar a consulta de quinta às 14h.",
    lastMessageAt: m(4),
    status: "atendimento",
    priority: "high",
    unread: 2,
    tag: "Fechando",
    procedure: "Consulta dermatológica",
  },
  {
    id: "l4",
    name: "Bruno Tavares",
    avatar: "BT",
    channel: "whatsapp",
    lastMessage: "Vou conferir minha agenda e te confirmo o horário ainda hoje.",
    lastMessageAt: m(22),
    status: "atendimento",
    priority: "medium",
    unread: 0,
    procedure: "Avaliação inicial",
  },
  {
    id: "l5",
    name: "Camila Souza",
    avatar: "CS",
    channel: "instagram",
    lastMessage: "Mandei o comprovante do sinal, pode confirmar o agendamento?",
    lastMessageAt: m(14),
    status: "atendimento",
    priority: "high",
    unread: 1,
    tag: "Hot Lead",
    procedure: "Aplicação de Botox",
  },
  {
    id: "l6",
    name: "Diego Ferraz",
    avatar: "DF",
    channel: "whatsapp",
    lastMessage: "Ainda aguardo retorno sobre o orçamento da consulta.",
    lastMessageAt: m(48),
    status: "aguardando",
    priority: "high",
    unread: 0,
    tag: "Urgente",
    procedure: "Avaliação ortopédica",
  },
  {
    id: "l7",
    name: "Isabela Rocha",
    avatar: "IR",
    channel: "instagram",
    lastMessage: "Preciso pensar mais um pouco, te aviso amanhã sobre a consulta.",
    lastMessageAt: m(120),
    status: "aguardando",
    priority: "low",
    unread: 0,
    procedure: "Preenchimento labial",
  },
  {
    id: "l8",
    name: "Lucas Pereira",
    avatar: "LP",
    channel: "whatsapp",
    lastMessage: "Atendimento foi excelente, muito obrigado!",
    lastMessageAt: m(180),
    status: "finalizado",
    priority: "low",
    unread: 0,
    tag: "Convertido",
    procedure: "Consulta clínica",
  },
  {
    id: "l9",
    name: "Patrícia Lemos",
    avatar: "PL",
    channel: "instagram",
    lastMessage: "Adorei o procedimento, vou indicar a clínica para amigas!",
    lastMessageAt: m(300),
    status: "finalizado",
    priority: "low",
    unread: 0,
    tag: "Convertido",
    procedure: "Drenagem linfática",
  },
];

export const messagesByLead: Record<string, Message[]> = {
  l3: [
    { id: "m1", leadId: "l3", from: "client", channel: "whatsapp", text: "Oi! Bom dia 😊", at: m(45) },
    { id: "m2", leadId: "l3", from: "agent", channel: "whatsapp", text: "Bom dia, Juliana! Tudo bem? Como posso te ajudar?", at: m(43) },
    { id: "m3", leadId: "l3", from: "client", channel: "whatsapp", text: "Quero marcar uma consulta dermatológica.", at: m(40) },
    { id: "m4", leadId: "l3", from: "agent", channel: "whatsapp", text: "Claro! Temos horário na quinta às 14h ou sexta às 10h. Qual prefere?", at: m(38) },
    { id: "m5", leadId: "l3", from: "client", channel: "whatsapp", text: "Perfeito, podemos confirmar a consulta de quinta às 14h.", at: m(4) },
  ],
  l1: [
    { id: "m10", leadId: "l1", from: "client", channel: "whatsapp", text: "Olá! Vi a clínica no Instagram.", at: m(6) },
    { id: "m11", leadId: "l1", from: "client", channel: "whatsapp", text: "Gostaria de marcar uma avaliação de harmonização facial.", at: m(4) },
    { id: "m12", leadId: "l1", from: "client", channel: "whatsapp", text: "Quais horários vocês têm essa semana?", at: m(2) },
  ],
};

export function getMessages(leadId: string): Message[] {
  return (
    messagesByLead[leadId] ?? [
      { id: "x1", leadId, from: "client", channel: "whatsapp", text: "Olá, tudo bem?", at: m(30) },
      { id: "x2", leadId, from: "agent", channel: "whatsapp", text: "Olá! Como posso ajudar com seu agendamento hoje?", at: m(28) },
    ]
  );
}

/**
 * Auto-priority based on minutes without response from agent.
 * <10min: low, 10-30min: medium (warning), >30min: high (urgent)
 */
export function autoPriority(iso: string): Priority {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diff > 30) return "high";
  if (diff > 10) return "medium";
  return "low";
}

export function timeAgo(iso: string): string {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (diff < 60) return `há ${diff} min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
