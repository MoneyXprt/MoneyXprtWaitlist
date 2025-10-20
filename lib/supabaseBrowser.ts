"use client";
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/db/schema'

export function createSupabaseBrowser() {
  const url = (process as any)?.env?.NEXT_PUBLIC_SUPABASE_URL as string | undefined
  const anon = (process as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
  if (!url || !anon) {
    if ((process as any)?.env?.NODE_ENV !== 'production') {
      console.warn('Supabase client disabled: missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY')
    }
    return null
  }
  return createBrowserClient<Database>(url, anon)
}
