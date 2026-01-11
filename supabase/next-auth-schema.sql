-- Setup for NextAuth.js with Supabase
-- Run this in your Supabase SQL Editor

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES
create table if not exists users (
  id uuid not null default uuid_generate_v4() primary key,
  name text,
  email text,
  "emailVerified" timestamp with time zone,
  image text
);

create table if not exists accounts (
  id uuid not null default uuid_generate_v4() primary key,
  "userId" uuid not null references users(id) on delete cascade,
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

create table if not exists sessions (
  id uuid not null default uuid_generate_v4() primary key,
  "sessionToken" text not null unique,
  "userId" uuid not null references users(id) on delete cascade,
  expires timestamp with time zone not null
);

create table if not exists verification_tokens (
  identifier text not null,
  token text not null unique,
  expires timestamp with time zone not null,
  
  constraint token_unique unique(identifier, token)
);

-- 3. SYNC WITH PROFILES (Optional but recommended for your app logic)
-- This trigger ensures that when NextAuth creates a user, it also exists in your 'profiles' logic if needed,
-- OR you can simply migrate your app to use the 'users' table instead of 'profiles'.
-- For now, let's keep it simple.
