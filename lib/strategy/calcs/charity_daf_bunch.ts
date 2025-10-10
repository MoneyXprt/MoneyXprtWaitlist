// lib/strategy/calcs/charity_daf_bunch.ts
type StrategyCalcFn = (ctx: any) => any;

// Rough DAF bunching estimate: assume target giving of $10k and marginal rate 35% for MVP.
export const charityDafBunch: StrategyCalcFn = (ctx) => {
  const agi = Number(ctx.profile.agiEstimate || 0);
  if (!(agi > 150000)) return null;
  const planned = 10000; // MVP assumption
  const marginal = 0.35;
  return {
    savingsEst: planned * marginal,
    steps: [
      { label: 'Open a donor-advised fund (DAF)' },
      { label: 'Contribute appreciated securities if available' },
    ],
    riskScore: 1,
    complexity: 2,
  };
};

export default charityDafBunch;
