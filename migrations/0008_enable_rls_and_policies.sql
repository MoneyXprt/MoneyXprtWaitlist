-- D2) Enable Row Level Security and add basic ownership policies

-- Enable RLS
alter table tax_profiles enable row level security;
alter table scenario_simulations enable row level security;
alter table saved_strategies enable row level security;

-- Policies: users can manage their own rows only
create policy "own profiles" on tax_profiles
  for all using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy "own scenarios" on scenario_simulations
  for all using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy "own strategies" on saved_strategies
  for all using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

