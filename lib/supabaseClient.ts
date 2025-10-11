import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/config/env';

export const sbAdmin = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export const sbBrowser = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Default browser client for compatibility
export const supabase = sbBrowser();
