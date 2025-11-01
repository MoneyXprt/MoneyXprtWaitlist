import type { UserProfile } from '../gates';

/**
 * estSTR: First-year bonus on furnishings/improvements (≈60% of $40k implied spend) × marginal rate proxy (use 0.35).
 */
export function estSTR(_profile: UserProfile): number {
  const impliedSpend = 40_000;
  const bonusPct = 0.60; // portion eligible for bonus/short-life
  const mtr = 0.35;
  const writeoff = impliedSpend * bonusPct; // e.g., $24k
  const savings = writeoff * mtr;           // e.g., ~$8.4k
  return Math.round(Math.max(0, savings));
}
