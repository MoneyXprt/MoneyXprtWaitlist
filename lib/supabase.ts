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
  const supabaseUrl = 'https://ayeckgcillxfivvnyhaj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZWNrZ2NpbGx4Zml2dm55aGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjcxODgsImV4cCI6MjA2ODY0MzE4OH0.5l4EufR-n8izghE5DTbWsweGU_a8im5J4GUnPpiPGTo';
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}