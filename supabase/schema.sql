-- Profiles (Extended from auth.users)
create table profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  billing_plan text default 'FREE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LogosGenerated
create table logos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  prompt text,
  image_url text, -- Supabase Storage URL
  storage_path text, -- Internal path in bucket
  model_used text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions (Stripe mapping)
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text, -- active, past_due, canceled, etc.
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Usage Tracking
create table usage_tracking (
  user_id uuid references profiles(id) on delete cascade primary key,
  logos_generated_count_month int default 0,
  last_reset_date timestamp with time zone default timezone('utc'::text, now())
);

-- RLS (Row Level Security) Policies (Basic Setup)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table logos enable row level security;
alter table subscriptions enable row level security;
alter table usage_tracking enable row level security;

-- Policies can be added later, e.g., "Users can select their own profile"
