// lib/planner/engine.ts

export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

export type PlannerInput = {
  firstName: string;
  filingStatus: FilingStatus;
  state: string;
  dependents: number;
  age: number;
  spouseAge?: number;
  hdhpEligible: boolean;

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

  employee401k: number;
  employer401k: number;
  hsaContrib: number;
  fsaContrib: number;
  solo401kSEP: number;
  contrib529: number;

  mortgageInterest: number;
  propertyTax: number;
  stateIncomeTaxPaid: number;
  charityCash: number;
  charityNonCash: number;
  medicalExpenses: number;

  targetEffRate: number;
  retireAge: number;
  liquidityNeed12mo: number;
};

// --- helper calcs (very simplified — just enough for rules) ---
function totalIncome(x: PlannerInput) {
  return (
    x.w2Income +
    x.bonusIncome +
    x.rsuVestedValue +
    x.isoExerciseBargain +
    x.selfEmploymentNet +
    x.k1Active +
    x.k1Passive +
    x.capGainsShort +
    x.capGainsLong +
    x.qualifiedDividends +
    x.ordinaryDividends +
    x.cryptoGains +
    x.interestIncome +
    x.otherIncome +
    Math.max(0, x.rentalNOI)
  );
}

function preTaxDeductions(x: PlannerInput) {
  // Over-simplified: treat these as pre-tax reducers
  return (
    (x.employee401k || 0) +
    (x.hsaContrib || 0) +
    (x.fsaContrib || 0) +
    (x.solo401kSEP || 0)
  );
}

function estAGI(x: PlannerInput) {
  return Math.max(0, totalIncome(x) - preTaxDeductions(x));
}

// 2024-ish standard deduction ballparks (for UX guidance; not exact for every case)
function standardDeduction(status: FilingStatus) {
  switch (status) {
    case 'single':
    case 'married_separate':
      return 14600;
    case 'married_joint':
      return 29200;
    case 'head':
      return 21900;
  }
}

export function getRecommendations(input: PlannerInput): string[] {
  const recs: string[] = [];
  const agi = estAGI(input);

  // 401(k) employee deferral guidance (generic limits, no catch-up logic here)
  const employee401kLimit = 23000; // baseline; catch-up not modeled
  if (input.w2Income > 0 && input.employee401k < employee401kLimit) {
    recs.push(
      `Increase 401(k) deferrals toward the annual limit (~$${employee401kLimit.toLocaleString()}). ` +
        `This lowers taxable wages and helps target your ${input.targetEffRate}% effective rate.`
    );
  }

  // HSA
  if (input.hdhpEligible) {
    const hsaBase = input.filingStatus === 'married_joint' ? 8300 : 4150; // ballpark family vs individual
    if (input.hsaContrib < hsaBase) {
      recs.push(
        `Top up HSA contributions (target ~$${hsaBase.toLocaleString()}). HSAs are triple tax-advantaged ` +
          `(deductible in, tax-free growth, tax-free qualified withdrawals).`
      );
    }
  }

  // SEP/Solo 401k for self-employment
  if (input.selfEmploymentNet > 0 && input.solo401kSEP <= 0) {
    recs.push(
      `Shelter self-employment income via Solo-401(k) or SEP-IRA. Even a partial-year plan can materially reduce taxable income.`
    );
  }

  // RSU withholding gaps
  if (input.rsuVestedValue > 0) {
    recs.push(
      `Review RSU tax withholding — high earners often underwithhold at vest. Consider extra payroll withholding or estimated payments to avoid penalties.`
    );
  }

  // ISO/AMT
  if (input.isoExerciseBargain > 0) {
    recs.push(
      `ISOs: the bargain element may trigger AMT. Model alternative minimum tax before year-end and consider disqualifying sales or timing to manage AMT exposure.`
    );
  }

  // NIIT
  const niitThreshold =
    input.filingStatus === 'married_joint' ? 250000 : input.filingStatus === 'head' ? 200000 : 200000;
  if (input.niitSubject && agi > niitThreshold) {
    recs.push(
      `You’re likely above the NIIT threshold (~$${niitThreshold.toLocaleString()}). Consider tax-efficient asset location, loss harvesting, and muni bonds to reduce net investment income.`
    );
  }

  // Itemize vs standard: rough comparison using user inputs (not complete)
  const itemized =
    (input.mortgageInterest || 0) +
    Math.min(10000, (input.propertyTax || 0) + (input.stateIncomeTaxPaid || 0)) +
    (input.charityCash || 0) +
    (input.charityNonCash || 0);
  const std = standardDeduction(input.filingStatus);
  if (itemized > 0) {
    if (itemized > std) {
      recs.push(
        `Itemizing likely beats the standard deduction (est. itemized ~$${Math.round(itemized).toLocaleString()} vs standard ~$${std.toLocaleString()}).`
      );
    } else {
      recs.push(
        `Standard deduction may be better this year. Consider *charitable bunching* or donor-advised funds to push itemized deductions above ~$${std.toLocaleString()}.`
      );
    }
  }

  // 529
  if (input.contrib529 > 0) {
    recs.push(
      `Verify your state’s 529 deduction/credit and ensure contributions are routed to a qualifying in-state plan if required.`
    );
  } else {
    recs.push(
      `If education funding is a goal, seed a 529 plan. Many states offer deductions/credits; growth is tax-free for qualified education.`
    );
  }

  // Liquidity
  if (input.liquidityNeed12mo > 0) {
    recs.push(
      `Set aside ~$${input.liquidityNeed12mo.toLocaleString()} in high-yield cash or short-duration Treasuries to match 12-month needs before investing the rest.`
    );
  }

  // Insurance & protection prompts
  recs.push(
    `Review protection: term life (if dependents), own-occupation disability insurance, and an umbrella liability policy (often $1–2M) given income/assets.`
  );

  // Estate/legacy prompts
  recs.push(
    `Ensure you have a will, powers of attorney, and updated beneficiaries. Consider a revocable trust if you want probate avoidance or better asset control.`
  );

  // Prioritize top 3 as headline actions
  const top3 = recs.slice(0, 3).map((r, i) => `Priority ${i + 1}: ${r}`);
  return [...top3, ...recs.slice(3)];
}