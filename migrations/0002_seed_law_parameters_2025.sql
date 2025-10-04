-- migrations/0002_seed_law_parameters_2025.sql
-- Minimal 2025 federal limits and parameters

insert into law_parameters (code_ref, eff_start, eff_end, params, version)
values
  ('199A_thresholds', current_date, null, '{"single":191950, "married_joint":383900}', '2025'),
  ('bonus_pct', current_date, null, '{"value":0.6, "notes":"phase-down"}', '2025')
on conflict do nothing;

