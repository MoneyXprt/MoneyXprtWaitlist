#!/usr/bin/env tsx
import { env } from '@/lib/config/env'

function mask(v?: string) {
  if (!v) return 'MISSING'
  if (v.length <= 6) return '******'
  return v.slice(0, 3) + '***' + v.slice(-2)
}

const summary = {
  SITE_URL: env.SITE_URL || 'MISSING',
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: mask((env as any).SUPABASE_SERVICE_ROLE_KEY),
  DATABASE_URL: mask((env as any).DATABASE_URL),
  OPENAI_API_KEY: mask((env as any).OPENAI_API_KEY),
  STRIPE_SECRET_KEY: mask((env as any).STRIPE_SECRET_KEY),
  STRIPE_WEBHOOK_SECRET: mask((env as any).STRIPE_WEBHOOK_SECRET),
}

console.log('Environment summary (masked):')
console.table(summary)

