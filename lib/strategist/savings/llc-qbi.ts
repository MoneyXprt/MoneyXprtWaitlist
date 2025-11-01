import type { UserProfile } from '../gates';

/**
 * estLLCQBI: Roughly 20% of side income as QBI deduction × simple marginal rate proxy.
 * Notes: This is a coarse estimator and ignores SSTB/W-2/UBIA limits and phaseouts.
 */
export function estLLCQBI(profile: UserProfile): number {
  const side = Math.max(0, profile.income?.side ?? 0);
  const qbiDeduction = 0.20 * side; // simple taxable cap via non-negative side income
  const mtr = 0.24; // conservative default marginal rate for QBI savings
  const savings = qbiDeduction * mtr;
  return Math.round(Math.max(0, savings));
}
