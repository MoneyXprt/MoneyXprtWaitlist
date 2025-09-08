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

  // --- Aggregates -------------------------------------------------------------
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

  const annualFixed = 12 * (input.fixedMonthlySpend || 0);
  const annualLife = 12 * (input.lifestyleMonthlySpend || 0);
  const annualSpend = annualFixed + annualLife;

  // “Implied” savings before taxes; directional.
  const impliedSavings = Math.max(0, grossIncome - annualSpend);
  const impliedSavingsRate = grossIncome > 0 ? impliedSavings / grossIncome : 0;

  // Emergency fund target
  const monthlyBurn = (annualSpend - (12 * (input.savingsMonthly || 0)) / 12) / 12 || 0;
  const efMonths = Math.max(0, input.emergencyFundMonths || 0);
  const efTargetMonths = efMonths < 3 ? 3 : efMonths < 6 ? 6 : efMonths; // nudge to 3–6+ months
  const efTarget = Math.max(0, monthlyBurn * efTargetMonths);

  // Balance sheet snapshot
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

  // --- Personalized intro -----------------------------------------------------
  if (name) {
    R.push(`Hi ${name} — here’s your snapshot and suggested next moves:`);
  } else {
    R.push('Add your first name in Step 1 to personalize your plan.');
  }

  // --- Numeric snapshot (feels personalized immediately) ----------------------
  R.push(
    `Snapshot: gross income ~${dollars(grossIncome)}/yr; spend ~${dollars(annualSpend)}/yr ⇒ implied savings ~${dollars(impliedSavings)} (${pct(impliedSavingsRate)}).`
  );
  R.push(
    `Emergency fund target ~${efTargetMonths} months ≈ ${dollars(efTarget)}. Net worth ≈ ${dollars(netWorth)} (${dollars(totalAssets)} assets – ${dollars(totalDebt)} debt).`
  );

  // --- Savings rate guidance --------------------------------------------------
  if (impliedSavingsRate >= 0.35) {
    R.push(`Excellent savings discipline (≈ ${pct(impliedSavingsRate)}). Keep lifestyle in check and automate increases annually.`);
  } else if (impliedSavingsRate >= 0.2) {
    R.push(`Solid savings rate (≈ ${pct(impliedSavingsRate)}). Push toward 30% if early financial freedom is a goal.`);
  } else if (impliedSavingsRate > 0.1) {
    R.push(`Savings is okay (≈ ${pct(impliedSavingsRate)}). Trim lifestyle spend or increase income to reach 20–30%+.`);
  } else {
    R.push(`Savings is light (≈ ${pct(impliedSavingsRate)}). Tighten expenses or boost income to raise savings toward 20–30%+.`);
  }

  // --- Emergency fund ---------------------------------------------------------
  if (efMonths < 3) {
    R.push(`Build your emergency fund to at least 3–6 months (~${dollars(efTarget)}). Park in high-yield savings or short T-Bills.`);
  } else if (efMonths < 6) {
    R.push(`Increase emergency fund toward 6 months (~${dollars(efTarget)} total) for stronger resilience.`);
  } else {
    R.push('Emergency fund looks strong (≥ 6 months). Keep it liquid and separate from investment accounts.');
  }

  // --- Tax-advantaged accounts ------------------------------------------------
  R.push('Max all tax-advantaged space that applies: 401(k)/403(b), IRA/backdoor Roth, HSA if eligible.');
  if (input.usingRothBackdoor) {
    R.push('Backdoor Roth: confirm no pro-rata issues (clean up pre-tax IRA balances).');
  } else {
    R.push('Above Roth limits? Consider a backdoor Roth (watch the pro-rata rule).');
  }
  if (input.usingMegaBackdoor) {
    R.push('Mega-backdoor Roth: ensure your plan supports after-tax contributions + in-plan conversions.');
  } else {
    R.push('If your 401(k) allows, explore mega-backdoor Roth for extra tax-advantaged savings.');
  }
  if (input.hsa > 0) {
    R.push('Invest HSA dollars (beyond a small cash buffer) for long-term, triple-tax-advantaged growth.');
  }

  // --- Equity comp / RSUs -----------------------------------------------------
  if (input.rsuVesting > 0) {
    R.push('RSUs vesting: check tax withholding (many plans under-withhold); consider a 10b5-1 plan and diversify concentrated stock.');
  }

  // --- Charitable / itemizing -------------------------------------------------
  if (input.charitableInclination) {
    R.push('Charitable intent: consider bunching or a Donor-Advised Fund in higher-income years.');
  }
  if (input.itemizeLikely) {
    R.push('Likely to itemize: compare standard vs. itemized (SALT cap, mortgage interest, charitable).');
  }

  // --- Side business / entity -------------------------------------------------
  if (input.entityOrSideBiz || input.selfEmployment > 0) {
    R.push('Side business: review entity structure (LLC/S-Corp) and retirement options (Solo-401k/SEP).');
  }

  // --- Debt strategy ----------------------------------------------------------
  if (input.creditCards > 0) {
    R.push('Pay off high-interest credit cards first (avalanche), then student/auto, while making required mortgage payments.');
  } else if (sum(input.studentLoans, input.autoLoans) > 0) {
    R.push('After any high-interest debt, prioritize student/auto payoff while sustaining retirement contributions.');
  }
  if (input.mortgageDebt > 0 && impliedSavingsRate >= 0.25) {
    R.push('With strong savings, consider modest extra principal on your mortgage if the rate exceeds your safe after-tax yield.');
  }

  // --- Concentration & portfolio ---------------------------------------------
  if (input.concentrationRisk || input.crypto > 0 || input.privateEquityVC > 0) {
    R.push('Reduce concentration risk: set target weights and auto-sell excess above thresholds on a schedule.');
  }
  R.push('Use a diversified, low-cost portfolio; automate contributions and set an annual rebalance rule.');

  // --- Protection --------------------------------------------------------------
  if (!input.hasDisability) {
    R.push('Add long-term disability insurance — the most important income-protection coverage.');
  }
  if (isMarried(input.filingStatus) && !input.hasTermLife) {
    R.push('If married, add term life sized to income, debt payoff, and dependents — simple and inexpensive.');
  }
  if (!input.hasUmbrella) {
    R.push('Add umbrella liability coverage (e.g., $1–2M) above home/auto limits for lawsuit protection.');
  }

  // --- Retirement framing -----------------------------------------------------
  if (input.targetRetireIncomeMonthly > 0) {
    const annualTarget = input.targetRetireIncomeMonthly * 12;
    const roughNestEgg = annualTarget / 0.04; // 4% rule proxy
    R.push(
      `Retirement target ~${dollars(annualTarget)}/yr ⇒ nest-egg ~${dollars(roughNestEgg)} (4% rule proxy). Adjust for pensions, real-estate income, or deferred comp.`
    );
  } else {
    R.push('Set a target retirement income (monthly) so we can translate it into a nest-egg range and savings path.');
  }

  // --- Estate & legacy --------------------------------------------------------
  if (!input.hasWillOrTrust) {
    R.push('Create a will and (if appropriate) a revocable living trust; add POA and healthcare directives.');
  }
  if (input.givingIntent) {
    R.push('Formalize a giving policy; consider appreciated-asset gifting or a DAF for tax efficiency.');
  }

  // --- Roadmap ----------------------------------------------------------------
  R.push('12-month roadmap: automate savings, schedule quarterly reviews, and rebalance annually.');

  return { name, recommendations: R };
}