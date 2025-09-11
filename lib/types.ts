// lib/types.ts
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

export type PropertyUse = 'primary_home' | 'second_home' | 'rental' | 'land';

// Month of year (1 = Jan … 12 = Dec)
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// A single scheduled payout from a deferred comp plan
export type DeferredDistribution = {
  month: Month;
  amount: number; // USD
};
export interface Property {
  id: string;               // uuid or timestamp ID
  nickname?: string;        // "SF Condo", "Lake House"
  use: PropertyUse;
  estimatedValue: number;   // FMV today
  mortgageBalance: number;  // total outstanding principal
  interestRate?: number;    // % APR
  monthlyRent?: number;     // for rentals (gross)
  monthlyCosts?: number;    // PITI/HOA/maintenance estimate
  state?: string;           // for future 50-state engines
}

export interface AltAssets {
  privateEquityVC?: number;
  collectibles?: number;
  other?: number;
}

export interface PlanInput {
  // --- Income ---
  salary: number;
  bonus: number;
  selfEmployment: number;
  rsuVesting: number;
  k1Active: number;
  k1Passive: number;
  otherIncome: number;
  rentNOI: number;

  // --- Spending / Savings ---
  fixedMonthlySpend: number;
  lifestyleMonthlySpend: number;
  savingsMonthly: number;

  // --- Assets ---
  cash: number;
  brokerage: number;
  retirement: number;
  hsa: number;
  crypto: number;

  // ✅ New structured real estate & “other” assets
  properties: Property[];
  alts?: AltAssets;

  // --- Debts ---
  mortgageDebt: number;   // non-property debts (legacy; can phase out later)
  studentLoans: number;
  autoLoans: number;
  creditCards: number;
  otherDebt: number;

  // --- Taxes / Filing ---
  filingStatus: FilingStatus;
  itemizeLikely?: boolean;
  charitableInclination?: boolean;

  // --- Risk / Estate ---
  hasDisability?: boolean;
  hasTermLife?: boolean;
  hasUmbrella?: boolean;
  hasWillOrTrust?: boolean;

  // --- Goals / Preferences ---
  emergencyFundMonths: number;
  targetRetireIncomeMonthly: number;
  usingRothBackdoor?: boolean;
  usingMegaBackdoor?: boolean;
  concentrationRisk?: boolean;

  // --- Discovery mirrors (optional) ---
  discovery?: {
    goals5?: string[];
    goals20?: string[];
    freedom?: string;
    confidence?: number;
  };
  goals5y?: string[];
  goals20y?: string[];
  freedomDef?: string;
  confidence?: number;
}

export const EMPTY_PLAN: PlanInput = {
  salary: 0,
  bonus: 0,
  selfEmployment: 0,
  rsuVesting: 0,
  k1Active: 0,
  k1Passive: 0,
  otherIncome: 0,
  rentNOI: 0,

  fixedMonthlySpend: 0,
  lifestyleMonthlySpend: 0,
  savingsMonthly: 0,

  cash: 0,
  brokerage: 0,
  retirement: 0,
  hsa: 0,
  crypto: 0,

  properties: [],
  alts: { privateEquityVC: 0, collectibles: 0, other: 0 },

  mortgageDebt: 0,
  studentLoans: 0,
  autoLoans: 0,
  creditCards: 0,
  otherDebt: 0,

  filingStatus: 'single',
  itemizeLikely: false,
  charitableInclination: false,

  hasDisability: false,
  hasTermLife: false,
  hasUmbrella: false,
  hasWillOrTrust: false,

  emergencyFundMonths: 3,
  targetRetireIncomeMonthly: 0,
  usingRothBackdoor: false,
  usingMegaBackdoor: false,
  concentrationRisk: false,

  discovery: undefined,
  goals5y: [],
  goals20y: [],
  freedomDef: '',
  confidence: 5,
};