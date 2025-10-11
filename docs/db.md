Database schema and migrations

Overview
- Single source of truth lives in `lib/db/schema.ts` (Drizzle ORM).
- Client helper is `lib/db/index.ts` exporting `getDb()` for Neon (serverless/edge-safe).
- Drizzle config points to `lib/db/schema.ts` and outputs SQL to `migrations/`.

Zero‑downtime change guidance
- Backfill path: additive first, destructive later.
  - Add new columns/tables as nullable or with safe defaults.
  - Deploy application reading from both old and new fields if needed.
  - Backfill data in background jobs or migration scripts.
  - Flip reads/writes to the new fields once backfill completes.
  - Only then drop old columns/constraints in a separate migration.
- Avoid long‑running locks: prefer multiple small, additive migrations.
- Always wrap risky changes in transactions when possible.

Supabase RLS reminder
- If using Supabase, enable Row Level Security and define policies for any user‑facing tables (e.g., `profiles`, `usage_daily`, `billing`).
- Re‑evaluate policies whenever adding tables/columns that are read via Supabase client.

Local workflow
- Generate a migration from the current schema:
  - `npm run db:generate`
- Apply the migration to your database:
  - With Drizzle Kit: `npm run db:migrate`
  - Or via Supabase SQL editor: execute SQL files in `migrations/` in order.

