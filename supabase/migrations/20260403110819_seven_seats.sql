-- Extend seats from 0-4 to 0-6 (7 seats)
alter table public.room_players drop constraint if exists room_players_seat_index_check;
alter table public.room_players add constraint room_players_seat_index_check check (seat_index between 0 and 6);

-- Update max_players default to 7
alter table public.rooms alter column max_players set default 7;
