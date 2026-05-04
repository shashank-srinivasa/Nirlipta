-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Classes table
create table if not exists classes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  instructor text not null default 'Priya',
  duration_minutes integer not null default 60,
  level text check (level in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')) default 'All Levels',
  price integer not null, -- in paise (INR * 100)
  max_students integer not null default 10,
  schedule_day text check (schedule_day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  schedule_time text,
  image_url text,
  is_active boolean default true,
  category text default 'Hatha',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bookings table
create table if not exists bookings (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references classes(id) on delete cascade,
  student_name text not null,
  student_email text not null,
  student_phone text not null,
  booking_date date not null,
  amount_paid integer not null, -- in paise
  payment_id text unique,
  razorpay_order_id text,
  status text check (status in ('pending','confirmed','cancelled')) default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Gallery table
create table if not exists gallery (
  id uuid default uuid_generate_v4() primary key,
  image_url text not null,
  caption text,
  alt_text text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Blog posts table
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

-- Contact messages table
create table if not exists contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz default now()
);

alter table contact_messages enable row level security;
create policy "Anyone can submit contact" on contact_messages for insert with check (true);
create policy "Service role all on contact_messages" on contact_messages for all using (auth.role() = 'service_role');

-- Studio settings table
create table if not exists studio_settings (
  id integer primary key default 1 check (id = 1), -- singleton row
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
  -- Razorpay credentials (stored in DB so non-technical admins can update via UI)
  razorpay_key_id text,
  razorpay_key_secret text,
  -- 'whatsapp' | 'razorpay' | 'both'
  -- 'both' shows the student a choice at checkout
  payment_mode text default 'whatsapp' check (payment_mode in ('whatsapp', 'razorpay', 'both')),
  updated_at timestamptz default now()
);

-- Testimonials table
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

-- Insert default settings
insert into studio_settings (id) values (1) on conflict do nothing;

-- Row Level Security
alter table classes enable row level security;
alter table bookings enable row level security;
alter table gallery enable row level security;
alter table blog_posts enable row level security;
alter table studio_settings enable row level security;
alter table testimonials enable row level security;

-- Public read policies
create policy "Public can read active classes" on classes for select using (is_active = true);
create policy "Public can read gallery" on gallery for select using (true);
create policy "Public can read published posts" on blog_posts for select using (is_published = true);
create policy "Public can read settings" on studio_settings for select using (true);
create policy "Public can read active testimonials" on testimonials for select using (is_active = true);

-- Booking insert (public can book)
create policy "Anyone can create booking" on bookings for insert with check (true);

-- Service role can do everything (used by admin API routes)
create policy "Service role all on classes" on classes for all using (auth.role() = 'service_role');
create policy "Service role all on bookings" on bookings for all using (auth.role() = 'service_role');
create policy "Service role all on gallery" on gallery for all using (auth.role() = 'service_role');
create policy "Service role all on blog_posts" on blog_posts for all using (auth.role() = 'service_role');
create policy "Service role all on settings" on studio_settings for all using (auth.role() = 'service_role');
create policy "Service role all on testimonials" on testimonials for all using (auth.role() = 'service_role');

-- Storage bucket for gallery
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('classes', 'classes', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('blog', 'blog', true) on conflict do nothing;

-- Storage policies
create policy "Public read gallery" on storage.objects for select using (bucket_id = 'gallery');
create policy "Service role manage gallery" on storage.objects for all using (bucket_id = 'gallery' and auth.role() = 'service_role');
create policy "Public read classes" on storage.objects for select using (bucket_id = 'classes');
create policy "Service role manage classes" on storage.objects for all using (bucket_id = 'classes' and auth.role() = 'service_role');
create policy "Public read blog" on storage.objects for select using (bucket_id = 'blog');
create policy "Service role manage blog" on storage.objects for all using (bucket_id = 'blog' and auth.role() = 'service_role');

-- Indices for common query patterns
create index if not exists idx_classes_active on classes (is_active);
create index if not exists idx_blog_posts_published on blog_posts (is_published, published_at desc);
create index if not exists idx_testimonials_active on testimonials (is_active, sort_order);
create index if not exists idx_bookings_class_id on bookings (class_id);
create index if not exists idx_bookings_status on bookings (status);

-- Sample data
insert into testimonials (name, role, text, bg_color, sort_order) values
  ('Divya R.', 'Student, 2 years', 'Four studios in Bengaluru before this one. Ashwini''s the only teacher I''ve stayed with. The practice is rigorous and the environment isn''t performative. That combination is harder to find than it should be.', 'bg-indigo-700', 0),
  ('Karthik M.', 'Beginner, 8 months', 'I came in completely stiff, told her as much. She didn''t oversell what yoga would do for me. Just said we''d start with what I had. That honesty made it easy to keep coming back.', 'bg-forest-700', 1),
  ('Sneha B.', 'Morning Hatha student', 'The 6:30 AM class is the one thing I don''t negotiate away when my week gets busy. Ashwini teaches with enough structure that you''re challenged, and enough ease that you''re not anxious.', 'bg-[#5C2D0A]', 2)
on conflict do nothing;

insert into classes (title, description, level, price, max_students, schedule_day, schedule_time, category, duration_minutes) values
  ('Morning Hatha Flow', 'Start your day with a grounding hatha practice. Suitable for all levels. Focus on breath, alignment, and gentle movement to awaken the body.', 'All Levels', 50000, 12, 'Monday', '06:30 AM', 'Hatha', 60),
  ('Vinyasa Flow', 'Dynamic, breath-synchronized movement practice that builds strength, flexibility and focus.', 'Intermediate', 70000, 10, 'Wednesday', '07:00 AM', 'Vinyasa', 75),
  ('Yin Yoga', 'Deep, slow-paced practice targeting connective tissues. Perfect for stress relief and flexibility.', 'All Levels', 60000, 15, 'Friday', '06:00 PM', 'Yin', 90),
  ('Pranayama & Meditation', 'Breathwork and meditation session to calm the mind and energize the spirit.', 'Beginner', 40000, 20, 'Saturday', '07:00 AM', 'Meditation', 45),
  ('Power Yoga', 'Athletic, fitness-based approach to vinyasa-style yoga. Build strength and endurance.', 'Advanced', 80000, 8, 'Tuesday', '06:00 AM', 'Power', 60),
  ('Restorative Yoga', 'Gentle, healing practice using props to support the body in passive poses. Perfect for recovery.', 'All Levels', 55000, 15, 'Sunday', '09:00 AM', 'Restorative', 75);
