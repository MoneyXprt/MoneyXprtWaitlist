-- D1) Add an auth_user_id column to key tables for per-user association

alter table tax_profiles
  add column if not exists auth_user_id uuid;

alter table scenario_simulations
  add column if not exists auth_user_id uuid;

alter table saved_strategies
  add column if not exists auth_user_id uuid;

