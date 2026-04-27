-- Make helper functions run with caller permissions instead of elevated SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_empresa_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT id
  FROM public.empresas
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT id
  FROM public.empresas
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_empresa_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_empresa_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_empresa_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_empresa_id() TO authenticated;

-- Protect clinical knowledge files. File paths should start with the empresa UUID.
UPDATE storage.buckets
SET public = false
WHERE id = 'conhecimento-clinica';

DROP POLICY IF EXISTS conhecimento_clinica_files_select_own ON storage.objects;
DROP POLICY IF EXISTS conhecimento_clinica_files_insert_own ON storage.objects;
DROP POLICY IF EXISTS conhecimento_clinica_files_update_own ON storage.objects;
DROP POLICY IF EXISTS conhecimento_clinica_files_delete_own ON storage.objects;

CREATE POLICY conhecimento_clinica_files_select_own
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'conhecimento-clinica'
  AND (storage.foldername(name))[1] = public.get_user_empresa_id()::text
);

CREATE POLICY conhecimento_clinica_files_insert_own
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'conhecimento-clinica'
  AND (storage.foldername(name))[1] = public.get_user_empresa_id()::text
);

CREATE POLICY conhecimento_clinica_files_update_own
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'conhecimento-clinica'
  AND (storage.foldername(name))[1] = public.get_user_empresa_id()::text
)
WITH CHECK (
  bucket_id = 'conhecimento-clinica'
  AND (storage.foldername(name))[1] = public.get_user_empresa_id()::text
);

CREATE POLICY conhecimento_clinica_files_delete_own
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'conhecimento-clinica'
  AND (storage.foldername(name))[1] = public.get_user_empresa_id()::text
);