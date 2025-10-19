export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('scenario_simulations')
    .select('id, tax_year, created_at, model, scenario_data, user_message, answer')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, run: data });
}
