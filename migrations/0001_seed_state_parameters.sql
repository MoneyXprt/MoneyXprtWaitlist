-- migrations/0001_seed_state_parameters.sql
-- Seed PTET availability/rates for CA, NY, TX, FL, WA, IL, MN

insert into state_parameters (state, ptet_available, ptet_rate, conformity, last_reviewed)
values
  ('CA', true, 0.093, '{"notes": "CA PTET elective"}', current_date),
  ('NY', true, 0.10,  '{"notes": "NY PTET elective"}', current_date),
  ('TX', false, 0.0,  '{"notes": "No PIT; PTET N/A"}', current_date),
  ('FL', false, 0.0,  '{"notes": "No PIT; PTET N/A"}', current_date),
  ('WA', false, 0.0,  '{"notes": "No PIT; PTET limited/B&O context"}', current_date),
  ('IL', true, 0.048, '{"notes": "IL PTET elective"}', current_date),
  ('MN', true, 0.0965,'{"notes": "MN PTET elective"}', current_date)
on conflict (state) do update set
  ptet_available = excluded.ptet_available,
  ptet_rate = excluded.ptet_rate,
  conformity = excluded.conformity,
  last_reviewed = excluded.last_reviewed;

