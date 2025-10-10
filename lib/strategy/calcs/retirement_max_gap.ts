// lib/strategy/calcs/retirement_max_gap.ts
type StrategyCalcFn = (ctx: any) => any;

// Estimate tax savings from maxing employee 401(k) deferrals.
export const retirementMaxGap: StrategyCalcFn = (ctx) => {
  const w2Income = (ctx.income || []).filter((i) => i.source === 'w2').reduce((a, b) => a + (b.amount || 0), 0);
  if (w2Income <= 0) return null;
  const limit = 23000; // 2025 employee deferral
  const current = 0; // unknown in snapshot; assume not maxed
  const gap = Math.max(0, limit - current);
  if (gap <= 0) return null;
  const marginal = 0.35;
  return {
    savingsEst: gap * marginal,
    steps: [{ label: 'Increase payroll deferrals to reach 401(k) limit' }],
    riskScore: 1,
    complexity: 1,
  };
};

export default retirementMaxGap;
