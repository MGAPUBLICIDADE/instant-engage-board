ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueio_semana ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueio_datas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conhecimento_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agendamentos_all_own ON public.agendamentos;
CREATE POLICY agendamentos_all_own
ON public.agendamentos
FOR ALL
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

DROP POLICY IF EXISTS atendimentos_all_own ON public.atendimentos;
CREATE POLICY atendimentos_all_own
ON public.atendimentos
FOR ALL
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

DROP POLICY IF EXISTS agenda_config_all_own ON public.agenda_config;
CREATE POLICY agenda_config_all_own
ON public.agenda_config
FOR ALL
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

DROP POLICY IF EXISTS bloqueio_semana_all_own ON public.bloqueio_semana;
CREATE POLICY bloqueio_semana_all_own
ON public.bloqueio_semana
FOR ALL
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

DROP POLICY IF EXISTS bloqueio_datas_all_own ON public.bloqueio_datas;
CREATE POLICY bloqueio_datas_all_own
ON public.bloqueio_datas
FOR ALL
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

DROP POLICY IF EXISTS medicos_select_own ON public.medicos;
DROP POLICY IF EXISTS medicos_insert_own ON public.medicos;
DROP POLICY IF EXISTS medicos_update_own ON public.medicos;
DROP POLICY IF EXISTS medicos_delete_own ON public.medicos;

CREATE POLICY medicos_select_own
ON public.medicos
FOR SELECT
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

CREATE POLICY medicos_insert_own
ON public.medicos
FOR INSERT
TO authenticated
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

CREATE POLICY medicos_update_own
ON public.medicos
FOR UPDATE
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

CREATE POLICY medicos_delete_own
ON public.medicos
FOR DELETE
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

DROP POLICY IF EXISTS "empresa acessa conhecimento" ON public.conhecimento_clinica;
CREATE POLICY conhecimento_clinica_all_own
ON public.conhecimento_clinica
FOR ALL
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());

DROP POLICY IF EXISTS "empresa acessa prontuarios" ON public.prontuarios;
CREATE POLICY prontuarios_all_own
ON public.prontuarios
FOR ALL
TO authenticated
USING (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id IS NOT NULL AND empresa_id = public.get_user_empresa_id());