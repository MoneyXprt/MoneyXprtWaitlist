// lib/strategy/calcs/re_cost_seg_bonus_basic.ts
type CalcContext = any;
type StrategyCalcFn = (ctx: any) => any;

// Simplified cost segregation + bonus depreciation estimator.
// MVP assumptions: if rental property placed in service and bonus eligible, accelerate ~20-30% of basis in year 1.

export const reCostSegBonusBasic: StrategyCalcFn = (ctx: CalcContext) => {
  const props = ctx.properties || [];
  const year = ctx.profile.year;
  const bonusPct = 0.6; // 60% bonus (example for 2025 phase-down; adjust with lawParams later)
  let totalAccel = 0;

  for (const p of props) {
    if (!p.costBasis || !p.placedInService) continue;
    if (!(p.use === 'rental_res' || p.use === 'rental_comm' || p.use === 'STR')) continue;
    if (p.bonusEligible === false) continue;
    const pisYear = Number((p.placedInService || '').slice(0, 4));
    if (!Number.isFinite(pisYear) || pisYear > year) continue;

    const landPct = Math.min(0.9, Math.max(0, (p.landAllocPct ?? 20) / 100));
    const depreciable = p.costBasis * (1 - landPct);
    const accelPct = 0.25; // portion identified to 5/7/15-year classes via study (rough MVP)
    const amount = depreciable * accelPct * bonusPct;
    if (amount > 0) totalAccel += amount;
  }

  if (totalAccel <= 0) return null;
  const marginal = 0.37; // high-earner proxy
  return {
    savingsEst: totalAccel * marginal,
    cashOutlayEst: 7000, // cost seg study estimate (very rough placeholder)
    flags: { totalAccel, bonusPct, marginal },
    riskScore: 3,
    complexity: 3,
    steps: [
      { label: 'Engage qualified cost segregation provider' },
      { label: 'Coordinate tax reporting with CPA' },
    ],
  };
};

export default reCostSegBonusBasic as StrategyCalcFn;
