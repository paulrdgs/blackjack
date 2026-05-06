-- Add started_at to track when the countdown started
alter table public.rooms add column started_at timestamptz;

-- Add a "countdown" status
alter table public.rooms drop constraint if exists rooms_status_check;
alter table public.rooms add constraint rooms_status_check check (status in ('waiting', 'countdown', 'playing', 'finished'));
