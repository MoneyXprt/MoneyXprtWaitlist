// lib/recommend.ts
import type { PlanInput, FilingStatus } from './types';

export type PlanOutput = {
  name?: string;
  recommendations: string[];
};

function sum(...vals: Array<number | undefined | null>): number {
  return vals.reduce((a, b) => a + (Number(b) || 0), 0);
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function dollars(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions = abs >= 1_000_000
    ? { notation: 'compact', maximumFractionDigits: 1 }
    : { maximumFractionDigits: 0 };
  return new Intl.NumberFormat('en-US', opts).format(n).replace(/^/, '$');
}

function isMarried(fs: FilingStatus) {
  return fs === 'married_joint' || fs === 'married_separate';
}

export function buildRecommendations(input: PlanInput): PlanOutput {
  const name = (input.firstName || '').trim() || undefined;

  // --- Quick aggregates -------------------------------------------------------
  const grossIncome = sum(
    input.salary,
    input.bonus,
    input.selfEmployment,
    input.rsuVesting,
    input.k1Active,
    input.k1Passive,
    input.otherIncome,
    input.rentNOI
  );

  const annualFixedSpend = 12 * (input.fixedMonthlySpend || 0);
  const annualLifestyleSpend = 12 * (input.lifestyleMonthlySpend || 0);
  const annualSpend = annualFixedSpend + annualLifestyleSpend;

  const annualAlreadySaving = 12 * (input.savingsMonthly || 0);

  // “Implied” savings before tax nuance; directional only.
  const impliedSavings = Math.max(0, grossIncome - annualSpend);
  const impliedSavingsRate = grossIncome > 0 ? impliedSavings / grossIncome : 0;

  // Emergency fund target (>= 3–6 months by default)
  const efMonths = Math.max(0, input.emergencyFundMonths || 0);
  const efNeededMonths = Math.max(3, Math.min(6, efMonths < 3 ? 3 : efMonths < 6 ? 6 : efMonths));
  const monthlyBurn = (annualSpend - annualAlreadySaving / 12) / 12 || 0; // simple burn proxy
  const efTarget = Math.max(0, monthlyBurn * efNeededMonths);

  // Net worth-ish snapshot (rough)
  const totalAssets = sum(
    input.cash,
    input.brokerage,
    input.retirement,
    input.hsa,
    input.realEstateEquity,
    input.privateEquityVC,
    input.crypto
  );
  const totalDebt = sum(
    input.mortgageDebt,
    input.studentLoans,
    input.autoLoans,
    input.creditCards,
    input.otherDebt
  );
  const netWorth = totalAssets - totalDebt;

  const R: string[] = [];

  // --- Personalization nudges -------------------------------------------------
  if (!name) {
    R.push('Add your first name in Step 1 to personalize your plan.');
  } else {
    R.push(`Hi ${name} — here’s how to tune your plan based on what you shared.`);
  }

  // --- Savings rate / cash flow ----------------------------------------------
  if (impliedSavingsRate >= 0.3) {
    R.push(
      `Great job: your implied savings rate is ~${pct(impliedSavingsRate)}. Keep it at least 20–30% to accelerate financial freedom.`
    );
  } else if (impliedSavingsRate > 0.1) {
    R.push(
      `Your implied savings rate is ~${pct(impliedSavingsRate)}. Aim for 20–30%+ by trimming lifestyle spend or increasing automated savings.`
    );
  } else {
    R.push(
      `Savings looks light (~${pct(impliedSavingsRate)}). Tighten lifestyle spend or increase income to push savings into the 20–30%+ range.`
    );
  }

  // --- Emergency fund ---------------------------------------------------------
  if (efTarget > 0) {
    if (efMonths < 3) {
      R.push(
        `Build an emergency fund of at least 3–6 months’ expenses (~${dollars(efTarget)}). Park this in high-yield savings or short-term T-Bills.`
      );
    } else if (efMonths < 6) {
      R.push(
        `Increase your emergency fund to 6 months’ expenses (~${dollars(efTarget)} total) for stronger resilience.`
      );
    } else {
      R.push('Emergency fund looks solid (≥ 6 months). Keep it liquid and separate from investment accounts.');
    }
  }

  // --- Tax-advantaged accounts ------------------------------------------------
  R.push('Max out all tax-advantaged space that applies: 401(k)/403(b), IRA/backdoor Roth, and HSA if eligible.');
  if (input.usingRothBackdoor) {
    R.push('You indicated backdoor Roth usage: confirm no pro-rata issues (clean up pre-tax IRA balances if needed).');
  } else {
    R.push('If income is above Roth limits, consider a backdoor Roth (watch the pro-rata rule).');
  }
  if (input.usingMegaBackdoor) {
    R.push('You’re using mega-backdoor Roth; confirm plan allows after-tax contributions and in-plan conversions.');
  } else {
    R.push('If your 401(k) supports it, explore mega-backdoor Roth for additional tax-advantaged savings.');
  }
  if (input.hsa > 0) {
    R.push('Invest HSA dollars (beyond a small cash buffer) for long-term, triple-tax-advantaged growth.');
  }

  // --- RSUs / equity comp -----------------------------------------------------
  if (input.rsuVesting > 0) {
    R.push(
      'You have RSU vesting. Check tax withholding — plans often under-withhold. Consider a 10b5-1 trading plan and diversify concentrated positions.'
    );
  }

  // --- Charitable / itemizing -------------------------------------------------
  if (input.charitableInclination) {
    R.push('Consider “charitable bunching” or using a Donor-Advised Fund to group gifts into high-income years.');
  }
  if (input.itemizeLikely) {
    R.push('You’re likely to itemize: compare standard vs. itemized scenarios (SALT cap, mortgage interest, charity).');
  }

  // --- Entity / side business -------------------------------------------------
  if (input.entityOrSideBiz || input.selfEmployment > 0) {
    R.push('With a side business/self-employment, review entity structure (LLC/S-Corp) and retirement options (Solo-401k/SEP).');
  }

  // --- Debt management --------------------------------------------------------
  if (input.creditCards > 0) {
    R.push('Attack high-interest credit card debt first (avalanche method), then student/auto loans, while making required mortgage payments.');
  } else if (sum(input.studentLoans, input.autoLoans) > 0) {
    R.push('Prioritize paying down student and auto loans after high-interest debt, while maintaining required mortgage payments.');
  }
  if (input.mortgageDebt > 0 && impliedSavingsRate > 0.25) {
    R.push('With strong savings, consider modest extra principal payments on your mortgage if the rate is above your safe after-tax yield.');
  }

  // --- Concentration & portfolio ---------------------------------------------
  if (input.concentrationRisk || input.crypto > 0 || input.privateEquityVC > 0) {
    R.push('Reduce concentration risk by setting target weights and auto-selling excess above your thresholds on a schedule.');
  }
  R.push('Use a diversified, low-cost portfolio; set an annual rebalance rule and automate contributions.');

  // --- Protection -------------------------------------------------------------
  if (!input.hasDisability) {
    R.push('Add long-term disability insurance — it’s the most important coverage for income protection.');
  }
  if (isMarried(input.filingStatus) && !input.hasTermLife) {
    R.push('Add term life insurance sized to income, debt payoff, and dependents — keep it simple and inexpensive.');
  }
  if (!input.hasUmbrella) {
    R.push('Add umbrella liability coverage (e.g., $1–2M) on top of home/auto for lawsuit protection.');
  }

  // --- Retirement framing -----------------------------------------------------
  if (input.targetRetireIncomeMonthly > 0) {
    const annualTarget = input.targetRetireIncomeMonthly * 12;
    const roughNestEgg = annualTarget / 0.04; // 4% rule proxy
    R.push(
      `Retirement target ~${dollars(annualTarget)}/yr implies a nest egg around ${dollars(roughNestEgg)} (4% rule proxy). Adjust for pensions, real estate income, or deferred comp.`
    );
  } else {
    R.push('Define a target retirement income (monthly) so we can translate it into a nest-egg range and savings path.');
  }

  // --- Estate & legacy --------------------------------------------------------
  if (!input.hasWillOrTrust) {
    R.push('Create a will and (if appropriate) a revocable living trust. Add POA and healthcare directives.');
  }
  if (input.givingIntent) {
    R.push('If you have ongoing charitable intent, formalize a giving policy and consider appreciated-asset gifting or a DAF.');
  }

  // --- Roadmap ---------------------------------------------------------------
  R.push('Set a 12-month roadmap: automate savings, schedule quarterly reviews, and rebalance annually.');

  return { name, recommendations: R };
}