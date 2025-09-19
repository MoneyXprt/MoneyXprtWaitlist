import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/schema'; // Adjust path to your schema.ts

// Type for the Supabase client with your database schema
type SupabaseClientType = SupabaseClient<Database>;

// Singleton instances to avoid repeated client creation
let adminClient: SupabaseClientType | null = null;
let browserClient: SupabaseClientType | null = null;

// Server-side admin client (use Service Role; never expose to browser)
export function sbAdmin(): SupabaseClientType {
  if (!adminClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase URL or Service Role Key in environment variables');
    }
    adminClient = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}

// Browser client (safe to expose the *anon* key only)
export function sbBrowser(): SupabaseClientType {
  if (!browserClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase URL or Anon Key in environment variables');
    }
    browserClient = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}
