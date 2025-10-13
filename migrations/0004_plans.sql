-- Plans and plan_versions tables to store user strategy histories
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists plan_versions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  created_at timestamptz not null default now(),
  score_total numeric(6,2) not null default 0,
  score_breakdown jsonb not null,
  strategies jsonb not null,
  narrative jsonb
);

create index if not exists idx_plan_versions_plan_created
  on plan_versions (plan_id, created_at desc);

