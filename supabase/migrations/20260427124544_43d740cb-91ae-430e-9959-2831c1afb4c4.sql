ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pacientes_select_own ON public.pacientes;
DROP POLICY IF EXISTS pacientes_insert_own ON public.pacientes;
DROP POLICY IF EXISTS pacientes_update_own ON public.pacientes;
DROP POLICY IF EXISTS pacientes_delete_own ON public.pacientes;

CREATE POLICY pacientes_select_own
ON public.pacientes
FOR SELECT
TO authenticated
USING (
  empresa_id IS NOT NULL
  AND empresa_id = public.get_user_empresa_id()
);

CREATE POLICY pacientes_insert_own
ON public.pacientes
FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id IS NOT NULL
  AND empresa_id = public.get_user_empresa_id()
);

CREATE POLICY pacientes_update_own
ON public.pacientes
FOR UPDATE
TO authenticated
USING (
  empresa_id IS NOT NULL
  AND empresa_id = public.get_user_empresa_id()
)
WITH CHECK (
  empresa_id IS NOT NULL
  AND empresa_id = public.get_user_empresa_id()
);

CREATE POLICY pacientes_delete_own
ON public.pacientes
FOR DELETE
TO authenticated
USING (
  empresa_id IS NOT NULL
  AND empresa_id = public.get_user_empresa_id()
);