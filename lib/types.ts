// lib/types.ts

// ---------- Shared enums / simple types ----------
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';
export type Month = 1|2|3|4|5|6|7|8|9|10|11|12;
export type DistributionStyle = 'lump' | 'schedule';
export type PropertyUse = 'primary_home' | 'second_home' | 'rental' | 'land';

// ---------- Profile / residency ----------
export interface ResidencyItem {
  state: string;
  startDate: string;
  endDate?: string;
  primary?: boolean;
}

// ---------- Assets ----------
export interface Property {
  id: string;               // uuid or timestamp
  nickname?: string;
  use: PropertyUse;
  estimatedValue: number;
  mortgageBalance: number;
  interestRate?: number;
  monthlyRent?: number;
  monthlyCosts?: number;    // PITI/HOA/maintenance
  state?: string;           // for 50-state engines
}

export interface AltAssets {
  privateEquityVC?: number;
  collectibles?: number;
  other?: number;
}

// ---------- RSU / ESPP / Deferred Comp ----------
export interface RSUVest {
  month: Month;
  amount: number;           // gross amount vesting that month
}

export interface RSUPlan {
  // Newer structured fields
  eligible?: boolean;
  ticker?: string;
  ytdVestedValue?: number;

  // Canonical annual total (this year)
  yearVestingTotal: number;

  // Optional granular schedule
  schedule?: RSUVest[];
}

export interface ESPP {
  eligible: boolean;
  discountPercent?: number;      // 0..100
  contributionPercent?: number;  // 0..100
  purchaseMonths?: Month[];
}

export interface DeferredComp {
  eligible: boolean;
  electedPercent?: number;        // % of eligible pay deferred
  companyMatchPercent?: number;   // if any
  distribution?: DistributionStyle;
  firstPayoutYear?: number;       // if known
}

export interface DeferredDistribution {
  year: number;
  month: Month;
  gross: number;
  taxWithheld?: number;
}

// ---------- Plan Input ----------
export type PlanInput = {
  // Profile (present in EMPTY_PLAN – include them here)
  firstName: string;
  lastName: string;
  email: string;

  /** Domicile/current state for 50-state engines */
  state: string;
  /** Optional residency history */
  residency?: ResidencyItem[];

  // --- Income (legacy mirrors) ---
  salary: number;
  bonus: number;
  selfEmployment: number;
  k1Active: number;
  k1Passive: number;
  otherIncome: number;
  rentNOI: number;

  // LEGACY MIRROR: annual RSU vest value ($/yr).
  // Keep for UI compatibility; canonical is rsu.yearVestingTotal.
  rsuVesting?: number;

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

  // --- Debts (non-property totals; while properties evolve) ---
  mortgageDebt: number;
  studentLoans: number;
  autoLoans: number;
  creditCards: number;
  otherDebt: number;

  // --- Taxes / Filing ---
  filingStatus: FilingStatus;
  itemizeLikely: boolean;
  charitableInclination: boolean;
  entityOrSideBiz: boolean;

  // --- Risk / Estate ---
  hasDisability: boolean;
  hasTermLife: boolean;
  hasUmbrella: boolean;
  hasWillOrTrust: boolean;
  hasPensionOrDeferredComp: boolean;

  // Estate.tsx fields
  expectsInheritance: boolean;
  givingIntent: boolean;

  // --- Goals / Preferences ---
  emergencyFundMonths: number;
  targetRetireIncomeMonthly: number;
  /** Optional — used by Retirement.tsx UI */
  targetRetireAge?: number;
  usingRothBackdoor: boolean;
  usingMegaBackdoor: boolean;
  concentrationRisk: boolean;

  // --- Discovery mirrors (optional) ---
  discovery?: {
    goals5?: string[];
    goals20?: string[];
    freedom?: string;
    confidence?: number;
  };
  goals5y: string[];
  goals20y: string[];
  freedomDef: string;
  confidence: number;

  /** ---------- Structured compensation ---------- */
  /** W-2 base salary (kept separate so we can evolve comp UX) */
  w2BaseAnnual: number;

  /** Annual target/expected cash bonus */
  bonusPlanAnnual: number;

  /** Cash bonuses already received this year */
  bonusYTD: number;

  /** Structured RSU details; canonical source for RSU */
  rsu: RSUPlan;

  /** ESPP (structured) */
  espp: ESPP;

  /** Non-qualified deferred comp (election inputs) */
  deferredComp: DeferredComp;

  /** Optional: explicit deferred payouts (future) */
  deferred: DeferredDistribution[];
};

// ---------- Default EMPTY_PLAN aligned 1:1 with PlanInput ----------
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
  rsuVesting: 0,        // legacy mirror of rsu.yearVestingTotal
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

  // Estate.tsx mirrors
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

  // Structured comp defaults
  w2BaseAnnual: 0,
  bonusPlanAnnual: 0,
  bonusYTD: 0,
  rsu: { eligible: false, ticker: '', ytdVestedValue: 0, yearVestingTotal: 0, schedule: [] },
  espp: { eligible: false, discountPercent: 0, contributionPercent: 0, purchaseMonths: [] },
  deferredComp: { eligible: false },
  deferred: [],
};

// ---------- Helper to keep mirror in sync (optional) ----------
export function normalizePlanInput(p: PlanInput): PlanInput {
  const yearTotal = p.rsu?.yearVestingTotal ?? 0;
  return {
    ...p,
    rsuVesting: p.rsuVesting ?? yearTotal,
    rsu: { ...p.rsu, yearVestingTotal: p.rsu?.yearVestingTotal ?? (p.rsuVesting ?? 0) },
  };
}