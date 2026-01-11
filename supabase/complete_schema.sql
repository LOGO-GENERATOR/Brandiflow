-- ==========================================
-- BRANDIFLOW FINAL COMPLETE SCHEMA (v2)
-- ==========================================

-- 1. SETUP NEXT_AUTH SCHEMA
-- This is REQUIRED for the Supabase Adapter to work.
create schema if not exists next_auth;

grant usage on schema next_auth to service_role, anon, authenticated;

-- 2. NEXTAUTH TABLES (Inside next_auth schema)
create extension if not exists "uuid-ossp";

create table if not exists next_auth.users (
  id uuid not null default uuid_generate_v4() primary key,
  name text,
  email text,
  "emailVerified" timestamp with time zone,
  image text
);

create table if not exists next_auth.accounts (
  id uuid not null default uuid_generate_v4() primary key,
  "userId" uuid not null references next_auth.users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  constraint provider_unique unique(provider, "providerAccountId")
);

create table if not exists next_auth.sessions (
  id uuid not null default uuid_generate_v4() primary key,
  "sessionToken" text not null unique,
  "userId" uuid not null references next_auth.users(id) on delete cascade,
  expires timestamp with time zone not null
);

create table if not exists next_auth.verification_tokens (
  identifier text not null,
  token text not null unique,
  expires timestamp with time zone not null,
  constraint token_unique unique(identifier, token)
);

-- Grant access to tables
grant all privileges on all tables in schema next_auth to service_role;
grant all privileges on all tables in schema next_auth to postgres;
grant select, insert, update, delete on all tables in schema next_auth to anon, authenticated;

-- 3. BUSINESS LOGIC TABLES (PROFILES, PROJECTS, LOGOS)
-- These live in 'public' schema as usual.

create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar_url text,
  billing_plan text default 'FREE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Link to next_auth.users instead of auth.users
  foreign key (id) references next_auth.users(id) on delete cascade
);

-- Trigger: Automatically create a profile when a new User signs up via NextAuth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.name, new.image)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to watch the 'next_auth.users' table
drop trigger if exists on_auth_user_created_profile on next_auth.users;
create trigger on_auth_user_created_profile
  after insert on next_auth.users
  for each row execute procedure public.handle_new_user();


-- Projects
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Logos
create table if not exists public.logos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  prompt text,
  image_url text,
  storage_path text,
  model_used text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text, 
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Usage Tracking
create table if not exists public.usage_tracking (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  logos_generated_count_month int default 0,
  last_reset_date timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.logos enable row level security;

-- IMPORTANT: You must EXPOSE the 'next_auth' schema in Supabase Dashboard:
-- Settings -> API -> Exposed Schemas -> Add "next_auth"
