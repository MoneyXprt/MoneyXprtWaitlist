import { NextResponse } from 'next/server';
import { buildRecommendations as engineBuild } from '@/lib/strategy/engine';
import STRATEGY_REGISTRY from '@/lib/strategy/registry';
import core from '@/lib/strategy/registry/core.json' assert { type: 'json' };

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { snapshot, selected, includeHighRisk } = (await req.json()) as any;
    if (!snapshot || !Array.isArray(selected)) return NextResponse.json({ error: 'Missing snapshot/selected' }, { status: 400 });

    const all = engineBuild(
      snapshot.profile,
      snapshot.entities || [],
      snapshot.income || [],
      snapshot.properties || [],
      { includeHighRisk: !!includeHighRisk }
    );
    const pick = new Map(all.map((i) => [i.strategyId, i]));
    const items = selected
      .map((code: string) => {
        const meta = STRATEGY_REGISTRY.find((s) => s.id === code);
        const res = pick.get(code);
        if (!meta || !res) return null;
        const coreMeta = (core as any[]).find((c) => c.code === code) as any;
        return {
          code,
          name: meta.name,
          steps: (res.steps || []).map((s: any) => s.label ?? String(s)),
          docs: (coreMeta?.docs as any) || ((meta.requiredInputs as any) || []),
          deadlines: (res.steps || []).map((s: any) => s.due).filter(Boolean),
          riskNotes: [`Risk: ${res.riskScore ?? meta.riskLevel ?? 0}`],
          savingsEst: res.savingsEst || 0,
        };
      })
      .filter(Boolean) as any[];

    const totalSavings = items.reduce((a, b) => a + (b?.savingsEst || 0), 0);
    const year = Number(snapshot.profile?.year || new Date().getFullYear());
    const assumptions = [
      'Estimates only—verify with a CPA before acting.',
      `Assumed tax year ${year}. State rules may vary.`,
    ];
    const overallDocs = Array.from(new Set(items.flatMap((it) => it.docs || [])));
    const overallDeadlines = Array.from(new Set(items.flatMap((it) => it.deadlines || [])));

    const playbook = {
      summary: { count: items.length, totalSavings, year },
      items: items.map((it) => ({ code: it.code, name: it.name, steps: it.steps, docs: it.docs, deadlines: it.deadlines, riskNotes: it.riskNotes })),
      assumptions,
      docs: overallDocs,
      deadlines: overallDeadlines,
    };

    return NextResponse.json(playbook);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
