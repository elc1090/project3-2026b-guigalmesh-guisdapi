-- O app (front e back) usa 'mediana', mas a regra do banco aceitava 'media':
-- quem escolhia "Mediana empresa" recebia erro ao salvar a empresa.
alter table public.empresas drop constraint empresas_porte_check;
alter table public.empresas add constraint empresas_porte_check check (porte in ('micro', 'pequena', 'mediana'));
