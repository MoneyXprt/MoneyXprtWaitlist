export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from('tax_profiles')
      .select('id, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, profiles: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'profiles error' }, { status: 500 });
  }
}
