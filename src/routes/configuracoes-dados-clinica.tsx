import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useConfiguracaoClinica,
  useSalvarConfiguracaoClinica,
} from "@/hooks/useConfiguracaoClinica";

export const Route = createFileRoute("/configuracoes-dados-clinica")({
  component: DadosClinicaPage,
  head: () => ({
    meta: [
      { title: "Dados da clínica · Conecta MGA" },
      {
        name: "description",
        content: "Cadastre nome, endereço e contatos da sua clínica.",
      },
    ],
  }),
});

interface FormState {
  nome_clinica: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
  whatsapp: string;
  email: string;
}

const EMPTY: FormState = {
  nome_clinica: "",
  cnpj: "",
  endereco: "",
  cidade: "",
  estado: "",
  telefone: "",
  whatsapp: "",
  email: "",
};

function DadosClinicaPage() {
  const { data, isLoading, error } = useConfiguracaoClinica();
  const salvar = useSalvarConfiguracaoClinica();
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (data) {
      setForm({
        nome_clinica: data.nome_clinica ?? "",
        cnpj: data.cnpj ?? "",
        endereco: data.endereco ?? "",
        cidade: data.cidade ?? "",
        estado: data.estado ?? "",
        telefone: data.telefone ?? "",
        whatsapp: data.whatsapp ?? "",
        email: data.email ?? "",
      });
    }
  }, [data]);

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salvar.mutateAsync({
        nome_clinica: form.nome_clinica.trim() || null,
        cnpj: form.cnpj.trim() || null,
        endereco: form.endereco.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim().toUpperCase() || null,
        telefone: form.telefone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
      });
      toast.success("Dados da clínica salvos com sucesso!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-6">
          <Link
            to="/configuracoes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para configurações
          </Link>
        </div>

        <header className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Dados da clínica</h1>
            <p className="text-sm text-muted-foreground">
              Informações básicas usadas em mensagens, agendamentos e documentos.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Erro ao carregar dados: {error.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-surface p-5 lg:p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="nome_clinica">Nome da clínica</Label>
            <Input
              id="nome_clinica"
              value={form.nome_clinica}
              onChange={handleChange("nome_clinica")}
              placeholder="Ex: Clínica MGA Estética"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={form.endereco}
              onChange={handleChange("endereco")}
              placeholder="Rua, número, bairro"
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={form.cidade}
                onChange={handleChange("cidade")}
                placeholder="São Paulo"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado (UF)</Label>
              <Input
                id="estado"
                value={form.estado}
                onChange={handleChange("estado")}
                placeholder="SP"
                maxLength={2}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={form.telefone}
                onChange={handleChange("telefone")}
                placeholder="(11) 0000-0000"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={handleChange("whatsapp")}
                placeholder="(11) 90000-0000"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="contato@suaclinica.com.br"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={salvar.isPending || isLoading}
              className="min-w-[140px]"
            >
              {salvar.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
