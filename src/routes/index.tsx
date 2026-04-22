import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react";
import clinicHero from "@/assets/clinic-hero.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Conecta MGA · Centro de controle do atendimento da sua clínica" },
      {
        name: "description",
        content:
          "Conecta MGA é o centro de controle do atendimento da sua clínica: organize pacientes, responda no tempo certo e aumente a conversão em consultas confirmadas.",
      },
      {
        property: "og:title",
        content: "Conecta MGA · Centro de controle do atendimento da sua clínica",
      },
      {
        property: "og:description",
        content:
          "Atendimento mais profissional, organizado e preparado para crescer de forma previsível.",
      },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Texto */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />
              Secretária Inteligente
            </span>

            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              Controle total do{" "}
              <span className="text-primary">atendimento</span> da sua clínica
            </h1>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              <p>
                Mais do que um sistema, o{" "}
                <span className="font-semibold text-foreground">CONECTA MGA</span> é o
                centro de controle do atendimento da sua clínica. Aqui, cada paciente é
                acompanhado com organização, cada conversa é respondida no tempo certo e
                cada oportunidade é conduzida até o agendamento.
              </p>
              <p>
                Com uma visão clara de tudo o que está acontecendo, sua equipe trabalha
                com mais eficiência, reduz falhas no atendimento e aumenta a conversão de
                pacientes em consultas confirmadas.
              </p>
              <p className="rounded-xl border-l-2 border-primary bg-surface/60 px-4 py-3 text-foreground">
                <span className="font-semibold">Resultado:</span> um atendimento mais
                profissional, mais organizado e preparado para crescer de forma
                previsível.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/atendimento"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_12px_32px_-12px_var(--color-primary)]"
              >
                Acessar painel de atendimento
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
              <Link
                to="/agenda"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition-all hover:border-primary/40 hover:bg-surface-elevated"
              >
                Ver agenda
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { Icon: CheckCircle2, label: "Atendimentos organizados", tone: "text-success" },
                { Icon: TrendingUp, label: "Mais conversões", tone: "text-primary" },
                { Icon: ShieldCheck, label: "Equipe no controle", tone: "text-info" },
              ].map(({ Icon, label, tone }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-surface px-3 py-3"
                >
                  <Icon className={`h-4 w-4 ${tone}`} strokeWidth={2.4} />
                  <p className="mt-2 text-[11px] font-semibold leading-tight text-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Imagem */}
          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-info/10 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
              <img
                src={clinicHero}
                alt="Atendimento profissional em recepção de clínica"
                width={1536}
                height={1024}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20 text-success">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold">Atendimento em tempo real</p>
                  <p className="text-[11px] text-muted-foreground">
                    WhatsApp e Instagram unificados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
