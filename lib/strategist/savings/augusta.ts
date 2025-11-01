import type { UserProfile } from '../gates';

/**
 * estAugusta: FMV daily rent (proxy $400–$600/day → use $500) × ≤14 days × marginal rate proxy (0.32–0.37 → use 0.35).
 */
export function estAugusta(_profile: UserProfile): number {
  const daily = 500; // proxy for local market rate
  const days = 10;   // conservative assumption (<= 14 days allowed)
  const mtr = 0.35;  // proxy marginal rate within 0.32–0.37
  const expense = daily * Math.min(14, Math.max(0, days));
  const savings = expense * mtr;
  return Math.round(Math.max(0, savings));
}
