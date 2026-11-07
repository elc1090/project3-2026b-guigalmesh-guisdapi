-- Otimizações apontadas pelo Supabase Advisor (performance). Não muda quem pode ver/alterar o quê.
-- Aplicar no SQL Editor do Supabase (ou via MCP/CLI). Tudo numa transação.
begin;

-- 1) Índice da consulta _ultimo() do back-end:
--    where empresa_id = ? and status = ? order by created_at desc limit 1
--    (também cobre a FK diagnostico_empresa_id_fkey, que estava sem índice)
create index if not exists diagnostico_empresa_status_criado_idx
  on public.diagnostico (empresa_id, status, created_at desc);

-- 2) RLS: (select auth.uid()) é avaliado uma vez por consulta, e não uma vez por linha
alter policy "usuario lee su empresa" on public.empresas
  using ((select auth.uid()) = user_id);

alter policy "usuario crea su empresa" on public.empresas
  with check ((select auth.uid()) = user_id);

alter policy "usuario actualiza su empresa" on public.empresas
  using ((select auth.uid()) = user_id);

alter policy "usuario lee sus diagnosticos" on public.diagnostico
  using (exists (
    select 1 from public.empresas e
    where e.id = diagnostico.empresa_id and e.user_id = (select auth.uid())
  ));

alter policy "usuario crea sus diagnosticos" on public.diagnostico
  with check (exists (
    select 1 from public.empresas e
    where e.id = diagnostico.empresa_id and e.user_id = (select auth.uid())
  ));

alter policy "usuario actualiza sus diagnosticos" on public.diagnostico
  using (exists (
    select 1 from public.empresas e
    where e.id = diagnostico.empresa_id and e.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.empresas e
    where e.id = diagnostico.empresa_id and e.user_id = (select auth.uid())
  ));

-- 3) perguntas tinha duas políticas SELECT idênticas (true, authenticated): fica só uma
drop policy if exists "Enable read access for all users" on public.perguntas;

commit;
