// lib/strategy/calcs/state_ptet_basic.ts
type CalcContext = any;
type StrategyCalcFn = (ctx: any) => any;

// Simplified PTET estimate: if state has PTET, apply state PTET rate to pass-through income
// to approximate federal benefit (deductible at entity level). This is a rough MVP only.

function sum(nums: number[]) {
  return nums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export const statePtetBasic: StrategyCalcFn = (ctx: CalcContext) => {
  const state = ctx.profile.primaryState;
  const passThruIncome = sum(
    ctx.income
      .filter((i) => i.source === 'k1' || i.source === '1099' || i.source === 'schc')
      .map((i) => i.amount)
  );

  if (passThruIncome <= 0) return null;
  const sp = (ctx.stateParams?.[state] as any) || {};
  if (!sp.ptet_available) return null;

  const rate = Number(sp.ptet_rate ?? 0);
  if (!(rate > 0)) return null;

  // entity-level deduction reduces federal taxable income: savings ~ rate * passThru * marginal rate
  const marginal = 0.35; // proxy
  const deductible = passThruIncome * rate;
  const savingsEst = deductible * marginal;
  return {
    savingsEst,
    flags: { passThruIncome, rate, marginal },
    riskScore: 2,
    complexity: 2,
    steps: [
      { label: 'Elect PTET with state portal', due: '12-31' },
      { label: 'Coordinate estimated payments at entity level' },
    ],
  };
};

export default statePtetBasic as StrategyCalcFn;
