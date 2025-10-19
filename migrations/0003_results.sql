create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  is_public boolean not null default true,
  filing_status text not null,
  household_agi text not null,
  primary_goal text not null,
  payload jsonb not null
);

create index if not exists idx_results_public_id on public.results(public_id);

alter table public.results enable row level security;

create policy if not exists "read_public_results"
on public.results for select
to anon
using (is_public = true);

