-- Aplicado no Supabase em 22/11/2026.
-- Análisis con IA: uma análise por diagnóstico concluído (gerada pelo Gemini no back-end).
-- "geracoes" conta a primeira análise + regenerações (o back-end limita a 3 por diagnóstico).
create table if not exists public.analisis_ia (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  diagnostico_id uuid not null unique references public.diagnostico(id) on delete cascade,
  conteudo jsonb not null,
  modelo text,
  geracoes integer not null default 1 check (geracoes >= 1),
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists analisis_ia_empresa_idx on public.analisis_ia (empresa_id);

alter table public.analisis_ia enable row level security;

create policy "usuario lee sus analisis" on public.analisis_ia for select to authenticated
  using (exists (select 1 from public.empresas e where e.id = analisis_ia.empresa_id and e.user_id = (select auth.uid())));
create policy "usuario crea sus analisis" on public.analisis_ia for insert to authenticated
  with check (exists (select 1 from public.empresas e where e.id = analisis_ia.empresa_id and e.user_id = (select auth.uid())));
create policy "usuario actualiza sus analisis" on public.analisis_ia for update to authenticated
  using (exists (select 1 from public.empresas e where e.id = analisis_ia.empresa_id and e.user_id = (select auth.uid())))
  with check (exists (select 1 from public.empresas e where e.id = analisis_ia.empresa_id and e.user_id = (select auth.uid())));
