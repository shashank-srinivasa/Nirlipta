-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create anon role for PostgREST
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
end $$;

-- Expose tables via PostgREST (all access since we run without Supabase auth locally)
create schema if not exists api;

-- Classes
create table if not exists classes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  instructor text not null default 'Ashwini',
  duration_minutes integer not null default 60,
  level text check (level in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')) default 'All Levels',
  price integer not null,
  max_students integer not null default 10,
  schedule_day text check (schedule_day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  schedule_time text,
  image_url text,
  is_active boolean default true,
  category text default 'Hatha',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bookings
create table if not exists bookings (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references classes(id) on delete cascade,
  student_name text not null,
  student_email text not null,
  student_phone text not null,
  booking_date date not null,
  amount_paid integer not null,
  payment_id text unique,
  razorpay_order_id text,
  status text check (status in ('pending','confirmed','cancelled')) default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Gallery
create table if not exists gallery (
  id uuid default uuid_generate_v4() primary key,
  image_url text not null,
  caption text,
  alt_text text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Blog posts
create table if not exists blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contact messages
create table if not exists contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz default now()
);

-- Testimonials
create table if not exists testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text not null,
  text text not null,
  bg_color text not null default 'bg-indigo-700',
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Studio settings (singleton row)
create table if not exists studio_settings (
  id integer primary key default 1 check (id = 1),
  studio_name text default 'Nirlipta',
  tagline text default 'Find your balance, discover your peace',
  about_text text,
  teacher_name text default 'Ashwini Karmbadka',
  teacher_photo_url text,
  footer_tagline text,
  about_heading text,
  about_heading_sub text,
  years_experience text default '15+',
  students_taught text default '400+',
  certification text default '200hr',
  specialisations text default 'Hatha & Vinyasa',
  classes_page_subtitle text,
  blog_page_subtitle text,
  address text,
  phone text,
  whatsapp_number text,
  email text,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  hero_image_url text,
  razorpay_key_id text,
  razorpay_key_secret text,
  updated_at timestamptz default now()
);

insert into studio_settings (id) values (1) on conflict do nothing;

-- Grant PostgREST anon role full access (no Supabase auth in local dev)
grant usage on schema public to anon;
grant all on all tables in schema public to anon;
grant all on all sequences in schema public to anon;

-- Sample classes
insert into classes (title, description, level, price, max_students, schedule_day, schedule_time, category, duration_minutes) values
  ('Morning Hatha Flow', 'Start your day with a grounding hatha practice. Suitable for all levels. Focus on breath, alignment, and gentle movement to awaken the body.', 'All Levels', 50000, 12, 'Monday', '06:30 AM', 'Hatha', 60),
  ('Vinyasa Flow', 'Dynamic, breath-synchronized movement practice that builds strength, flexibility and focus.', 'Intermediate', 70000, 10, 'Wednesday', '07:00 AM', 'Vinyasa', 75),
  ('Yin Yoga', 'Deep, slow-paced practice targeting connective tissues. Perfect for stress relief and flexibility.', 'All Levels', 60000, 15, 'Friday', '06:00 PM', 'Yin', 90),
  ('Pranayama & Meditation', 'Breathwork and meditation session to calm the mind and energize the spirit.', 'Beginner', 40000, 20, 'Saturday', '07:00 AM', 'Meditation', 45),
  ('Power Yoga', 'Athletic, fitness-based approach to vinyasa-style yoga. Build strength and endurance.', 'Advanced', 80000, 8, 'Tuesday', '06:00 AM', 'Power', 60),
  ('Restorative Yoga', 'Gentle, healing practice using props to support the body in passive poses. Perfect for recovery.', 'All Levels', 55000, 15, 'Sunday', '09:00 AM', 'Restorative', 75);

-- Sample testimonials
insert into testimonials (name, role, text, bg_color, sort_order) values
  ('Divya R.', 'Student, 2 years', 'Four studios in Bengaluru before this one. Ashwini''s the only teacher I''ve stayed with. The practice is rigorous and the environment isn''t performative. That combination is harder to find than it should be.', 'bg-indigo-700', 0),
  ('Karthik M.', 'Beginner, 8 months', 'I came in completely stiff, told her as much. She didn''t oversell what yoga would do for me. Just said we''d start with what I had. That honesty made it easy to keep coming back.', 'bg-forest-700', 1),
  ('Sneha B.', 'Morning Hatha student', 'The 6:30 AM class is the one thing I don''t negotiate away when my week gets busy. Ashwini teaches with enough structure that you''re challenged, and enough ease that you''re not anxious.', 'bg-[#5C2D0A]', 2);
