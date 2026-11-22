-- Aplicado no Supabase em 22/11/2026.
-- Empresas que dejan huella positiva: atividades ambientais de cada empresa.
-- Os resultados (participantes, kg etc.) só contam no resumo quando estado = 'realizada'.
create table if not exists public.actividades (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  tipo text not null check (tipo in ('limpieza_playa', 'limpieza_rio', 'limpieza_bosque', 'reforestacion', 'areas_verdes', 'reciclaje', 'educacion', 'voluntariado', 'otra')),
  titulo text not null check (char_length(titulo) between 2 and 120),
  fecha date not null,
  lugar text check (char_length(lugar) <= 160),
  estado text not null default 'planificada' check (estado in ('planificada', 'realizada')),
  participantes integer not null default 0 check (participantes >= 0),
  horas_voluntariado numeric(10,1) not null default 0 check (horas_voluntariado >= 0),
  kg_residuos numeric(10,1) not null default 0 check (kg_residuos >= 0),
  arboles_plantados integer not null default 0 check (arboles_plantados >= 0),
  espacio_recuperado text check (char_length(espacio_recuperado) <= 160),
  notas text check (char_length(notas) <= 1000),
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists actividades_empresa_fecha_idx on public.actividades (empresa_id, fecha);

alter table public.actividades enable row level security;

-- mesmo padrão das outras tabelas: só a dona da empresa lê, cria, altera e apaga
create policy "usuario lee sus actividades" on public.actividades for select to authenticated
  using (exists (select 1 from public.empresas e where e.id = actividades.empresa_id and e.user_id = (select auth.uid())));
create policy "usuario crea sus actividades" on public.actividades for insert to authenticated
  with check (exists (select 1 from public.empresas e where e.id = actividades.empresa_id and e.user_id = (select auth.uid())));
create policy "usuario actualiza sus actividades" on public.actividades for update to authenticated
  using (exists (select 1 from public.empresas e where e.id = actividades.empresa_id and e.user_id = (select auth.uid())))
  with check (exists (select 1 from public.empresas e where e.id = actividades.empresa_id and e.user_id = (select auth.uid())));
create policy "usuario borra sus actividades" on public.actividades for delete to authenticated
  using (exists (select 1 from public.empresas e where e.id = actividades.empresa_id and e.user_id = (select auth.uid())));
