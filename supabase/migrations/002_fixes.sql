-- Add recurrence column to classes
alter table classes
  add column if not exists recurrence text default 'weekly'
    check (recurrence in ('daily','weekly','biweekly','monthly','one-time'));

-- Remove bad check constraint on schedule_day (now comma-separated multi-day)
alter table classes drop constraint if exists classes_schedule_day_check;

-- Fix default instructor (was 'Priya')
alter table classes alter column instructor set default 'Ashwini';

-- Allow payment-success page to fetch booking by ID
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'bookings' and policyname = 'Public can read booking by id'
  ) then
    execute 'create policy "Public can read booking by id" on bookings for select using (true)';
  end if;
end $$;

-- Make testimonials.role nullable (students often skip the optional field)
alter table testimonials alter column role drop not null;

-- Admin users table (max 5, supports multiple admins)
create table if not exists admin_users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table admin_users enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'admin_users' and policyname = 'Service role all on admin_users'
  ) then
    execute 'create policy "Service role all on admin_users" on admin_users for all using (auth.role() = ''service_role'')';
  end if;
end $$;
