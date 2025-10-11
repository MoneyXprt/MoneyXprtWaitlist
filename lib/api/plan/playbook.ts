import 'server-only';
import { runEngine as runSimpleEngine } from '@/lib/strategy/engine';
import STRATEGY_REGISTRY from '@/lib/strategy/registry';
import core from '@/lib/strategy/registry/core.json' assert { type: 'json' };
import type { PlaybookBody } from '@/lib/api/schemas';

export async function buildPlaybook({ snapshot, selected }: PlaybookBody) {
  const all = runSimpleEngine(snapshot);
  const pick = new Map(all.map((i: any) => [i.code, i]));
  const items = selected
    .map((code: string) => {
      const meta = STRATEGY_REGISTRY.find((s) => s.id === code);
      const res: any = pick.get(code);
      if (!meta || !res) return null;
      const coreMeta = (core as any[]).find((c) => c.code === code) as any;
      return {
        code,
        name: res.name || meta.name,
        steps: (res.steps || []) as string[],
        docs: (coreMeta?.docs as any) || (((meta as any).docs || (meta as any).requiredInputs) || []),
        deadlines: [],
        riskNotes: [`Risk: ${res.risk ?? (meta as any).riskLevel ?? 0}`],
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

  return {
    summary: { count: items.length, totalSavings, year },
    items,
    assumptions,
    docs: overallDocs,
    deadlines: overallDeadlines,
  };
}

