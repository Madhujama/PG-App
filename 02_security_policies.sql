-- 02_security_policies.sql — run SECOND in the NEW Supabase project.
-- Admin identity is malleshwari.c69@gmail.com. No service-role key is needed by the website.

-- Residents: public can submit a new registration, but cannot read resident records.
grant insert on public.residents to anon, authenticated;
grant select, update on public.residents to authenticated;
drop policy if exists "Public can submit registration" on public.residents;
create policy "Public can submit registration" on public.residents
  for insert to anon, authenticated with check (true);
drop policy if exists "Admin can view residents" on public.residents;
create policy "Admin can view residents" on public.residents
  for select to authenticated
  using (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
drop policy if exists "Admin can update residents" on public.residents;
create policy "Admin can update residents" on public.residents
  for update to authenticated
  using (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com')
  with check (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');

-- Meal attendance: only the signed-in admin may read, add, or delete meal rows.
grant select, insert, delete on public.meal_attendance to authenticated;
drop policy if exists "Admin can view meals" on public.meal_attendance;
create policy "Admin can view meals" on public.meal_attendance
  for select to authenticated
  using (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
drop policy if exists "Admin can add meals" on public.meal_attendance;
create policy "Admin can add meals" on public.meal_attendance
  for insert to authenticated
  with check (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
drop policy if exists "Admin can delete meals" on public.meal_attendance;
create policy "Admin can delete meals" on public.meal_attendance
  for delete to authenticated
  using (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');

-- Outside customer directory: admin-only (the current UI stores meal phone/name in meal_attendance).
grant select, insert, update, delete on public.outside_customers to authenticated;
drop policy if exists "Admin can view outside customers" on public.outside_customers;
create policy "Admin can view outside customers" on public.outside_customers
  for select to authenticated
  using (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
drop policy if exists "Admin can add outside customers" on public.outside_customers;
create policy "Admin can add outside customers" on public.outside_customers
  for insert to authenticated
  with check (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
drop policy if exists "Admin can update outside customers" on public.outside_customers;
create policy "Admin can update outside customers" on public.outside_customers
  for update to authenticated
  using (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com')
  with check (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
drop policy if exists "Admin can delete outside customers" on public.outside_customers;
create policy "Admin can delete outside customers" on public.outside_customers
  for delete to authenticated
  using (lower(coalesce(auth.jwt()->>'email','')) = 'malleshwari.c69@gmail.com');
