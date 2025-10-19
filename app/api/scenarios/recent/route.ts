export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const profileId = url.searchParams.get('profileId');

    const sb = supabaseAdmin();
    let q = sb
      .from('scenario_simulations')
      .select('id, tax_year, created_at, model, profile_id')
      .order('created_at', { ascending: false })
      .limit(50);

    if (profileId) q = q.eq('profile_id', profileId);

    const { data, error } = await q;
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, runs: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'scenarios error' }, { status: 500 });
  }
}
