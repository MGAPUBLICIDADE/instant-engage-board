DROP POLICY IF EXISTS "empresa acessa sua instancia" ON public.whatsapp_instancias;
DROP POLICY IF EXISTS whatsapp_instancias_all_own ON public.whatsapp_instancias;

ALTER TABLE public.whatsapp_instancias ENABLE ROW LEVEL SECURITY;

CREATE POLICY whatsapp_instancias_all_own
ON public.whatsapp_instancias
FOR ALL
TO authenticated
USING (empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id = public.get_user_empresa_id());