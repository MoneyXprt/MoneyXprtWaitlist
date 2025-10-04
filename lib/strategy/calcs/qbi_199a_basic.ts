// lib/strategy/calcs/qbi_199a_basic.ts
import { CalcContext, CalcResult, StrategyCalcFn } from '../types';

// Very simplified 199A calculation for MVP.
// Assumptions (MVP):
// - If qbiFlag income present and AGI band not above top threshold, allow 20% of QBI as deduction capped by 20% of taxable income proxy.
// - No SSTB phaseouts, no W-2 wage/UBIA tests for MVP.

function sum(nums: number[]) {
  return nums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export const qbi199aBasic: StrategyCalcFn = (ctx: CalcContext): CalcResult | null => {
  const qbiIncome = sum(
    (ctx.income || [])
      .filter((i: any) => i?.qbiFlag)
      .map((i: any) => Number(i?.amount) || 0)
  );
  if (qbiIncome <= 0) return null;

  // crude proxy for taxable income: AGI estimate less standard deduction (not provided here); keep simple.
  const agi = Number(ctx.profile.agiEstimate ?? 0);
  const taxableProxy = Math.max(0, agi - 30000);

  const qbiDeduction = 0.2 * qbiIncome;
  const cap = 0.2 * taxableProxy;
  const allowed = Math.max(0, Math.min(qbiDeduction, cap));
  if (allowed <= 0) return null;

  return {
    savingsEst: allowed * 0.3, // savings proxy using assumed marginal 30%
    flags: { qbiIncome, qbiAllowed: allowed },
    riskScore: 2,
    complexity: 2,
    steps: [
      { label: 'Confirm QBI classification and SSTB status' },
      { label: 'Confirm wage/UBIA tests where applicable' },
    ],
  };
};

export default qbi199aBasic as StrategyCalcFn;
