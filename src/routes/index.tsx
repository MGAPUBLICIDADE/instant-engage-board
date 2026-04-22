import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { Kanban } from "@/components/dashboard/Kanban";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { AlertsBar } from "@/components/dashboard/AlertsBar";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Conecta MGA · Painel de Atendimento" },
      {
        name: "description",
        content:
          "Conecta MGA — painel inteligente para atendimento em tempo real, com Kanban de leads e chat unificado WhatsApp e Instagram.",
      },
    ],
  }),
});

function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<string>("l3");

  return (
    <div className="min-h-screen p-3 lg:p-4">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3">
        <Header />

        <KpiCards />
        <AlertsBar onSelect={setSelectedLead} />

        <main className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
          <section className="lg:col-span-7 xl:col-span-8 h-[calc(100vh-360px)] min-h-[560px]">
            <Kanban selectedId={selectedLead} onSelect={setSelectedLead} />
          </section>
          <section className="lg:col-span-5 xl:col-span-4 h-[calc(100vh-360px)] min-h-[560px]">
            <ChatPanel leadId={selectedLead} />
          </section>
        </main>
      </div>
    </div>
  );
}
