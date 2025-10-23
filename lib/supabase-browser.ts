"use client";

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Safe client creator:
 * - Reads NEXT_PUBLIC_* envs (required for the browser)
 * - Never throws in the client bundle (returns null instead)
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  const url = (process as any)?.env?.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const anon = (process as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anon) {
    if ((process as any)?.env?.NODE_ENV !== 'production') {
      // shows up in DevTools but won't crash the route
      console.warn('Supabase disabled: missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return null;
  }

  return createBrowserClient(url, anon) as unknown as SupabaseClient;
}
