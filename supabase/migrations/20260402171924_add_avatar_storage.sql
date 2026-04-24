-- Créer le bucket avatars (public pour lecture)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Lecture publique
create policy "Avatars publics en lecture"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Upload via service_role (pas de restriction)
create policy "Upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars');
