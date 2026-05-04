-- Add new customizable fields to studio_settings
alter table studio_settings
  add column if not exists teacher_name text default 'Ashwini Karmbadka',
  add column if not exists teacher_photo_url text,
  add column if not exists footer_tagline text,
  add column if not exists about_heading text,
  add column if not exists about_heading_sub text,
  add column if not exists years_experience text default '15+',
  add column if not exists students_taught text default '400+',
  add column if not exists certification text default '200hr',
  add column if not exists specialisations text default 'Hatha & Vinyasa',
  add column if not exists classes_page_subtitle text,
  add column if not exists blog_page_subtitle text;

-- Create testimonials table
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

alter table testimonials enable row level security;
create policy "Public can read active testimonials" on testimonials for select using (is_active = true);
create policy "Service role all on testimonials" on testimonials for all using (auth.role() = 'service_role');

-- Seed sample testimonials (only if table is empty)
insert into testimonials (name, role, text, bg_color, sort_order)
select 'Divya R.', 'Student, 2 years',
  'Four studios in Bengaluru before this one. Ashwini''s the only teacher I''ve stayed with. The practice is rigorous and the environment isn''t performative. That combination is harder to find than it should be.',
  'bg-indigo-700', 0
where not exists (select 1 from testimonials);

insert into testimonials (name, role, text, bg_color, sort_order)
select 'Karthik M.', 'Beginner, 8 months',
  'I came in completely stiff, told her as much. She didn''t oversell what yoga would do for me. Just said we''d start with what I had. That honesty made it easy to keep coming back.',
  'bg-forest-700', 1
where (select count(*) from testimonials) < 2;

insert into testimonials (name, role, text, bg_color, sort_order)
select 'Sneha B.', 'Morning Hatha student',
  'The 6:30 AM class is the one thing I don''t negotiate away when my week gets busy. Ashwini teaches with enough structure that you''re challenged, and enough ease that you''re not anxious.',
  'bg-[#5C2D0A]', 2
where (select count(*) from testimonials) < 3;
