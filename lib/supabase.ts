import { createClient } from '@supabase/supabase-js';

export function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
    { auth: { persistSession: false } }
  );
}

// Browser client persists session (localStorage) so user stays logged in
export function sbBrowser() {
  // Extract the correct URL from DATABASE_URL for now
  const dbUrl = process.env.DATABASE_URL;
  const supabaseUrl = dbUrl ? `https://ayeckgcillxfivvnyhaj.supabase.co` : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  console.log('Supabase config attempt:', { 
    url: supabaseUrl, 
    keyPrefix: supabaseAnonKey?.substring(0, 20) + '...'
  });
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}