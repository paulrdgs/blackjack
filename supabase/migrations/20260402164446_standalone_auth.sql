-- Retirer la FK vers auth.users (on gère l'auth nous-mêmes)
alter table public.users drop constraint users_pkey cascade;
alter table public.users
  add primary key (id),
  alter column id set default gen_random_uuid();

-- Remettre password_hash
alter table public.users add column password_hash text not null default '';

-- Re-créer les FK des autres tables vers users
alter table public.parties
  add constraint parties_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table public.prets
  add constraint prets_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table public.amis
  add constraint amis_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table public.amis
  add constraint amis_ami_id_fkey foreign key (ami_id) references public.users(id) on delete cascade;

alter table public.skins
  add constraint skins_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

-- Mettre à jour les RLS : remplacer auth.uid() par des policies simples
-- (les opérations sensibles passent par le service_role côté serveur)

-- USERS : select public, le reste via service_role
drop policy if exists "Profils visibles par tous" on public.users;
drop policy if exists "Modifier son propre profil" on public.users;
drop policy if exists "Insertion a l inscription" on public.users;

create policy "Lecture publique des profils"
  on public.users for select
  using (true);

-- PARTIES
drop policy if exists "Voir ses parties" on public.parties;
drop policy if exists "Creer ses parties" on public.parties;

create policy "Lecture publique des parties"
  on public.parties for select
  using (true);

-- PRETS
drop policy if exists "Voir ses prets" on public.prets;
drop policy if exists "Creer ses prets" on public.prets;
drop policy if exists "Modifier ses prets" on public.prets;

create policy "Lecture publique des prets"
  on public.prets for select
  using (true);

-- AMIS
drop policy if exists "Voir ses amis" on public.amis;
drop policy if exists "Ajouter un ami" on public.amis;
drop policy if exists "Supprimer un ami" on public.amis;

create policy "Lecture publique des amis"
  on public.amis for select
  using (true);

-- SKINS
drop policy if exists "Voir ses skins" on public.skins;
drop policy if exists "Acheter un skin" on public.skins;
drop policy if exists "Revendre un skin" on public.skins;

create policy "Lecture publique des skins"
  on public.skins for select
  using (true);
