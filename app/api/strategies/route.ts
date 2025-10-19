export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { profileId, scenarioId, title, notes } = await req.json();
    if (!title) return NextResponse.json({ ok:false, error:'Missing title' }, { status:400 });

    const sb = supabaseAdmin();
    const { error } = await sb.from('saved_strategies').insert({
      profile_id: profileId ?? null,
      scenario_id: scenarioId ?? null,
      title, notes: notes ?? ''
    } as any);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}

