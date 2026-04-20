-- password_hash est géré par auth.users, pas besoin de le dupliquer
alter table public.users drop column password_hash;
