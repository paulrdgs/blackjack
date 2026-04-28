-- Friend requests table
create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),

  constraint friend_request_unique unique (from_user_id, to_user_id),
  constraint no_self_request check (from_user_id != to_user_id)
);

alter table public.friend_requests enable row level security;

create policy "Lecture publique friend_requests"
  on public.friend_requests for select
  using (true);

create index idx_friend_requests_from on public.friend_requests(from_user_id);
create index idx_friend_requests_to on public.friend_requests(to_user_id);
