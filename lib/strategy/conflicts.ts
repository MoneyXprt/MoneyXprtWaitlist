// lib/strategy/conflicts.ts
export type Conflict = { a: string; b?: string; reason: string; severity?: 'warn' | 'block' };

// Simple static rules for MVP. Extend as needed.
const RULES: Conflict[] = [
  { a: 'ptet_state', reason: 'PTET should only be elected once per entity/year', severity: 'warn' },
  { a: 'cost_seg_bonus', reason: 'Duplicate cost segregation selection', severity: 'warn' },
  // examples (not currently in minimal registry):
  { a: '475f_trader', b: 'tlh', reason: '§475(f) trader election conflicts with long-term capital-gains harvesting', severity: 'warn' },
];

export function findConflicts(codes: string[]): Conflict[] {
  const res: Conflict[] = [];
  // duplicate selections
  const counts = codes.reduce<Record<string, number>>((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});
  for (const r of RULES) {
    if (r.b) {
      if ((counts[r.a] || 0) > 0 && (counts[r.b] || 0) > 0) res.push(r);
    } else if ((counts[r.a] || 0) > 1) {
      res.push(r);
    }
  }
  return res;
}

// ---------- Pass 5: richer conflict detector (warnings + invalid) ----------
import type { Snapshot } from './ui/plannerStore';
import type { RecommendationItem as ComplexRecommendationItem } from './types';
import type { RecommendationItem as MiniRecommendationItem } from './reco';

export type ConflictResult = { warnings: string[]; invalid: string[] };

type AnyReco = ComplexRecommendationItem | MiniRecommendationItem | any;

export function detectConflicts(
  selected: string[],
  items: AnyReco[],
  snapshot: Snapshot
): ConflictResult {
  const warnings: string[] = [];
  const invalid: string[] = [];

  // Example 1: cost seg needs at least one bonusEligible property
  if (selected.includes('cost_seg_bonus')) {
    const hasBonus = (snapshot.properties ?? []).some((p: any) => p.bonusEligible && (p.basis ?? 0) > 50000);
    if (!hasBonus) invalid.push('cost_seg_bonus');
  }

  // Example 2: PTET + QBI -> warn to check addbacks/credits interplay
  if (selected.includes('ptet_state') && selected.includes('qbi_199a')) {
    warnings.push('PTET and QBI may interact via state addbacks/credits; verify with CPA.');
  }

  // Example 3: if nothing selected -> warn
  if (selected.length === 0) {
    warnings.push('No strategies selected.');
  }

  return { warnings, invalid };
}
