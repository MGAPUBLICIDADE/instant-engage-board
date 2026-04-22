

# Integração com Supabase (conta externa)

## Decisão
Conectar o CONECTA MGA ao **seu próprio projeto Supabase** (não Lovable Cloud), usando a integração nativa do Lovable.

## Pré-requisitos (você faz antes)

1. Criar conta em [supabase.com](https://supabase.com) (grátis)
2. Criar um novo projeto (escolher região mais próxima — ex: South America São Paulo)
3. Aguardar provisionamento (~2 min)
4. Copiar do painel do Supabase em **Settings → API**:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (chave pública, segura para front-end)

Depois disso, me avise no chat e eu sigo com a implementação abaixo.

## O que será implementado

### 1. Cliente Supabase
- `src/integrations/supabase/client.ts` — instância única do cliente usando as credenciais
- `src/integrations/supabase/types.ts` — tipos TypeScript do banco

### 2. Estrutura do banco (migrations SQL)
```text
profiles            → dados da secretária logada (nome, avatar, clinica_id)
user_roles          → tabela separada de roles (admin | secretaria) — segurança
pacientes           → nome, telefone, procedimento, canal, avatar
atendimentos        → paciente_id, status kanban, prioridade, tag
mensagens           → atendimento_id, autor (cliente|agente), texto, timestamp
agendamentos        → paciente_id, data, hora, procedimento, status
```

Todas com **Row Level Security (RLS)** ativada — apenas usuários autenticados acessam.

### 3. Função de segurança
Função `has_role(user_id, role)` com `SECURITY DEFINER` para evitar recursão de RLS ao checar permissões de admin/secretaria.

### 4. Autenticação
- Rota `/login` com email + senha (sem Google por enquanto)
- Layout `_authenticated` protegendo Home, Agenda, Atendimento, Redes Sociais, Configurações
- Hook `useAuth` com `onAuthStateChange` configurado **antes** do `getSession`
- Botão de logout no sidebar com nome do usuário real
- Trigger SQL criando `profile` automaticamente ao cadastrar

### 5. Substituição dos mocks
- `src/lib/mock-data.ts` deixa de ser fonte de verdade
- Hooks novos: `usePacientes`, `useAtendimentos`, `useMensagens`, `useAgendamentos` usando TanStack Query + Supabase
- Mutations: mover card no Kanban, enviar mensagem, agendar consulta, confirmar presença

### 6. Realtime (sensação "sistema vivo")
Inscrição realtime nas tabelas `mensagens` e `atendimentos` — novas mensagens e mudanças de status aparecem na UI sem refresh.

### 7. Seed inicial
Insert dos pacientes/mensagens fictícios atuais como dados iniciais, para a clínica abrir o sistema já com conteúdo.

## Arquivos

**Novos:**
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/routes/login.tsx`
- `src/routes/_authenticated.tsx`
- `src/hooks/useAuth.ts`
- `src/hooks/usePacientes.ts`
- `src/hooks/useAtendimentos.ts`
- `src/hooks/useMensagens.ts`
- `src/hooks/useAgendamentos.ts`
- Migrations SQL (rodadas no painel Supabase ou via CLI)

**Modificados:**
- `src/router.tsx` — instanciar QueryClient dentro de `getRouter`
- `src/routes/__root.tsx` — adicionar `QueryClientProvider` e contexto de auth
- `src/components/layout/AppShell.tsx` — botão logout + nome real do usuário
- `src/routes/atendimento.tsx`, `agenda.tsx`, e componentes do dashboard — trocar mocks por queries reais
- Mover rotas protegidas para `src/routes/_authenticated/`

## Próximo passo

Quando seu projeto Supabase estiver criado, me envie no chat:
1. **Project URL**
2. **anon public key**

Aí eu inicio a implementação.

