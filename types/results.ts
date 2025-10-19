// Shared result data contract for AI outputs and UI rendering.
// Money units: keep numbers in dollars for now (UI formats).
// If you prefer cents later, flip one formatter and update this alias.

export type Money = number; // dollars

export type TopAction = {
  /** e.g., "Buy $350k STR, cost-seg this year" */
  title: string;
  /** 1–2 lines explaining the impact */
  whyItMatters: string;
  /** + saves taxes; - increases taxes */
  estTaxImpact: Money;
  /** Down payment, fees, etc. */
  cashNeeded: Money;
  difficulty: "Low" | "Med" | "High";
  timeToImplement: "Now" | "30–60d" | "90d+";
  /** Bullet points of key risks */
  risks: string[];
};

export type ResultsV1 = {
  summary: {
    householdAGI: Money;
    filingStatus: string;
    /** e.g., "cut tax by $20k and build assets" */
    primaryGoal: string;
  };
  /** top actions to consider (intended length: 3) */
  top3Actions: TopAction[];
  taxImpact: {
    thisYear: Money;
    nextYear: Money;
    /** cumulative over 5 years */
    '5Year': Money;
  };
  cashPlan: {
    upfront: Money;
    /** net carry (rent – debt – opx) */
    monthlyCarry: Money;
  };
  /** short bullets (audit/eligibility/liquidity) */
  riskFlags: string[];
  /** key model assumptions */
  assumptions: string[];
  /** coarse confidence bands */
  confidence: 0.0 | 0.25 | 0.5 | 0.75 | 1.0;
  disclaimers: string[];
};
