// lib/recommend.ts

// If you already export PlannerInput from a shared types file, import it instead.
// For now we mirror the shape used in PlannerClient.
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

export type PlannerInput = {
  // 1) Profile
  firstName: string;
  filingStatus: FilingStatus;
  state: string;
  dependents: number;
  age: number;
  spouseAge?: number;
  hdhpEligible: boolean;

  // 2) Income
  w2Income: number;
  bonusIncome: number;
  rsuVestedValue: number;
  isoExerciseBargain: number;
  selfEmploymentNet: number;
  k1Active: number;
  k1Passive: number;
  capGainsShort: number;
  capGainsLong: number;
  qualifiedDividends: number;
  ordinaryDividends: number;
  cryptoGains: number;
  interestIncome: number;
  otherIncome: number;
  rentalUnits: number;
  rentalNOI: number;
  niitSubject: boolean;

  // 3) Pretax deductions / savings
  employee401k: number;
  employer401k: number;
  hsaContrib: number;
  fsaContrib: number;
  solo401kSEP: number;
  contrib529: number;

  // 4) Itemized deductions
  mortgageInterest: number;
  propertyTax: number;
  stateIncomeTaxPaid: number;
  charityCash: number;
  charityNonCash: number;
  medicalExpenses: number;

  // 5) Goals
  targetEffRate: number;
  retireAge: number;
  liquidityNeed12mo: number;
};

// Small helpers
const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

function sum(...nums: number[]) {
  return nums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

function approxAGI(i: PlannerInput) {
  // VERY rough AGI proxy (before standard/itemized): ordinary-ish + gains + passive
  const ordinary =
    i.w2Income + i.bonusIncome + i.selfEmploymentNet + i.k1Active + i.k1Passive +
    i.ordinaryDividends + i.interestIncome + i.otherIncome + i.rentalNOI + i.cryptoGains;
  const equity = i.rsuVestedValue + i.isoExerciseBargain;
  const gains = i.capGainsShort + i.capGainsLong + i.qualifiedDividends;
  // subtract common pre-tax contributions
  const pretax = i.employee401k + i.hsaContrib + i.fsaContrib + i.solo401kSEP;
  return Math.max(0, ordinary + equity + gains - pretax);
}

export function buildRecommendations(input: PlannerInput): string[] {
  const R: string[] = [];

  // --- Quick aggregates
  const agi = approxAGI(input);
  const totalIncome = sum(
    input.w2Income, input.bonusIncome, input.rsuVestedValue, input.isoExerciseBargain,
    input.selfEmploymentNet, input.k1Active, input.k1Passive, input.capGainsShort,
    input.capGainsLong, input.qualifiedDividends, input.ordinaryDividends,
    input.cryptoGains, input.interestIncome, input.otherIncome, input.rentalNOI
  );

  const pretax = sum(input.employee401k, input.hsaContrib, input.fsaContrib, input.solo401kSEP);
  const itemized = sum(
    input.mortgageInterest, input.propertyTax, input.stateIncomeTaxPaid,
    input.charityCash, input.charityNonCash, input.medicalExpenses
  );

  // --- Guardrails / friendly prompts
  if (!input.firstName) {
    R.push('Add your first name to personalize your plan.');
  }

  // --- Retirement savings / deferral strategy
  if (input.employee401k <= 0 && input.w2Income > 0) {
    R.push('Start or increase 401(k) deferrals; consider pre-tax vs Roth based on your marginal rate.');
  } else if (input.employee401k > 0 && totalIncome > 200_000) {
    R.push('Evaluate maximizing 401(k) deferrals; if plan allows, explore Mega Backdoor Roth after-tax contributions.');
  }
  if (input.selfEmploymentNet > 0 && input.solo401kSEP <= 0) {
    R.push('For self-employment income, open a Solo-401k or SEP-IRA to shelter additional income.');
  }

  // --- HSA / FSA
  if (input.hdhpEligible && input.hsaContrib <= 0) {
    R.push('You are HSA-eligible; contribute to HSA for triple tax advantage.');
  }
  if (input.fsaContrib <= 0 && input.w2Income > 0) {
    R.push('If available, consider a Health FSA for predictable medical expenses.');
  }

  // --- Equity comp / ISO / RSU
  if (input.rsuVestedValue > 0) {
    R.push('RSUs vesting this year—confirm withholding is sufficient; consider 83(b)/sell-to-cover and diversification.');
  }
  if (input.isoExerciseBargain > 0) {
    R.push('ISO exercises may trigger AMT—model AMT impact and consider partial exercises/timing.');
  }

  // --- NIIT / investment income
  if (input.niitSubject || sum(input.capGainsLong, input.qualifiedDividends, input.interestIncome, input.rentalNOI) > 0) {
    R.push('Review Net Investment Income Tax exposure; consider tax-loss harvesting, muni bonds, or asset location.');
  }

  // --- Itemized vs standard (rough)
  // (Just a hint; real calc is more complex and filing-status dependent.)
  const roughStandard = 14_000; // placeholder; refine per filing status if desired
  if (itemized > 0) {
    if (itemized > roughStandard) {
      R.push(`You likely itemize—optimize SALT cap, charitable bunching/DAF, and mortgage interest (${fmt(itemized)} vs ~${fmt(roughStandard)} std).`);
    } else {
      R.push(`You likely take the standard deduction—consider bunching charitable gifts (DAF) to exceed standard (~${fmt(roughStandard)}).`);
    }
  }

  // --- 529 / education
  if (input.contrib529 <= 0 && input.dependents > 0) {
    R.push('Consider funding 529 plans; check your state’s deduction/credit for contributions.');
  }

  // --- Liquidity
  if (input.liquidityNeed12mo > 0) {
    R.push(`Reserve at least ${fmt(input.liquidityNeed12mo)} in cash or short-term treasuries to cover 12-month needs.`);
  }

  // --- Effective tax rate target (nudge)
  if (input.targetEffRate > 0 && totalIncome > 0) {
    R.push(`To approach a ${input.targetEffRate}% effective rate, expand pre-tax space (401k/SEP/HSA) and time capital gains across years.`);
  }

  // Always return an array
  return R;
}