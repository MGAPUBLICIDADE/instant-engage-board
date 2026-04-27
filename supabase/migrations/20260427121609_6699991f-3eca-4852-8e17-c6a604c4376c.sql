-- Fix atendimento_estado: ensure RLS and restrict rows to the authenticated user's empresa
ALTER TABLE public.atendimento_estado ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS atendimento_estado_all_own ON public.atendimento_estado;
CREATE POLICY atendimento_estado_all_own
ON public.atendimento_estado
FOR ALL
TO authenticated
USING (empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id = public.get_user_empresa_id());

-- Fix chatwoot_inboxes: remove public full-access policy and restrict by empresa
ALTER TABLE public.chatwoot_inboxes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acesso total temporario" ON public.chatwoot_inboxes;
DROP POLICY IF EXISTS chatwoot_inboxes_all_own ON public.chatwoot_inboxes;
CREATE POLICY chatwoot_inboxes_all_own
ON public.chatwoot_inboxes
FOR ALL
TO authenticated
USING (empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id = public.get_user_empresa_id());

-- Fix whatsapp_instancias: remove incorrect empresa_id = auth.uid() policy
DROP POLICY IF EXISTS "empresa acessa sua instancia" ON public.whatsapp_instancias;
DROP POLICY IF EXISTS whatsapp_instancias_all_own ON public.whatsapp_instancias;
CREATE POLICY whatsapp_instancias_all_own
ON public.whatsapp_instancias
FOR ALL
TO authenticated
USING (empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id = public.get_user_empresa_id());

-- Reduce duplicated permissive policies on sensitive tables
DROP POLICY IF EXISTS "empresa acessa agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "empresa acessa atendimentos" ON public.atendimentos;
DROP POLICY IF EXISTS "empresa acessa seus medicos" ON public.medicos;
DROP POLICY IF EXISTS agenda_config ON public.medicos;
DROP POLICY IF EXISTS bloqueio_datas ON public.medicos;
DROP POLICY IF EXISTS bloqueio_semana ON public.medicos;
DROP POLICY IF EXISTS medicos ON public.medicos;
DROP POLICY IF EXISTS "empresa acessa pacientes" ON public.pacientes;

-- Recreate timestamp helper with fixed search_path to satisfy Supabase function linter
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate get_empresa_id with fixed search_path and safer auth check
CREATE OR REPLACE FUNCTION public.get_empresa_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.empresas
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;