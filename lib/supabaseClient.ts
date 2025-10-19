import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/config/env';

export const sbBrowser = () =>
  createClient(env.public.NEXT_PUBLIC_SUPABASE_URL!, env.public.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Default browser client for compatibility
export const supabase = sbBrowser();
