-- Database tables and RLS policies for MoneyXprt
-- Run these commands in Supabase SQL Editor

-- waitlist table (public insert allowed)
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamp with time zone default now()
);

-- conversations table (owner-only)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  prompt text not null,
  response text not null,
  created_at timestamp with time zone default now(),
  meta jsonb
);

-- Enable RLS
alter table public.waitlist enable row level security;
alter table public.conversations enable row level security;

-- Waitlist policies: allow anyone to insert (no read access)
create policy "waitlist_insert_public" on public.waitlist
for insert to anon, authenticated
with check (true);

create policy "waitlist_no_select" on public.waitlist
for select using (false);

-- Conversations policies: authenticated users can insert/select only their rows
create policy "convo_insert_own" on public.conversations
for insert to authenticated
with check (auth.uid() = user_id);

create policy "convo_select_own" on public.conversations
for select to authenticated
using (auth.uid() = user_id);

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  income_range text,
  entity_type text,
  created_at timestamptz default now()
);

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "profiles_self_select" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_self_upsert" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles_self_update" on public.profiles
for update using (auth.uid() = id);