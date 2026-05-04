-- Add seat_index to room_players
alter table public.room_players add column seat_index integer check (seat_index between 0 and 4);

-- Remove min/max bet from rooms
alter table public.rooms drop column min_bet;
alter table public.rooms drop column max_bet;
