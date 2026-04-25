import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MessageCircle, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useSalvarWhatsappInstancia,
  useWhatsappInstancia,
} from "@/hooks/useWhatsappInstancias";

export const Route = createFileRoute("/configuracoes-whatsapp")({
  component: ConfiguracoesWhatsappPage,
  head: () => ({
    meta: [
      { title: "WhatsApp · Conecta MGA" },
      {
        name: "description",
        content: "Configure a instância Z-API do WhatsApp da clínica.",
      },
    ],
  }),
});

interface FormState {
  numero_whatsapp: string;
  instance_id: string;
  token_api: string;
  nome_instancia: string;
  ativo: boolean;
}

const EMPTY: FormState = {
  numero_whatsapp: "",
  instance_id: "",
  token_api: "",
  nome_instancia: "",
  ativo: true,
};

function ConfiguracoesWhatsappPage() {
  const { data, isLoading, error } = useWhatsappInstancia();
  const salvar = useSalvarWhatsappInstancia();
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (data) {
      setForm({
        numero_whatsapp: data.numero_whatsapp ?? "",
        instance_id: data.instance_id ?? "",
        token_api: "",
        nome_instancia: data.nome_instancia ?? "",
        ativo: data.ativo ?? true,
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
        id: data?.id,
        numero_whatsapp: form.numero_whatsapp.trim(),
        instance_id: form.instance_id.trim(),
        token_api: form.token_api.trim(),
        nome_instancia: form.nome_instancia.trim() || null,
        ativo: form.ativo,
      });
      toast.success("Configuração do WhatsApp salva com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar WhatsApp", {
        description: err instanceof Error ? err.message : undefined,
      });
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
            <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Dados da instância Z-API usada para atendimento e automações.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Erro ao carregar WhatsApp: {error.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-surface p-5 lg:p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="numero_whatsapp">Número do WhatsApp</Label>
            <Input
              id="numero_whatsapp"
              type="tel"
              value={form.numero}
              onChange={handleChange("numero")}
              placeholder="Ex: 5511999999999"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instance_id">Instance ID (Z-API)</Label>
            <Input
              id="instance_id"
              value={form.instance_id}
              onChange={handleChange("instance_id")}
              placeholder="ID da instância"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token_api">Token da API</Label>
            <Input
              id="token_api"
              type="password"
              value={form.token}
              onChange={handleChange("token")}
              placeholder="Token da Z-API"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_instancia">Nome da Instância (opcional)</Label>
            <Input
              id="nome_instancia"
              value={form.nome}
              onChange={handleChange("nome")}
              placeholder="Ex: Recepção"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4">
            <div>
              <Label htmlFor="ativo">Status</Label>
              <p className="text-xs text-muted-foreground">
                {form.ativo ? "Instância ativa" : "Instância inativa"}
              </p>
            </div>
            <Switch
              id="ativo"
              checked={form.ativo}
              onCheckedChange={(ativo) => setForm((prev) => ({ ...prev, ativo }))}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="submit" disabled={salvar.isPending || isLoading} className="gap-2">
              {salvar.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar WhatsApp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}