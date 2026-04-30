-- Make room code unique and longer (7 chars)
alter table public.rooms add constraint rooms_code_unique unique (code);
