import { z } from "zod";

// Aligns with requested structure; extend with repo flags we use.
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL: z.string().optional(),
  // repo feature flags
  NEXT_PUBLIC_ENABLE_PLANNER: z.string().optional(),
  NEXT_PUBLIC_SKIP_AUTH: z.string().optional(),
  NEXT_PUBLIC_SHOW_DEBUG: z.string().optional(),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  PLAID_CLIENT_ID: z.string().optional(),
  PLAID_SECRET: z.string().optional(),
  // repo-specific
  DATABASE_URL: z.string().optional(),
  START_EXPRESS: z.string().optional(),
  PORT: z.string().optional(),
});

export const env = {
  public: publicSchema.parse(process.env),
  server: serverSchema.parse(process.env),
};

/**
 * Call this inside the specific route/feature that needs certain vars.
 * Example: assertEnv(["OPENAI_API_KEY"]);
 */
export function assertEnv<K extends keyof typeof env.server>(keys: K[]) {
  for (const k of keys) {
    const v = env.server[k];
    if (!v) throw new Error(`Missing required env: ${String(k)}`);
  }
}

export type Env = typeof env
