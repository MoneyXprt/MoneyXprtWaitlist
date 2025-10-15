-- Extend plan_versions to support user-scoped planner history API
alter table if exists plan_versions
  add column if not exists user_id uuid,
  add column if not exists payload jsonb,
  add column if not exists score numeric(6,2),
  add column if not exists breakdown jsonb;

-- Helpful index for history lookups by user
create index if not exists idx_plan_versions_user_created
  on plan_versions (user_id, created_at desc);

