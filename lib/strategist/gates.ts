import type { StrategyRule } from './types';

export type Debt = { name?: string; minPayment: number };
export type Income = { side?: number };
export type Housing = { ownHome?: boolean };
export type Retirement = {
  has401k?: boolean;
  planAllowsAfterTax?: boolean;
  hasNQDC?: boolean;
};

export type UserProfile = {
  cashOnHand: number;
  monthlySurplus: number; // monthly income minus essential spend
  debts?: Debt[];
  income?: Income;
  housing?: Housing;
  goals?: string[]; // e.g., ['buy STR', 'max 401k']
  retirement?: Retirement;
};

export function checkEligibility(profile: UserProfile, rule: StrategyRule): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Liquidity gate
  if (typeof rule.liquidityMin === 'number' && profile.cashOnHand < rule.liquidityMin) {
    reasons.push(
      `Need at least $${Math.round(rule.liquidityMin).toLocaleString()} liquid; you have $${Math.round(profile.cashOnHand).toLocaleString()}`
    );
  }

  // Simple DTI (debt-to-surplus) gate
  if (typeof rule.debtMaxDTI === 'number') {
    const totalMin = (profile.debts ?? []).reduce((sum, d) => sum + (d?.minPayment || 0), 0);
    const denom = Math.max(1, profile.monthlySurplus || 0); // avoid div-by-zero
    const ratio = totalMin / denom;
    if (ratio > rule.debtMaxDTI) {
      reasons.push(
        `Debt-to-surplus ${ratio.toFixed(2)} exceeds threshold ${rule.debtMaxDTI.toFixed(2)} (min payments $${Math.round(totalMin).toLocaleString()}, surplus $${Math.round(denom).toLocaleString()})`
      );
    }
  }

  // Trigger gates
  const t = rule.trigger || {} as Record<string, boolean>;
  const goals = (profile.goals ?? []).map((g) => g.toLowerCase());

  if (t.hasSideIncomeOrConsulting && ((profile.income?.side ?? 0) <= 0)) {
    reasons.push('Requires side income or consulting revenue.');
  }

  if (t.ownsHome && !profile.housing?.ownHome) {
    reasons.push('Requires owning a home.');
  }

  if (t.interestedInSTR) {
    const hasStrGoal = goals.some((g) => g.includes('buy str') || g.includes('short-term rental') || g.includes('start str'));
    if (!hasStrGoal) {
      reasons.push("Goal 'buy STR' (or similar) not present.");
    }
  }

  if (t.has401k && !profile.retirement?.has401k) {
    reasons.push('401(k) not available in current plan.');
  }

  if (t.planAllowsAfterTax && !profile.retirement?.planAllowsAfterTax) {
    reasons.push('Plan does not allow after-tax contributions/in-plan conversions.');
  }

  if (t.hasNQDC && !profile.retirement?.hasNQDC) {
    reasons.push('No NQDC plan eligibility/election.');
  }

  return { ok: reasons.length === 0, reasons };
}

