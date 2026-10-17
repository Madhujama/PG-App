-- 03_private_storage.sql — run THIRD in the NEW Supabase project.
-- Creates/keeps the resident document bucket PRIVATE.
insert into storage.buckets (id, name, public)
values ('resident-private-files', 'resident-private-files', false)
on conflict (id) do update set public = false;

grant insert on storage.objects to anon, authenticated;
grant select, update, delete on storage.objects to authenticated;

drop policy if exists "Public can upload registration documents" on storage.objects;
create policy "Public can upload registration documents" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'resident-private-files' and name like 'registration/%');

drop policy if exists "Admin can read resident documents" on storage.objects;
create policy "Admin can read resident documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'resident-private-files' and lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
drop policy if exists "Admin can update resident documents" on storage.objects;
create policy "Admin can update resident documents" on storage.objects
  for update to authenticated
  using (bucket_id = 'resident-private-files' and lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com')
  with check (bucket_id = 'resident-private-files' and lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
drop policy if exists "Admin can delete resident documents" on storage.objects;
create policy "Admin can delete resident documents" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resident-private-files' and lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
