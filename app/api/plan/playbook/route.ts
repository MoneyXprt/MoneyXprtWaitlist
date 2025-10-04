import { NextResponse } from 'next/server';
import { buildRecommendations as engineBuild } from '@/lib/strategy/engine';
import STRATEGY_REGISTRY from '@/lib/strategy/registry';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { snapshot, selected, includeHighRisk } = (await req.json()) as any;
    if (!snapshot || !Array.isArray(selected)) return NextResponse.json({ error: 'Missing snapshot/selected' }, { status: 400 });

    const all = engineBuild(snapshot.profile, snapshot.entities || [], snapshot.income || [], snapshot.properties || [], { includeHighRisk: !!includeHighRisk });
    const pick = new Map(all.map((i) => [i.strategyId, i]));
    const items = selected
      .map((id: string) => {
        const meta = STRATEGY_REGISTRY.find((s) => s.id === id);
        const res = pick.get(id);
        if (!meta || !res) return null;
        return {
          id,
          name: meta.name,
          category: meta.category,
          eligible: true,
          steps: res.steps || [],
          deadlines: (res.steps || []).filter((s) => s.due),
          required_docs: meta.requiredInputs || [],
          flags: res.flags || {},
          riskNotes: [`Risk level: ${res.riskScore ?? meta.riskLevel ?? 0}`],
          savingsEst: res.savingsEst || 0,
        };
      })
      .filter(Boolean);

    const playbook = {
      summary: {
        strategies: items.length,
        estSavings: items.reduce((a: number, b: any) => a + (b?.savingsEst || 0), 0),
      },
      assumptions: { year: snapshot.profile?.year, state: snapshot.profile?.primaryState },
      items,
    };

    return NextResponse.json(playbook);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

