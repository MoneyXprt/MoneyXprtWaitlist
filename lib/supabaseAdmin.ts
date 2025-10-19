import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db/schema'

let _admin: SupabaseClient<Database> | null = null

/**
 * Returns a Supabase server client using the Service Role key.
 * - Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE from env
 * - Does not persist sessions (server-only)
 */
export function supabaseAdmin(): SupabaseClient<Database> {
  if (_admin) return _admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE')
  }
  _admin = createClient<Database>(url, serviceKey, { auth: { persistSession: false } })
  return _admin
}
