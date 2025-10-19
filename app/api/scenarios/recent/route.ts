export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get('profileId');
  const sb = supabaseAdmin();

  let q = sb
    .from('scenario_simulations')
    .select('id, tax_year, created_at, model, profile_id')
    .order('created_at', { ascending: false })
    .limit(20);
  if (profileId) q = q.eq('profile_id', profileId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, runs: data });
}
