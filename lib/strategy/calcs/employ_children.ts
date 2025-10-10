// lib/strategy/calcs/employ_children.ts
type StrategyCalcFn = (ctx: any) => any;

// Employ children: wages up to standard deduction; rough savings 10k * marginal
export const employChildren: StrategyCalcFn = (ctx) => {
  // Try to infer dependents from profile ages array or default to 1 for demo
  const dependents = Array.isArray((ctx.profile as any).ages) ? (ctx.profile as any).ages.length : 1;
  if (dependents <= 0) return null;
  const perChild = 13000; // around standard deduction for minors (rough)
  const marginal = 0.24; // conservative
  const savings = dependents * perChild * marginal;
  return {
    savingsEst: savings,
    steps: [
      { label: 'Create age-appropriate job descriptions and timesheets' },
      { label: 'Pay via payroll; withhold as required' },
    ],
    riskScore: 2,
    complexity: 2,
  };
};

export default employChildren;
