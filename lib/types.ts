// lib/types.ts
export type Discovery = {
  goalsY1: string[];   // top 3 (next year)
  goalsY5: string[];   // top 3 (5 years)
  goalsY20: string[];  // top 3 (20 years)
  freedomDef?: string; // "what financial freedom looks like"
  confidence10: number; // 1..10
};

export type PlanInput = {
  discovery: Discovery;
};

export const EMPTY_PLAN: PlanInput = {
  discovery: {
    goalsY1: ['', '', ''],
    goalsY5: ['', '', ''],
    goalsY20: ['', '', ''],
    freedomDef: '',
    confidence10: 5,
  },
};