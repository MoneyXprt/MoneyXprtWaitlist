// lib/strategy/calcs/augusta_280a.ts
import { StrategyCalcFn } from '../types';

// Augusta 280A(g) simple placeholder: 14 days rental of home at fair rate
export const augusta280A: StrategyCalcFn = (ctx) => {
  const daily = 800; // placeholder market daily rate
  const days = 14;
  const savings = daily * days * 0.35; // proxy at 35%
  return {
    savingsEst: savings,
    steps: [
      { label: 'Document 14 separate business-use days (board meetings, retreats)' },
      { label: 'Set reasonable market rate and invoice from entity' },
    ],
    riskScore: 2,
    complexity: 2,
  };
};

export default augusta280A;

