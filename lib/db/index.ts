import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/config/env";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  const sql = neon(env.server.DATABASE_URL!);
  _db = drizzle(sql);
  return _db;
}

export type DB = ReturnType<typeof getDb>;
