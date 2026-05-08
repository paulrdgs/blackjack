-- =============================================
-- BlackJack - Database Schema
-- =============================================

-- 1. USERS
-- =============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text unique not null,
  password_hash text not null,
  avatar text,
  jetons integer not null default 200,

  -- Badges progression (0-5)
  badge_progression integer not null default 0 check (badge_progression between 0 and 5),
  badge_victoires integer not null default 0 check (badge_victoires between 0 and 5),
  badge_jetons integer not null default 0 check (badge_jetons between 0 and 5),
  badge_blackjack integer not null default 0 check (badge_blackjack between 0 and 5),

  -- Badges uniques
  badge_premier_ami boolean not null default false,
  badge_multijoueur boolean not null default false,
  badge_premier_skin boolean not null default false,

  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Tout le monde peut voir les profils (pseudo, avatar, jetons, badges)
create policy "Profils visibles par tous"
  on public.users for select
  using (true);

-- Un utilisateur ne peut modifier que son propre profil
create policy "Modifier son propre profil"
  on public.users for update
  using (auth.uid() = id);

-- Insertion lors de l'inscription
create policy "Insertion a l inscription"
  on public.users for insert
  with check (auth.uid() = id);

-- 2. PARTIES
-- =============================================
create table public.parties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mise integer not null check (mise > 0),
  resultat text not null check (resultat in ('victoire', 'defaite', 'egalite', 'blackjack', 'assurance')),
  gain integer not null,
  type text not null check (type in ('solo', 'multi')),
  created_at timestamptz not null default now()
);

alter table public.parties enable row level security;

-- Un utilisateur voit ses propres parties
create policy "Voir ses parties"
  on public.parties for select
  using (auth.uid() = user_id);

-- Insertion de ses propres parties
create policy "Creer ses parties"
  on public.parties for insert
  with check (auth.uid() = user_id);

-- 3. PRETS
-- =============================================
create table public.prets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  montant integer not null check (montant in (50, 100, 200, 500, 1000)),
  remboursement integer not null,
  rembourse integer not null default 0 check (rembourse >= 0),
  created_at timestamptz not null default now(),

  constraint rembourse_max check (rembourse <= remboursement)
);

alter table public.prets enable row level security;

-- Un utilisateur voit ses propres prets
create policy "Voir ses prets"
  on public.prets for select
  using (auth.uid() = user_id);

-- Insertion de ses propres prets
create policy "Creer ses prets"
  on public.prets for insert
  with check (auth.uid() = user_id);

-- Modification de ses propres prets (remboursement)
create policy "Modifier ses prets"
  on public.prets for update
  using (auth.uid() = user_id);

-- 4. AMIS
-- =============================================
create table public.amis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  ami_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint amis_unique unique (user_id, ami_id),
  constraint pas_ami_soi_meme check (user_id != ami_id)
);

alter table public.amis enable row level security;

-- Un utilisateur voit ses propres amis
create policy "Voir ses amis"
  on public.amis for select
  using (auth.uid() = user_id or auth.uid() = ami_id);

-- Ajouter un ami
create policy "Ajouter un ami"
  on public.amis for insert
  with check (auth.uid() = user_id);

-- Supprimer un ami
create policy "Supprimer un ami"
  on public.amis for delete
  using (auth.uid() = user_id or auth.uid() = ami_id);

-- 5. SKINS
-- =============================================
create table public.skins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  skin_id text not null,
  created_at timestamptz not null default now(),

  constraint skin_unique unique (user_id, skin_id)
);

alter table public.skins enable row level security;

-- Un utilisateur voit ses propres skins
create policy "Voir ses skins"
  on public.skins for select
  using (auth.uid() = user_id);

-- Acheter un skin
create policy "Acheter un skin"
  on public.skins for insert
  with check (auth.uid() = user_id);

-- Revendre un skin
create policy "Revendre un skin"
  on public.skins for delete
  using (auth.uid() = user_id);

-- =============================================
-- INDEX pour les performances
-- =============================================
create index idx_parties_user_id on public.parties(user_id);
create index idx_parties_created_at on public.parties(created_at);
create index idx_prets_user_id on public.prets(user_id);
create index idx_amis_user_id on public.amis(user_id);
create index idx_amis_ami_id on public.amis(ami_id);
create index idx_skins_user_id on public.skins(user_id);
create index idx_users_jetons on public.users(jetons desc);
