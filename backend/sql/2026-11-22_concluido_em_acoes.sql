-- Aplicado no Supabase em 22/11/2026.

-- data em que o diagnóstico foi finalizado (created_at é a data em que o rascunho foi criado)
alter table public.diagnostico add column if not exists concluido_em timestamptz;

-- status das recomendações (plano de ação) de cada empresa.
-- recomendacao_id é o id gerado em services/recomendacoes.py (ex.: rec_q_amb_03_empieza)
create table if not exists public.acoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  recomendacao_id text not null,
  status text not null check (status in ('pendiente', 'en_progreso', 'realizada')),
  atualizado_em timestamptz not null default now(),
  unique (empresa_id, recomendacao_id)
);

alter table public.acoes enable row level security;

-- mesmo padrão da tabela diagnostico: só a dona da empresa lê e altera
create policy "usuario lee sus acciones" on public.acoes for select to authenticated
  using (exists (select 1 from public.empresas e where e.id = acoes.empresa_id and e.user_id = (select auth.uid())));
create policy "usuario crea sus acciones" on public.acoes for insert to authenticated
  with check (exists (select 1 from public.empresas e where e.id = acoes.empresa_id and e.user_id = (select auth.uid())));
create policy "usuario actualiza sus acciones" on public.acoes for update to authenticated
  using (exists (select 1 from public.empresas e where e.id = acoes.empresa_id and e.user_id = (select auth.uid())))
  with check (exists (select 1 from public.empresas e where e.id = acoes.empresa_id and e.user_id = (select auth.uid())));
