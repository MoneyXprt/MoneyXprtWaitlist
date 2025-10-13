create table if not exists user_settings (
  user_id uuid primary key,
  weights jsonb,
  updated_at timestamptz not null default now()
);

