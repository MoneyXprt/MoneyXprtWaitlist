import type { StrategyRule } from './types';
import type { UserProfile } from './gates';

export type ScoreInput = { savingsEst?: number; eligible?: boolean };

/**
 * rankScore: Ranks a strategy using impact (savings) and user alignment bonuses.
 * Base = min(120, savingsEst / 1000). Bonuses per prompt.
 */
export function rankScore(profile: UserProfile, result: ScoreInput, rule: StrategyRule): number {
  const savings = Math.max(0, result?.savingsEst ?? 0);
  let score = Math.min(120, savings / 1000);

  // +10 if eligible
  if (result?.eligible) score += 10;

  // +10 if rule.category === 'RealEstate' and goals include 'buy STR'
  const categoryNorm = String(rule?.category ?? '').toLowerCase().replace(/\s+/g, '-');
  const goals = (profile?.goals ?? []).map((g) => g.toLowerCase());
  if ((categoryNorm === 'real-estate' || categoryNorm === 'realestate') && goals.some((g) => g.includes('buy str'))) {
    score += 10;
  }

  // +10 if rule.code === 'LLC-QBI' and income.side > 0
  const codeNorm = String(rule?.code ?? '').toLowerCase();
  if ((codeNorm === 'llc-qbi' || codeNorm === 'llcqbi' || codeNorm === 'llc_qbi') && (profile?.income?.side ?? 0) > 0) {
    score += 10;
  }

  return Math.round(score);
}

