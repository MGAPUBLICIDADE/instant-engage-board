ALTER TABLE public.whatsapp_instancias
ADD COLUMN IF NOT EXISTS numero_whatsapp text,
ADD COLUMN IF NOT EXISTS nome_instancia text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_whatsapp_instancias_empresa_id
ON public.whatsapp_instancias (empresa_id);