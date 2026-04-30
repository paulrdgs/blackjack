-- Rooms table
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  host_id uuid not null references public.users(id) on delete cascade,
  is_private boolean not null default false,
  code text,
  min_bet integer not null default 10,
  max_bet integer not null default 500,
  max_players integer not null default 4,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

create policy "Rooms readable by all"
  on public.rooms for select
  using (true);

create index idx_rooms_status on public.rooms(status);
create index idx_rooms_host on public.rooms(host_id);

-- Room players (who's in which room)
create table public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),

  constraint room_player_unique unique (room_id, user_id)
);

alter table public.room_players enable row level security;

create policy "Room players readable by all"
  on public.room_players for select
  using (true);

create index idx_room_players_room on public.room_players(room_id);
create index idx_room_players_user on public.room_players(user_id);
