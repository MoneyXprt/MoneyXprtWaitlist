import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { runEngine as runSimpleEngine } from '@/lib/strategy/engine';
import STRATEGY_REGISTRY from '@/lib/strategy/registry';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { snapshot, includeHighRisk, userId } = (await req.json()) as any;
    if (!snapshot || !snapshot.profile) {
      return NextResponse.json({ error: 'Missing snapshot' }, { status: 400 });
    }

    // High-risk gating requires both toggle and cookie ack
    const ack = cookies().get('planner_high_risk_ack')?.value === '1';
    const allowHighRisk = !!includeHighRisk && ack;

    // Pass 4/8 minimal engine (pure, local). Returns {code,name,category,savingsEst,risk,steps,docs?}
    const minimal = runSimpleEngine(snapshot);

    // Use minimal engine items for display
    const items = minimal.map((m: any) => ({
      code: m.code,
      strategyId: m.code,
      name: m.name,
      category: m.category,
      savingsEst: m.savingsEst,
      risk: m.risk,
      stepsPreview: m.steps.map((label: string) => ({ label })),
      docs: m.docs || [],
    }));

    const totals = {
      savingsEst: items.reduce((a, b) => a + (Number(b.savingsEst) || 0), 0),
      risk: Math.round(items.reduce((a, b) => a + (Number(b.risk) || 0), 0) / Math.max(1, items.length)),
    };

    // Optional persistence when signed in and service key provided
    if (userId && supabaseAdmin) {
      try {
        const { data: reco, error } = await supabaseAdmin
          .from('recommendations')
          .insert({ user_id: userId, snapshot, total_savings_est: String(totals.savingsEst), risk_score: totals.risk, complexity: 0, year: snapshot.profile?.year || new Date().getFullYear() })
          .select()
          .single();
        if (!error && reco?.id) {
          const rows = items.map((it) => ({
            reco_id: reco.id,
            strategy_id: it.strategyId,
            savings_est: String(it.savingsEst || 0),
            cash_outlay_est: String(0),
            state_addbacks: null,
            flags: {},
            steps: it.stepsPreview || [],
          }));
          await supabaseAdmin.from('recommendation_items').insert(rows);
        }
      } catch {}
    }

    return NextResponse.json({ items, totals, missingInputs: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
