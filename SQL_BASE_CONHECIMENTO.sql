-- ============================================================
-- Base de Conhecimento da Clínica
-- Execute este SQL no SQL Editor do Supabase / Lovable Cloud.
-- ============================================================

-- 1) Tabela
create table if not exists public.base_conhecimento (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  titulo text not null,
  categoria text not null,                 -- 'preco' | 'convenio' | 'procedimento' | 'horario' | 'outro'
  descricao text,
  conteudo text,                           -- texto manual / transcrição
  tipo text not null default 'texto',      -- 'texto' | 'pdf' | 'imagem'
  arquivo_url text,                        -- URL pública (ou path) do arquivo no Storage
  arquivo_nome text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists base_conhecimento_empresa_idx on public.base_conhecimento(empresa_id);
create index if not exists base_conhecimento_ativo_idx on public.base_conhecimento(empresa_id, ativo);

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists set_updated_at on public.base_conhecimento;
create trigger set_updated_at before update on public.base_conhecimento
for each row execute function public.tg_set_updated_at();

-- 2) RLS — apenas o dono da empresa acessa
alter table public.base_conhecimento enable row level security;

drop policy if exists "owner_select" on public.base_conhecimento;
create policy "owner_select" on public.base_conhecimento for select
using (exists (select 1 from public.empresa e where e.id = empresa_id and e.user_id = auth.uid()));

drop policy if exists "owner_insert" on public.base_conhecimento;
create policy "owner_insert" on public.base_conhecimento for insert
with check (exists (select 1 from public.empresa e where e.id = empresa_id and e.user_id = auth.uid()));

drop policy if exists "owner_update" on public.base_conhecimento;
create policy "owner_update" on public.base_conhecimento for update
using (exists (select 1 from public.empresa e where e.id = empresa_id and e.user_id = auth.uid()));

drop policy if exists "owner_delete" on public.base_conhecimento;
create policy "owner_delete" on public.base_conhecimento for delete
using (exists (select 1 from public.empresa e where e.id = empresa_id and e.user_id = auth.uid()));

-- 3) Storage bucket público para arquivos
insert into storage.buckets (id, name, public)
values ('base-conhecimento', 'base-conhecimento', true)
on conflict (id) do nothing;

-- Policies do bucket — dono da empresa pode gerenciar arquivos sob a sua pasta {empresa_id}/...
drop policy if exists "bk_read_public" on storage.objects;
create policy "bk_read_public" on storage.objects for select
using (bucket_id = 'base-conhecimento');

drop policy if exists "bk_owner_insert" on storage.objects;
create policy "bk_owner_insert" on storage.objects for insert to authenticated
with check (
  bucket_id = 'base-conhecimento'
  and exists (
    select 1 from public.empresa e
    where e.user_id = auth.uid()
      and (storage.foldername(name))[1] = e.id::text
  )
);

drop policy if exists "bk_owner_update" on storage.objects;
create policy "bk_owner_update" on storage.objects for update to authenticated
using (
  bucket_id = 'base-conhecimento'
  and exists (
    select 1 from public.empresa e
    where e.user_id = auth.uid()
      and (storage.foldername(name))[1] = e.id::text
  )
);

drop policy if exists "bk_owner_delete" on storage.objects;
create policy "bk_owner_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'base-conhecimento'
  and exists (
    select 1 from public.empresa e
    where e.user_id = auth.uid()
      and (storage.foldername(name))[1] = e.id::text
  )
);
