// Simplified strategist result types for New Analysis rendering

export type Strategy = {
  code: string;
  name: string;
  why: string;
  savingsEst: number;
  risk: 'low' | 'med' | 'high';
  steps: string[];
  warnings?: string[];
};

export type StrategistResult = {
  snapshot: { estTax: number; effRate: number; allowItemize: boolean };
  ranked: Strategy[];
  notes?: string[];
};

