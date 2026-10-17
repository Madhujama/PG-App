-- 01_schema.sql — run FIRST in the NEW Supabase project SQL Editor.
-- Fresh-project schema for Radha Krishna PG Manager. Does not drop any tables.
create extension if not exists pgcrypto;

create table if not exists public.residents (
  id uuid primary key default gen_random_uuid(),
  joining_date date,
  full_name text not null check (char_length(full_name) between 1 and 120),
  date_of_birth date,
  phone text not null check (char_length(phone) between 3 and 25),
  email text,
  aadhaar_number text,
  government_id_type text check (government_id_type is null or government_id_type in ('Aadhaar','PAN','Driving Licence','Other')),
  college_company_name text,
  college_company_address text,
  parent_guardian_name text not null,
  parent_guardian_phone text not null,
  permanent_address text not null,
  photo_path text,
  government_id_path text,
  college_id_path text,
  signature_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.outside_customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_attendance (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null,
  customer_name text not null,
  resident_id uuid references public.residents(id) on delete set null,
  meal text not null check (meal in ('breakfast','lunch','dinner')),
  meal_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint meal_attendance_customer_meal_date_key unique (customer_id, meal, meal_date)
);

-- Safe migration for projects where the residents table was created by the earlier setup.
alter table public.residents add column if not exists government_id_type text;

create index if not exists residents_active_name_idx on public.residents (is_active, full_name);
create index if not exists meal_attendance_date_meal_idx on public.meal_attendance (meal_date, meal);
create index if not exists meal_attendance_resident_id_idx on public.meal_attendance (resident_id);

alter table public.residents enable row level security;
alter table public.outside_customers enable row level security;
alter table public.meal_attendance enable row level security;
