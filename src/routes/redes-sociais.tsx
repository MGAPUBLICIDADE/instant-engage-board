import { createFileRoute } from "@tanstack/react-router";
import { Instagram, MessageCircle, Facebook, Youtube, Plus } from "lucide-react";

export const Route = createFileRoute("/redes-sociais")({
  component: RedesSociaisPage,
  head: () => ({
    meta: [
      { title: "Redes Sociais · Conecta MGA" },
      {
        name: "description",
        content: "Gerencie e integre as redes sociais da sua clínica em um só lugar.",
      },
    ],
  }),
});

const channels = [
  { Icon: MessageCircle, name: "WhatsApp Business", status: "Conectado", tone: "text-[--color-whatsapp]", connected: true, msgs: 248 },
  { Icon: Instagram, name: "Instagram Direct", status: "Conectado", tone: "text-[--color-instagram]", connected: true, msgs: 96 },
  { Icon: Facebook, name: "Facebook Messenger", status: "Não conectado", tone: "text-info", connected: false, msgs: 0 },
  { Icon: Youtube, name: "YouTube Comentários", status: "Em breve", tone: "text-destructive", connected: false, msgs: 0 },
];

function RedesSociaisPage() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">Redes Sociais</h1>
          <p className="text-sm text-muted-foreground">
            Centralize todos os canais de atendimento da sua clínica.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {channels.map(({ Icon, name, status, tone, connected, msgs }) => (
            <div
              key={name}
              className="glass-panel rounded-2xl p-5 card-lift"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated ${tone}`}>
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    connected
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {connected
                  ? `${msgs} mensagens recebidas hoje`
                  : "Conecte para começar a receber mensagens"}
              </p>
              <button
                className={`mt-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  connected
                    ? "border border-border bg-surface hover:bg-surface-elevated"
                    : "bg-primary text-primary-foreground hover:brightness-110"
                }`}
              >
                {connected ? "Gerenciar" : (<><Plus className="h-3.5 w-3.5" strokeWidth={2.5} />Conectar</>)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
