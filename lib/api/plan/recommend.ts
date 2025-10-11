import 'server-only';
import { cookies } from 'next/headers';
import { runEngine as runSimpleEngine } from '@/lib/strategy/engine';
import { RecommendBody } from '@/lib/api/schemas';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function recommendStrategies({ snapshot, includeHighRisk, userId }: RecommendBody) {
  const ack = cookies().get('planner_high_risk_ack')?.value === '1';
  const allowHighRisk = !!includeHighRisk && ack;
  // Minimal engine is already filtered; allowHighRisk reserved for future use
  const minimal = runSimpleEngine(snapshot);

  const items = minimal.map((m: any) => ({
    code: m.code,
    strategyId: m.code,
    name: m.name,
    category: m.category,
    savingsEst: m.savingsEst,
    risk: m.risk,
    stepsPreview: (m.steps || []).map((label: string) => ({ label })),
    docs: m.docs || [],
  }));

  const totals = {
    savingsEst: items.reduce((a: number, b: any) => a + (Number(b.savingsEst) || 0), 0),
    risk: Math.round(items.reduce((a: number, b: any) => a + (Number(b.risk) || 0), 0) / Math.max(1, items.length)),
  };

  if (userId && supabaseAdmin) {
    try {
      const { data: reco, error } = await supabaseAdmin
        .from('recommendations')
        .insert({ user_id: userId, snapshot, total_savings_est: String(totals.savingsEst), risk_score: totals.risk, complexity: 0, year: snapshot.profile?.year || new Date().getFullYear() })
        .select()
        .single();
      if (!error && reco?.id) {
        const rows = items.map((it: any) => ({
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

  return { items, totals, missingInputs: [] as string[] };
}

