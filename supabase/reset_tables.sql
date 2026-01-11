-- ==========================================
-- BRANDIFLOW SCHEMA FIX (RESET) v2
-- ==========================================
-- 1. Drops old tables conflicting with NextAuth
-- 2. Recreates them with correct links
-- 3. Adds 'role' for Super Admin

-- 1. CLEANUP
drop table if exists public.logos cascade;
drop table if exists public.projects cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.usage_tracking cascade;
drop table if exists public.profiles cascade;

-- 2. RECREATE PROFILES
create table public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar_url text,
  billing_plan text default 'FREE',
  role text default 'user', -- NEW: 'user' or 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  foreign key (id) references next_auth.users(id) on delete cascade
);

-- 3. RECREATE OTHER TABLES
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.logos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  prompt text,
  image_url text,
  storage_path text,
  model_used text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text, 
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.usage_tracking (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  logos_generated_count_month int default 0,
  last_reset_date timestamp with time zone default timezone('utc'::text, now())
);

-- 4. SECURITY & PERMISSIONS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.logos enable row level security;

-- Trigger to handle new users and potentially set ADMIN
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  is_admin boolean;
begin
  -- Check if the email allows admin privileges (Hardcode your email here if desired, or set manually later)
  -- Example: if new.email = 'sabdeo468@gmail.com' then ...
  
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id, 
    new.email, 
    new.name, 
    new.image,
    case when new.email = 'sabdeo468@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;
