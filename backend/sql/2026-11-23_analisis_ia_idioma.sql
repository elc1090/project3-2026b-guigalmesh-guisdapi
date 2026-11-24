-- Análise com IA por idioma da interface (es / pt): uma linha por diagnóstico e idioma.
-- O limite de 3 gerações por diagnóstico continua valendo somando os idiomas (back-end).
-- Aplicar ANTES de publicar o back-end novo.
alter table public.analisis_ia add column if not exists idioma text not null default 'es'
  check (idioma in ('es', 'pt'));

alter table public.analisis_ia drop constraint if exists analisis_ia_diagnostico_id_key;
alter table public.analisis_ia add constraint analisis_ia_diagnostico_idioma_key unique (diagnostico_id, idioma);
