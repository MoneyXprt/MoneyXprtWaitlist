import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = 'https://ayeckgcillxfivvnyhaaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZWNrZ2NpbGx4Zml2dm55aGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjcxODgsImV4cCI6MjA2ODY0MzE4OH0.5l4EufR-n8izghE5DTbWsweGU_a8im5J4GUnPpiPGTo';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface WaitlistEntry {
  id?: string;
  email: string;
  income?: string;
  goal?: string;
  created_at?: string;
}