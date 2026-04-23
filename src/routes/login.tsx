import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveEmpresaWithConfig } from "@/lib/empresa-api";
import { syncPendingEmpresaData } from "@/lib/sync-pending-empresa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar · Conecta MGA" },
      { name: "description", content: "Acesse sua conta no Conecta MGA." },
    ],
  }),
});

interface CadastroData {
  empresa: string;
  cnpj: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
  whatsapp: string;
}

const EMPTY_CADASTRO: CadastroData = {
  empresa: "",
  cnpj: "",
  email: "",
  endereco: "",
  cidade: "",
  estado: "",
  telefone: "",
  whatsapp: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "cadastro">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Cadastro: passo 1 (email/senha) → abre popup com dados da clínica
  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroSenha, setCadastroSenha] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [cadastro, setCadastro] = useState<CadastroData>(EMPTY_CADASTRO);
  const [loadingCadastro, setLoadingCadastro] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginSenha,
    });
    setLoadingLogin(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "E-mail ou senha incorretos"
        : error.message);
      return;
    }

    try {
      if (data.user) {
        await syncPendingEmpresaData({
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata,
        });
      }
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : "Erro ao salvar dados da clínica";
      toast.error(message);
    }

    toast.success("Bem-vindo!");
    navigate({ to: "/" });
  };

  const handleAbrirPopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (cadastroSenha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    setCadastro((p) => ({ ...p, email: cadastroEmail }));
    setPopupOpen(true);
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCadastro(true);

    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email: cadastroEmail.trim(),
      password: cadastroSenha,
      options: {
        emailRedirectTo: redirectUrl,
        data: { nome_empresa: cadastro.empresa },
      },
    });

    if (error) {
      setLoadingCadastro(false);
      toast.error(error.message === "User already registered"
        ? "Este e-mail já está cadastrado"
        : error.message);
      return;
    }

    // Payload da empresa (tabela `empresa`)
    const empresaPayload = {
      nome: cadastro.empresa.trim() || null,
      cnpj: cadastro.cnpj.trim() || null,
      endereco: cadastro.endereco.trim() || null,
      cidade: cadastro.cidade.trim() || null,
      estado: cadastro.estado.trim().toUpperCase() || null,
      telefone: cadastro.telefone.trim() || null,
      whatsapp: cadastro.whatsapp.trim() || null,
      email: cadastro.email.trim() || null,
    };

    const pendingUserMetadata = {
      nome_empresa: cadastro.empresa,
      pending_empresa: empresaPayload,
      pending_empresa_email: cadastroEmail.trim(),
    };

    if (data.session && data.user) {
      // Confirmação desativada - já logado: insere em empresa + configuracao_empresa
      setLoadingCadastro(false);
      try {
        await saveEmpresaWithConfig({ user_id: data.user.id, ...empresaPayload });
        toast.success("Conta criada com sucesso!");
      } catch (empErr) {
        const message = empErr instanceof Error ? empErr.message : "Erro ao salvar dados da clínica";
        toast.error("Cadastro criado, mas falhou ao salvar dados: " + message);
      }
      navigate({ to: "/" });
    } else {
      // Confirmação ativa - guarda payload p/ aplicar após confirmar email + login
      try {
        await supabase.auth.updateUser({ data: pendingUserMetadata });
        localStorage.setItem(
          "pending_empresa_data",
          JSON.stringify({ email: cadastroEmail.trim(), payload: empresaPayload }),
        );
      } catch {}
      setLoadingCadastro(false);
      setPopupOpen(false);
      toast.success(
        "Cadastro criado! Confirme seu e-mail para ativar a conta.",
        { duration: 7000 },
      );
      setTab("login");
      setLoginEmail(cadastroEmail.trim());
      setCadastroEmail("");
      setCadastroSenha("");
      setCadastro(EMPTY_CADASTRO);
    }
  };

  const upd = (k: keyof CadastroData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCadastro((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_var(--color-primary)]">
            <Sparkles className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            CONECTA <span className="text-primary">MGA</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Mídia Inteligente para clínicas</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "cadastro")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-senha">Senha</Label>
                  <Input
                    id="login-senha"
                    type="password"
                    required
                    value={loginSenha}
                    onChange={(e) => setLoginSenha(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loadingLogin}>
                  {loadingLogin ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="cadastro" className="mt-6">
              <form onSubmit={handleAbrirPopup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cad-email">E-mail</Label>
                  <Input
                    id="cad-email"
                    type="email"
                    required
                    value={cadastroEmail}
                    onChange={(e) => setCadastroEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cad-senha">Senha</Label>
                  <Input
                    id="cad-senha"
                    type="password"
                    required
                    minLength={6}
                    value={cadastroSenha}
                    onChange={(e) => setCadastroSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continuar →
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Próximo passo: dados da sua clínica
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <DialogTitle>Dados da clínica</DialogTitle>
            <DialogDescription>
              Preencha os dados da sua clínica para finalizar o cadastro.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa / Clínica *</Label>
              <Input id="empresa" required value={cadastro.empresa} onChange={upd("empresa")} placeholder="Clínica MGA Estética" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" value={cadastro.cnpj} onChange={upd("cnpj")} placeholder="00.000.000/0001-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-empresa">E-mail da clínica</Label>
                <Input id="email-empresa" type="email" value={cadastro.email} onChange={upd("email")} placeholder="contato@clinica.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" value={cadastro.endereco} onChange={upd("endereco")} placeholder="Rua, número, bairro" />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" value={cadastro.cidade} onChange={upd("cidade")} placeholder="São Paulo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado (UF)</Label>
                <Input id="estado" value={cadastro.estado} onChange={upd("estado")} placeholder="SP" maxLength={2} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" type="tel" value={cadastro.telefone} onChange={upd("telefone")} placeholder="(11) 0000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" type="tel" value={cadastro.whatsapp} onChange={upd("whatsapp")} placeholder="(11) 90000-0000" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setPopupOpen(false)} disabled={loadingCadastro}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loadingCadastro} className="min-w-[140px]">
                {loadingCadastro ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Criando...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
