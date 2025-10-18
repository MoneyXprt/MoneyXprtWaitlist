#!/usr/bin/env tsx
import { env } from '@/lib/config/env'

const mask = (v?: string) => (!v ? 'MISSING' : v.length > 8 ? `${v.slice(0,4)}…${v.slice(-4)}` : 'SET')

const summary = {
  NEXT_PUBLIC_SITE_URL: env.public.NEXT_PUBLIC_SITE_URL ?? 'MISSING',
  NEXT_PUBLIC_SUPABASE_URL: env.public.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(env.public.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE: mask(env.server.SUPABASE_SERVICE_ROLE),
  OPENAI_API_KEY: mask(env.server.OPENAI_API_KEY),
  STRIPE_SECRET_KEY: mask(env.server.STRIPE_SECRET_KEY),
  STRIPE_WEBHOOK_SECRET: mask(env.server.STRIPE_WEBHOOK_SECRET),
  PLAID_CLIENT_ID: mask(env.server.PLAID_CLIENT_ID),
  PLAID_SECRET: mask(env.server.PLAID_SECRET),
}

console.table(summary)
export {}
