import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/db/schema';
import { env } from '@/lib/config/env';

// Type for the Supabase client with your database schema
type SupabaseClientType = SupabaseClient<Database>;

// Singleton instances to avoid repeated client creation
let adminClient: SupabaseClientType | null = null;
let browserClient: SupabaseClientType | null = null;

// Server-side admin client (use Service Role; never expose to browser)
export function sbAdmin(): SupabaseClientType {
  // Return mock client in development mode
  if (env.public.NEXT_PUBLIC_SKIP_AUTH === 'true') {
    return createClient('http://localhost:54321', 'dummy-key', {
      auth: { persistSession: false },
    }) as SupabaseClientType;
  }
  if (!adminClient) {
    if (!env.public.NEXT_PUBLIC_SUPABASE_URL || !env.server.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase URL or Service Role Key in environment variables');
    }
    adminClient = createClient<Database>(env.public.NEXT_PUBLIC_SUPABASE_URL!, env.server.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}

// Browser client (safe to expose the *anon* key only)
export function sbBrowser(): SupabaseClientType {
  // Return mock client in development mode
  if (env.public.NEXT_PUBLIC_SKIP_AUTH === 'true') {
    return createClient('http://localhost:54321', 'dummy-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }) as SupabaseClientType;
  }
  if (!browserClient) {
    if (!env.public.NEXT_PUBLIC_SUPABASE_URL || !env.public.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase URL or Anon Key in environment variables');
    }
    browserClient = createClient<Database>(env.public.NEXT_PUBLIC_SUPABASE_URL!, env.public.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}
