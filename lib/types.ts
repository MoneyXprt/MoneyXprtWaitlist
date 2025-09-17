// Residency information for user profile (e.g., for state residency history)
export interface ResidencyItem {
  state: string;
  startDate: string;
  endDate?: string;
  primary?: boolean;
}
// lib/types.ts
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

/** Numeric month used in schedules (1 = Jan ... 12 = Dec) */
export type Month = 1|2|3|4|5|6|7|8|9|10|11|12;

/** Simple yes/no distribution style for deferred comp */
export type DistributionStyle = 'lump' | 'schedule';

export type PropertyUse = 'primary_home' | 'second_home' | 'rental' | 'land';

export interface Property {
  id: string;               // uuid or timestamp ID
  nickname?: string;        // "SF Condo", "Lake House"
  use: PropertyUse;
  estimatedValue: number;   // FMV today
  mortgageBalance: number;  // outstanding principal
  interestRate?: number;    // % APR
  monthlyRent?: number;     // for rentals (gross)
  monthlyCosts?: number;    // PITI/HOA/maintenance estimate
  state?: string;           // for 50-state engines
}

export interface AltAssets {
  privateEquityVC?: number;
  collectibles?: number;
  other?: number;
}

/** Structured RSU inputs (optional), while keeping legacy rsuVesting mirror */
export interface RSUVest {
  month: Month;
  amount: number;           // gross amount vesting that month
}
export interface RSUPlan {
  /** New fields used by Compensation + Review */
  eligible?: boolean;
  ticker?: string;
  ytdVestedValue?: number;

  /** Existing fields */
  yearVestingTotal: number; // total expected vest this year (gross)
  schedule?: RSUVest[];     // optional granular schedule
}

/** ESPP inputs */
export interface ESPP {
  eligible: boolean;
  discountPercent?: number;      // 0..100
  contributionPercent?: number;  // 0..100
  purchaseMonths?: Month[];
}

/** Deferred comp elections (inputs), separate from actual payouts */
export interface DeferredComp {
  eligible: boolean;
  electedPercent?: number;        // % of eligible pay deferred
  companyMatchPercent?: number;   // if any
  distribution?: DistributionStyle;
  firstPayoutYear?: number;       // if known
}

/** Deferred comp payouts (for future use if needed) */
export interface DeferredDistribution {
  year: number;             // payment year (e.g., 2026)
  month: Month;             // payment month (1..12)
  gross: number;            // gross payout
  taxWithheld?: number;     // optional withholding amount
}

export type PlanInput = {
  salary?: number;
  bonus?: number;
  bonusYTD?: number;
  deferredComp?: DeferredComp;
  rsu?: RSU;
  espp?: ESPP;
  selfEmployment?: number;
  k1Active?: number;
  k1Passive?: number;
  otherIncome?: number;
  rentNOI?: number;
  // --- Profile (optional, light PII) ---
  firstName?: string;
  lastName?: string;
  email?: string;
  /** Domicile/current state for 50-state engines */
  state?: string;
  /** Optional residency history */
  residency?: ResidencyItem[];

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

  // Structured real estate & “other” assets
  properties: Property[];
  alts?: AltAssets;

  // --- Debts (non-property legacy totals; keep while properties evolve) ---
  mortgageDebt: number;
  studentLoans: number;
  autoLoans: number;
  creditCards: number;
  otherDebt: number;

  // --- Taxes / Filing ---
  filingStatus: FilingStatus;
  itemizeLikely?: boolean;
  charitableInclination?: boolean;
  entityOrSideBiz?: boolean;

  // --- Risk / Estate ---
  hasDisability?: boolean;
  hasTermLife?: boolean;
  hasUmbrella?: boolean;
  hasWillOrTrust?: boolean;
  expectsInheritance?: boolean;   // user expects to receive an inheritance
  givingIntent?: boolean;         // general charitable / giving intent
  hasPensionOrDeferredComp?: boolean;

  // --- Goals / Preferences ---
  emergencyFundMonths: number;
  targetRetireIncomeMonthly: number;
  /** Optional — used by Retirement.tsx UI */
  targetRetireAge?: number;
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

  /** ---------- New structured compensation (optional) ---------- */
  /** W-2 base salary (kept separate so we can evolve comp UX) */
  w2BaseAnnual?: number;

  /** Annual target/expected cash bonus */
  bonusPlanAnnual?: number;

  /** Cash bonuses already received this year */
  bonusYTD?: number;

  /** Structured RSU details; we mirror -> rsuVesting */
  rsu?: RSUPlan;

  /** ESPP */
  espp: ESPP;

  /** Non-qualified deferred comp (election inputs) */
  deferredComp: DeferredComp;

  /** Optional: explicit payout rows if user has a known schedule (not used by Compensation.tsx yet) */
  deferred?: DeferredDistribution[];
}

export const EMPTY_PLAN: PlanInput = {
  // Profile
  firstName: '',
  lastName: '',
  email: '',
  state: '',
  residency: [],

  // Income mirrors
  salary: 0,
  bonus: 0,
  selfEmployment: 0,
  rsuVesting: 0,
  k1Active: 0,
  k1Passive: 0,
  otherIncome: 0,
  rentNOI: 0,

  // Spend / save
  fixedMonthlySpend: 0,
  lifestyleMonthlySpend: 0,
  savingsMonthly: 0,

  // Assets
  cash: 0,
  brokerage: 0,
  retirement: 0,
  hsa: 0,
  crypto: 0,

  properties: [],
  alts: { privateEquityVC: 0, collectibles: 0, other: 0 },

  // Debts
  mortgageDebt: 0,
  studentLoans: 0,
  autoLoans: 0,
  creditCards: 0,
  otherDebt: 0,

  // Taxes / filing
  filingStatus: 'single',
  itemizeLikely: false,
  charitableInclination: false,
  entityOrSideBiz: false,

  // Risk / estate
  hasDisability: false,
  hasTermLife: false,
  hasUmbrella: false,
  hasWillOrTrust: false,
  hasPensionOrDeferredComp: false,

  // Estate.tsx fields
  expectsInheritance: false,
  givingIntent: false,

  // Goals / prefs
  emergencyFundMonths: 3,
  targetRetireIncomeMonthly: 0,
  targetRetireAge: 65,
  usingRothBackdoor: false,
  usingMegaBackdoor: false,
  concentrationRisk: false,

  // Discovery mirrors
  discovery: undefined,
  goals5y: [],
  goals20y: [],
  freedomDef: '',
  confidence: 5,

  // New structured comp defaults
  w2BaseAnnual: 0,
  bonusPlanAnnual: 0,
  bonusYTD: 0,
  rsu: { eligible: false, ticker: '', ytdVestedValue: 0, yearVestingTotal: 0, schedule: [] },
  espp: { eligible: false, discountPercent: 0, contributionPercent: 0, purchaseMonths: [] },
  deferredComp: { eligible: false },
  deferred: [],
};