import { cookies } from 'next/headers'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db/schema'
import { env } from '@/lib/config/env'

const URL = env.public.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = env.public.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClientBrowser(): SupabaseClient<Database> {
  return createBrowserClient<Database>(URL!, ANON!)
}

export function createClientServer(): SupabaseClient<Database> {
  const store = cookies()
  return createServerClient<Database>(URL!, ANON!, {
    cookies: {
      getAll() {
        return store.getAll()
      },
      setAll(list) {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)) } catch {}
      },
    },
  })
}

