export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const a = url.searchParams.get('a');
  const b = url.searchParams.get('b');
  if (!a || !b) return NextResponse.json({ ok:false, error:'Missing a/b ids' }, { status:400 });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('scenario_simulations')
    .select('id, tax_year, created_at, model, scenario_data, user_message, answer')
    .in('id', [a, b]);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });

  // return sorted by created_at
  const runs = (data || []).sort((x: any, y: any) => +new Date(x.created_at) - +new Date(y.created_at));
  return NextResponse.json({ ok:true, runs });
}

