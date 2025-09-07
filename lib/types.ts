// lib/types.ts
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

export type PlanInput = {
  /** Step 1 — Discovery */
  goals5y: string[];
  goals20y: string[];
  freedomDef: string;
  confidence: number; // 1–10

  /** Step 2 — Cash flow & income */
  salary: number;
  bonus: number;
  selfEmployment: number;
  rsuVesting: number;
  k1Active: number;
  k1Passive: number;
  otherIncome: number;
  rentNOI: number;

  fixedMonthlySpend: number;  // housing, utilities, insurance, etc.
  lifestyleMonthlySpend: number; // dining, travel, etc.
  savingsMonthly: number;     // what they already save / mo

  /** Step 3 — Balance sheet */
  cash: number;
  brokerage: number;
  retirement: number; // 401k/IRA/Roth aggregate
  hsa: number;
  realEstateEquity: number;
  privateEquityVC: number;
  crypto: number;

  mortgageDebt: number;
  studentLoans: number;
  autoLoans: number;
  creditCards: number;
  otherDebt: number;

  /** Step 4 — Taxes (non-sensitive) */
  filingStatus: FilingStatus;
  state: string;
  itemizeLikely: boolean;
  charitableInclination: boolean;
  entityOrSideBiz: boolean;

  /** Step 5 — Retirement & wealth building */
  targetRetireAge: number;
  targetRetireIncomeMonthly: number;
  usingRothBackdoor: boolean;
  usingMegaBackdoor: boolean;
  hasPensionOrDeferredComp: boolean;

  /** Step 6 — Risk & protection */
  emergencyFundMonths: number;
  hasTermLife: boolean;
  hasDisability: boolean;
  hasUmbrella: boolean;
  concentrationRisk: boolean; // e.g. single stock/asset

  /** Step 7 — Estate & legacy */
  hasWillOrTrust: boolean;
  expectsInheritance: boolean;
  givingIntent: boolean; // DAF/charitable
};

export const EMPTY_PLAN: PlanInput = {
  // 1
  goals5y: ['', '', ''],
  goals20y: ['', '', ''],
  freedomDef: '',
  confidence: 5,

  // 2
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

  // 3
  cash: 0,
  brokerage: 0,
  retirement: 0,
  hsa: 0,
  realEstateEquity: 0,
  privateEquityVC: 0,
  crypto: 0,

  mortgageDebt: 0,
  studentLoans: 0,
  autoLoans: 0,
  creditCards: 0,
  otherDebt: 0,

  // 4
  filingStatus: 'single',
  state: 'CA',
  itemizeLikely: false,
  charitableInclination: false,
  entityOrSideBiz: false,

  // 5
  targetRetireAge: 60,
  targetRetireIncomeMonthly: 0,
  usingRothBackdoor: false,
  usingMegaBackdoor: false,
  hasPensionOrDeferredComp: false,

  // 6
  emergencyFundMonths: 3,
  hasTermLife: false,
  hasDisability: false,
  hasUmbrella: false,
  concentrationRisk: false,

  // 7
  hasWillOrTrust: false,
  expectsInheritance: false,
  givingIntent: false,
};