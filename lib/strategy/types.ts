export type StrategyItem = {
  code: string;
  name: string;
  category: string;
  savingsEst: number;
  risk: number;          // 1..5
  steps: string[];
  docs?: string[];
  highRisk?: boolean;
  states?: string[];
  notes?: string[];      // NEW: caveats, state notes
};

export type Snapshot = {
  profile?: { filingStatus?: string };
  income?: { w2?: number; k1?: number; se?: number };
  properties?: Array<{ type: "rental" | "primary" | "land"; basis?: number; rentals?: number }>;
  entities?: Array<{ type: "S-Corp" | "Partnership" | "LLC" | "C-Corp"; wages?: number }>;
  dependents?: number;
  settings?: { year?: number; states?: string[]; highRisk?: boolean };
};

export type PlanConflict = {
  kind: "missing_prereq" | "ordering" | "exclusive";
  message: string;
  codes: string[]; // involved strategy codes
};

export type PlanResult = {
  items: StrategyItem[];
  conflicts: PlanConflict[];
};
