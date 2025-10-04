export type StrategyItem = {
  code: string;
  name: string;
  category: string;
  savingsEst: number;
  risk: number; // 1..5
  steps: string[];
  docs?: string[];
  highRisk?: boolean;
  states?: string[]; // if strategy is state-specific
};

export type Snapshot = {
  profile?: { filingStatus?: string };
  income?: { w2?: number; k1?: number; se?: number };
  properties?: Array<{ type: "rental" | "primary" | "land"; basis?: number; rentals?: number }>;
  entities?: Array<{ type: "S-Corp" | "Partnership" | "LLC" | "C-Corp"; wages?: number }>;
  dependents?: number;
  settings?: { year?: number; states?: string[]; highRisk?: boolean };
};

