-- Allow a user to occupy multiple seats in the same room
alter table public.room_players drop constraint room_player_unique;

-- Ensure a specific seat can only be taken once per room
alter table public.room_players add constraint room_seat_unique unique (room_id, seat_index);
