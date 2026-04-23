import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, User, Lock, Palette, Building2, Stethoscope, Users, CalendarCog, CalendarX, CalendarDays, ClipboardList, BookOpen } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
  head: () => ({
    meta: [
      { title: "Configurações · Conecta MGA" },
      {
        name: "description",
        content: "Personalize sua experiência e ajuste preferências do Conecta MGA.",
      },
    ],
  }),
});

type SectionTo =
  | "/configuracoes-dados-clinica"
  | "/configuracoes-medicos"
  | "/configuracoes-pacientes"
  | "/configuracoes-agenda"
  | "/configuracoes-base-conhecimento";

type SectionItem = {
  Icon: typeof Building2;
  title: string;
  desc: string;
  to?: SectionTo;
  group: "Cl\u00ednica" | "Agenda" | "Sistema";
};

const sections: SectionItem[] = [
  { Icon: Building2, title: "Dados da clínica", desc: "Nome, endereço e contatos", to: "/configuracoes-dados-clinica", group: "Clínica" },
  { Icon: Stethoscope, title: "Médicos", desc: "Cadastre os profissionais da equipe", to: "/configuracoes-medicos", group: "Clínica" },
  { Icon: Users, title: "Pacientes", desc: "Gerencie o cadastro de pacientes", to: "/configuracoes-pacientes", group: "Clínica" },
  { Icon: CalendarCog, title: "Configuração de agenda", desc: "Horários, almoço e bloqueios por médico", to: "/configuracoes-agenda", group: "Agenda" },
  { Icon: ClipboardList, title: "Atendimentos", desc: "Histórico clínico e prontuários", group: "Agenda" },
  { Icon: BookOpen, title: "Base de conhecimento", desc: "Conteúdos (preços, convênios, procedimentos) para a IA", to: "/configuracoes-base-conhecimento", group: "Sistema" },
  { Icon: User, title: "Equipe", desc: "Adicione atendentes e gerencie permissões", group: "Sistema" },
  { Icon: Bell, title: "Notificações", desc: "Configure alertas e lembretes automáticos", group: "Sistema" },
  { Icon: Palette, title: "Aparência", desc: "Tema, cores e personalização visual", group: "Sistema" },
  { Icon: Lock, title: "Segurança", desc: "Senha, autenticação e privacidade", group: "Sistema" },
];

const GRUPOS: Array<SectionItem["group"]> = ["Clínica", "Agenda", "Sistema"];

function ConfiguracoesPage() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[900px]">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Personalize o Conecta MGA para a rotina da sua clínica.
          </p>
        </header>

        <div className="space-y-8">
          {GRUPOS.map((grupo) => (
            <section key={grupo}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {grupo}
              </h2>
              <div className="space-y-2">
                {sections
                  .filter((s) => s.group === grupo)
                  .map(({ Icon, title, desc, to }) => {
                    const className =
                      "group flex w-full items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-4 text-left transition-all hover:border-primary/40 hover:bg-surface-elevated card-lift";
                    const inner = (
                      <>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 leading-tight">
                          <p className="text-sm font-bold">{title}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Abrir →
                        </span>
                      </>
                    );
                    return to ? (
                      <Link key={title} to={to} className={className}>
                        {inner}
                      </Link>
                    ) : (
                      <button
                        key={title}
                        className={`${className} opacity-60 cursor-not-allowed`}
                        title="Em breve"
                      >
                        {inner}
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
