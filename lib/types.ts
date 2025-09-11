// lib/types.ts

// ----- Enums & helper types -----
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

export type PropertyUse = 'primary' | 'second' | 'rental' | 'land';

export type DeferredDistribution = 'lump' | 'schedule';

export type Month =
  | 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun'
  | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

export type ResidencyItem = {
  state: string;           // e.g. "CA"
  days: number;            // days lived/worked this year
  wagesAllocated?: number; // optional $ wages allocated to this state
};

export type PropertyItem = {
  use: PropertyUse;
  nickname?: string;           // "Austin Rental", "Lake House"
  marketValue: number;         // today's market value
  mortgageBalance: number;     // current balance
  mortgageRate?: number;       // %
  mortgagePayment?: number;    // monthly payment
  closingDate?: string;        // ISO date
  ytdMortgageInterest?: number;
  ytdPropertyTax?: number;
  ytdInsuranceHOA?: number;
  ytdRentalIncome?: number;
  ytdRentalExpenses?: number;
};

export type DeferredComp = {
  eligible: boolean;
  electedPercent?: number;       // % of eligible pay
  companyMatchPercent?: number;  // if any
  distribution?: DeferredDistribution;
  firstPayoutYear?: number;
};

export type RSUInfo = {
  eligible: boolean;
  ticker?: string;
  ytdVestedValue?: number;    // $ value vested YTD
  yearVestingTotal?: number;  // $ expected total vest this year
};

export type ESPPInfo = {
  eligible: boolean;
  discountPercent?: number;      // e.g., 15
  contributionPercent?: number;  // payroll %
  purchaseMonths?: Month[];      // e.g., ['Jun','Dec']
};

// ----- Main input model (v2) -----
// NOTE: We include some legacy *mirrors* used by existing screens (salary, bonus, rsuVesting, etc.).
// New code should use the structured fields; old code will keep working.
export type PlanInput = {
  // 1) Profile & Residency
  filingStatus: FilingStatus;
  primaryState: string;          // e.g. "CA"
  otherStates: ResidencyItem[];  // for multi-state planning
  dependents: number;
  birthYear?: number;
  accreditedInvestor?: boolean;

  // 2) Compensation (full-year plan + YTD)
  w2BaseAnnual: number;
  bonusPlanAnnual: number;   // full-year expected bonuses (all cash types combined)
  bonusYTD: number;          // cash bonuses received YTD
  selfEmployment?: number;   // 1099/side biz, annual
  k1Active?: number;         // annual
  k1Passive?: number;        // annual
  otherIncome?: number;      // interest/divs/etc, annual
  rentNOI?: number;          // net rental operating income (annual)

  deferredComp: DeferredComp;
  rsu: RSUInfo;
  espp: ESPPInfo;

  // 3) Spending & Liquidity
  fixedMonthlySpend: number;
  lifestyleMonthlySpend: number;
  cash: number;                 // checking/HYSA
  emergencyFundMonths: number;  // target

  // 4) Properties (array)
  properties: PropertyItem[];

  // 5) Other Assets & Accounts (balances today)
  brokerage?: number;
  retirement?: number; // 401k/403b/IRA total
  hsa?: number;
  privateEquityVC?: number;
  crypto?: number;
  college529?: number;
  businessInterests?: number;

  // 6) Debts (non-mortgage)
  studentLoans?: number;
  autoLoans?: number;
  creditCards?: number;
  otherDebt?: number;

  // 7) Insurance & Protection
  hasDisability?: boolean;
  hasTermLife?: boolean;
  termLifeAmount?: number;
  hasUmbrella?: boolean;
  umbrellaAmount?: number;
  healthPlanIsHDHP?: boolean; // HSA eligibility helper

  // 8) Taxes (baseline + prior year)
  ytdFederalWithholding?: number;
  ytdStateWithholding?: number;
  priorYearTaxPaid?: number;
  priorYearRefundOrDue?: number; // positive = refund; negative = amount due
  priorYearItemized?: boolean;
  priorYearItemizedTotal?: number;
  charitableYTD?: number;
  charitablePlanned?: number;

  // 9) Goals & Constraints
  goals12m?: string[]; // up to 3
  goals5y?: string[];
  goals20y?: string[];
  freedomDef?: string; // “financial freedom” definition
  confidence?: number; // 1-10
  requiredLiquidityMonths?: number;
  leverageAversion?: number; // 1-10
  realEstateAppetite?: number; // 1-10

  // ----- Legacy mirrors (keep existing UI working) -----
  // These map to structured fields above. We’ll write them where possible.
  salary?: number;         // mirror of w2BaseAnnual
  bonus?: number;          // mirror of bonusPlanAnnual
  rsuVesting?: number;     // mirror of rsu.yearVestingTotal
  k1ActiveLegacy?: number; // mirror of k1Active
  k1PassiveLegacy?: number;// mirror of k1Passive
};

export const EMPTY_PLAN: PlanInput = {
  filingStatus: 'single',
  primaryState: '',
  otherStates: [],
  dependents: 0,

  w2BaseAnnual: 0,
  bonusPlanAnnual: 0,
  bonusYTD: 0,
  selfEmployment: 0,
  k1Active: 0,
  k1Passive: 0,
  otherIncome: 0,
  rentNOI: 0,

  deferredComp: { eligible: false },
  rsu: { eligible: false },
  espp: { eligible: false },

  fixedMonthlySpend: 0,
  lifestyleMonthlySpend: 0,
  cash: 0,
  emergencyFundMonths: 3,

  properties: [],

  brokerage: 0,
  retirement: 0,
  hsa: 0,
  privateEquityVC: 0,
  crypto: 0,
  college529: 0,
  businessInterests: 0,

  studentLoans: 0,
  autoLoans: 0,
  creditCards: 0,
  otherDebt: 0,

  hasDisability: false,
  hasTermLife: false,
  termLifeAmount: 0,
  hasUmbrella: false,
  umbrellaAmount: 0,
  healthPlanIsHDHP: false,

  ytdFederalWithholding: 0,
  ytdStateWithholding: 0,
  priorYearTaxPaid: 0,
  priorYearRefundOrDue: 0,
  priorYearItemized: false,
  priorYearItemizedTotal: 0,
  charitableYTD: 0,
  charitablePlanned: 0,

  goals12m: ['', '', ''],
  goals5y: ['', '', ''],
  goals20y: ['', '', ''],
  freedomDef: '',
  confidence: 5,
  requiredLiquidityMonths: 3,
  leverageAversion: 5,
  realEstateAppetite: 5,

  // legacy mirrors
  salary: 0,
  bonus: 0,
  rsuVesting: 0,
  k1ActiveLegacy: 0,
  k1PassiveLegacy: 0,
};