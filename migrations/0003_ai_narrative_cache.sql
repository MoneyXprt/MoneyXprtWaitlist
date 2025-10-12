-- Create AI narrative cache table and index
create table if not exists ai_narrative_cache (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  input_hash text not null,
  narrative jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_narrative_cache_profile_hash
  on ai_narrative_cache (profile_id, input_hash desc);

