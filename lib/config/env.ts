import { z } from 'zod'

const PublicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_ENABLE_PLANNER: z.string().optional(),
  NEXT_PUBLIC_SKIP_AUTH: z.string().optional(),
  NEXT_PUBLIC_SHOW_DEBUG: z.string().optional(),
})

const ServerSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  PORT: z.string().optional(),
  START_EXPRESS: z.string().optional(),
})

const isServer = typeof window === 'undefined'

const raw = process.env as Record<string, string | undefined>

const publicParsed = PublicSchema.safeParse(raw)
if (!publicParsed.success) {
  // Fail fast in all environments (public vars are required to boot the app)
  const issues = publicParsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
  throw new Error(`Invalid public environment: ${issues}`)
}

let serverParsed: z.SafeParseReturnType<any, any> = { success: true, data: {} }
if (isServer) {
  serverParsed = ServerSchema.safeParse(raw)
  if (!serverParsed.success) {
    const issues = serverParsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    throw new Error(`Invalid server environment: ${issues}`)
  }
}

// Compute canonical site URL (prefer NEXT_PUBLIC_APP_URL, else NEXT_PUBLIC_SITE_URL)
const SITE_URL = publicParsed.data.NEXT_PUBLIC_APP_URL || publicParsed.data.NEXT_PUBLIC_SITE_URL || ''

export const env = {
  ...publicParsed.data,
  ...(serverParsed.success ? serverParsed.data : {}),
  SITE_URL,
}

export type Env = typeof env

