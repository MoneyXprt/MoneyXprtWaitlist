export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('scenario_simulations')
    .select('id, tax_year, created_at, model')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, runs: data });
}

