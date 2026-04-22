-- Supprimer la FK résiduelle vers auth.users
alter table public.users drop constraint if exists users_id_fkey;
