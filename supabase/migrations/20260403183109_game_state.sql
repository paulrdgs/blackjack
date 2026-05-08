-- Store the entire game round state as JSONB on the room
alter table public.rooms add column game_state jsonb;

-- Track round number for the room
alter table public.rooms add column round_number integer not null default 0;
