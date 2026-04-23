-- ============================================================
-- MIGRATION: completar esquema do Conecta MGA
-- Aplique este SQL pelo SQL Editor do Supabase / Lovable Cloud
-- ============================================================

-- 1. Função utilitária: empresa_id do usuário logado
create or replace function public.get_user_empresa_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.empresas where user_id = auth.uid() limit 1;
$$;

-- ============================================================
-- 2. MEDICOS
-- ============================================================
alter table public.medicos
  add column if not exists telefone text,
  add column if not exists whatsapp text,
  add column if not exists email text,
  add column if not exists crm text,
  add column if not exists conselho_uf text,
  add column if not exists cpf text,
  add column if not exists cor text default '#3b82f6',
  add column if not exists ativo boolean not null default true,
  add column if not exists observacoes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.medicos enable row level security;

drop policy if exists "medicos_select_own" on public.medicos;
drop policy if exists "medicos_insert_own" on public.medicos;
drop policy if exists "medicos_update_own" on public.medicos;
drop policy if exists "medicos_delete_own" on public.medicos;

create policy "medicos_select_own" on public.medicos
  for select using (empresa_id = public.get_user_empresa_id());
create policy "medicos_insert_own" on public.medicos
  for insert with check (empresa_id = public.get_user_empresa_id());
create policy "medicos_update_own" on public.medicos
  for update using (empresa_id = public.get_user_empresa_id());
create policy "medicos_delete_own" on public.medicos
  for delete using (empresa_id = public.get_user_empresa_id());

-- ============================================================
-- 3. PACIENTES
-- ============================================================
alter table public.pacientes
  add column if not exists cpf text,
  add column if not exists data_nascimento date,
  add column if not exists sexo text,
  add column if not exists endereco text,
  add column if not exists cidade text,
  add column if not exists estado text,
  add column if not exists cep text,
  add column if not exists ativo boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.pacientes enable row level security;

drop policy if exists "pacientes_select_own" on public.pacientes;
drop policy if exists "pacientes_insert_own" on public.pacientes;
drop policy if exists "pacientes_update_own" on public.pacientes;
drop policy if exists "pacientes_delete_own" on public.pacientes;

create policy "pacientes_select_own" on public.pacientes
  for select using (empresa_id = public.get_user_empresa_id());
create policy "pacientes_insert_own" on public.pacientes
  for insert with check (empresa_id = public.get_user_empresa_id());
create policy "pacientes_update_own" on public.pacientes
  for update using (empresa_id = public.get_user_empresa_id());
create policy "pacientes_delete_own" on public.pacientes
  for delete using (empresa_id = public.get_user_empresa_id());

-- ============================================================
-- 4. AGENDA_CONFIG  (uma linha por médico)
-- ============================================================
alter table public.agenda_config
  add column if not exists hora_inicio time not null default '08:00',
  add column if not exists hora_fim time not null default '18:00',
  add column if not exists duracao_consulta_min int not null default 30,
  add column if not exists intervalo_min int not null default 0,
  add column if not exists almoco_inicio time,
  add column if not exists almoco_fim time,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists agenda_config_medico_uniq
  on public.agenda_config(medico_id);

alter table public.agenda_config enable row level security;

drop policy if exists "agenda_config_all_own" on public.agenda_config;
create policy "agenda_config_all_own" on public.agenda_config
  for all using (empresa_id = public.get_user_empresa_id())
  with check (empresa_id = public.get_user_empresa_id());

-- ============================================================
-- 5. BLOQUEIO_DATAS (datas específicas)
-- ============================================================
alter table public.bloqueio_datas
  add column if not exists hora_inicio time,
  add column if not exists hora_fim time,
  add column if not exists dia_inteiro boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.bloqueio_datas enable row level security;
drop policy if exists "bloqueio_datas_all_own" on public.bloqueio_datas;
create policy "bloqueio_datas_all_own" on public.bloqueio_datas
  for all using (empresa_id = public.get_user_empresa_id())
  with check (empresa_id = public.get_user_empresa_id());

-- ============================================================
-- 6. BLOQUEIO_SEMANA  (recorrente por dia da semana)
-- ============================================================
alter table public.bloqueio_semana
  add column if not exists hora_inicio time not null default '12:00',
  add column if not exists hora_fim time not null default '13:00',
  add column if not exists motivo text,
  add column if not exists ativo boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.bloqueio_semana enable row level security;
drop policy if exists "bloqueio_semana_all_own" on public.bloqueio_semana;
create policy "bloqueio_semana_all_own" on public.bloqueio_semana
  for all using (empresa_id = public.get_user_empresa_id())
  with check (empresa_id = public.get_user_empresa_id());

-- ============================================================
-- 7. AGENDAMENTOS
-- ============================================================
alter table public.agendamentos
  add column if not exists duracao_min int not null default 30,
  add column if not exists procedimento text,
  add column if not exists valor numeric(10,2),
  add column if not exists updated_at timestamptz not null default now();

alter table public.agendamentos enable row level security;
drop policy if exists "agendamentos_all_own" on public.agendamentos;
create policy "agendamentos_all_own" on public.agendamentos
  for all using (empresa_id = public.get_user_empresa_id())
  with check (empresa_id = public.get_user_empresa_id());

create index if not exists agendamentos_medico_data_idx
  on public.agendamentos(medico_id, data);

-- ============================================================
-- 8. ATENDIMENTOS
-- ============================================================
alter table public.atendimentos
  add column if not exists agendamento_id uuid references public.agendamentos(id) on delete set null,
  add column if not exists medico_id uuid references public.medicos(id) on delete set null,
  add column if not exists data date,
  add column if not exists hora time,
  add column if not exists anamnese text,
  add column if not exists diagnostico text,
  add column if not exists prescricao text,
  add column if not exists observacoes text,
  add column if not exists valor numeric(10,2),
  add column if not exists updated_at timestamptz not null default now();

alter table public.atendimentos enable row level security;
drop policy if exists "atendimentos_all_own" on public.atendimentos;
create policy "atendimentos_all_own" on public.atendimentos
  for all using (empresa_id = public.get_user_empresa_id())
  with check (empresa_id = public.get_user_empresa_id());

-- ============================================================
-- 9. EMPRESAS  (RLS por user_id)
-- ============================================================
alter table public.empresas enable row level security;
drop policy if exists "empresas_all_own" on public.empresas;
create policy "empresas_all_own" on public.empresas
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- FIM
-- ============================================================
