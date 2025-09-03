// lib/recommend.ts

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

  // 3) Pretax / savings
  employee401k: number;
  employer401k: number;
  hsaContrib: number;
  fsaContrib: number;
  solo401kSEP: number;
  contrib529: number;

  // 4) Itemized
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

function stdDeduction(status: FilingStatus): number {
  // 2024-ish ballparks; you can refine later or source from a table.
  switch (status) {
    case 'married_joint': return 29200;
    case 'head': return 21900;
    case 'married_separate': return 14600;
    case 'single':
    default: return 14600;
  }
}

function isHighTaxState(state: string): boolean {
  return ['CA','NY','NJ','CT','MD','MA','OR','MN','DC','IL','WA','PA','VA'].includes(state);
}

export function buildRecommendations(input: PlannerInput): string[] {
  const R: string[] = [];

  // --- Quick aggregates
  const totalOrdinaryIncome =
    input.w2Income + input.bonusIncome + input.selfEmploymentNet +
    input.k1Active + input.k1Passive + input.interestIncome +
    input.ordinaryDividends + input.otherIncome + input.cryptoGains;

  const totalCGDiv =
    input.capGainsShort + input.capGainsLong + input.qualifiedDividends;

  const totalIncome = totalOrdinaryIncome + totalCGDiv + input.rentalNOI;

  const pretaxDeferrals =
    input.employee401k + input.hsaContrib + input.fsaContrib + input.solo401kSEP;

  const itemized =
    input.mortgageInterest + input.propertyTax + input.stateIncomeTaxPaid +
    input.charityCash + input.charityNonCash + input.medicalExpenses;

  const standard = stdDeduction(input.filingStatus);
  const usesItemized = itemized > standard;

  // --- General cash flow / savings rate
  if (totalIncome > 0) {
    const impliedSavings = pretaxDeferrals + input.employer401k + input.contrib529;
    const targetSavingsRate = Math.min(0.4, Math.max(0.2, input.targetEffRate / 100)); // simple proxy
    const currentRate = impliedSavings / totalIncome;
    if (currentRate < targetSavingsRate) {
      R.push(
        `Increase savings: current ~${(currentRate*100).toFixed(1)}% vs target ~${(targetSavingsRate*100).toFixed(0)}%. ` +
        `Consider diverting bonus/RSU proceeds to 401(k)/HSA/mega-backdoor or brokerage auto-investments.`
      );
    }
  }

  // --- 401(k) deferrals
  if (input.w2Income > 0) {
    R.push(
      `Max employee 401(k) deferrals if cash flow allows. If age 50+, enable catch-up in plan settings. ` +
      `Coordinate Roth vs pre-tax deferral based on your target effective rate and expected future brackets.`
    );
  }

  // --- HSA
  if (input.hdhpEligible) {
    if (input.hsaContrib <= 0) {
      R.push(`You’re HSA-eligible. Contribute to the HSA and invest it; it’s triple tax-advantaged.`);
    } else {
      R.push(`Verify HSA contributions hit the annual limit (and catch-up at 55+). Invest the HSA rather than leaving in cash.`);
    }
  }

  // --- Self-employment / Solo 401k / SEP
  if (input.selfEmploymentNet > 0) {
    if (input.solo401kSEP <= 0) {
      R.push(
        `You have self-employment income. Open a Solo-401(k) (often superior to SEP for employee deferral + Roth options) and contribute based on net profit.`
      );
    } else {
      R.push(`Review Solo-401(k)/SEP contribution space vs net profit; ensure employee vs employer portions are maximized correctly.`);
    }
    R.push(
      `Assess S-Corp vs Schedule C for reasonable comp, payroll taxes, and retirement plan space. Keep QBI (199A) eligibility in mind.`
    );
  }

  // --- RSUs / ISOs
  if (input.rsuVestedValue > 0) {
    R.push(
      `RSUs: confirm withholding is adequate (often 22%/37% flat can under-withhold for high earners). ` +
      `Consider same-day sale to manage concentration risk and set aside tax reserves.`
    );
  }
  if (input.isoExerciseBargain > 0) {
    R.push(
      `ISOs: bargain element can trigger AMT. Model AMT impact before exercising more; consider disqualifying dispositions if needed.`
    );
  }

  // --- NIIT / investment
  if (input.niitSubject || (totalCGDiv + input.rentalNOI) > 0) {
    R.push(
      `Plan around NIIT (3.8%) on investment income. Use tax-loss harvesting, muni bonds, asset location, and timing of gains.`
    );
  }
  if (input.capGainsShort > 0) {
    R.push(`Short-term gains are taxed at ordinary rates; prefer holding ≥1 year where practical to shift to long-term rates.`);
  }

  // --- Itemized vs standard
  if (usesItemized) {
    R.push(
      `You’re likely itemizing (estimated itemized ≈ $${itemized.toLocaleString()} vs standard ≈ $${standard.toLocaleString()}). ` +
      `Consider charitable bunching/DAF and SALT timing to maximize deduction value.`
    );
  } else {
    R.push(
      `You likely use the standard deduction (≈ $${standard.toLocaleString()}). ` +
      `If charitable, consider bunching gifts into a Donor-Advised Fund in high-income years.`
    );
  }

  // --- SALT / high tax states
  if (isHighTaxState(input.state)) {
    R.push(
      `State tax planning: review SALT cap exposure, estimated payments, and possible timing strategies. ` +
      `If relocating, compare effective tax rates and domicile rules.`
    );
  }

  // --- 529
  if (input.contrib529 <= 0) {
    R.push(`If education goals exist, fund a 529. Check your state for deductions/credits and consider front-loading (5-year election).`);
  }

  // --- Liquidity needs
  if (input.liquidityNeed12mo > 0) {
    R.push(
      `Maintain an adequate emergency fund plus earmarked cash for the next 12 months ($${input.liquidityNeed12mo.toLocaleString()}). ` +
      `Keep near-term dollars in HYSA/short-duration instruments; avoid equity risk on this slice.`
    );
  }

  // --- Insurance & protection light