// lib/recommend.ts
import type { PlanInput } from './types';

// helpers
const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) => vals.reduce((a, b) => a + n(b), 0);
const fmt = (x: number) =>
  x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Core rule engine — returns a list of recommendation strings.
 * Keeps compatibility with both the flat PlanInput shape and the `discovery` object
 * that Discovery.tsx writes to (`goals5`, `goals20`, `freedom`, `confidence`).
 */
export function buildRecommendations(input: PlanInput): string[] {
  // Discovery fallbacks
  const d: any = (input as any).discovery || {};
  const goals5 = (Array.isArray((input as any).goals5y) ? (input as any).goals5y : d.goals5) || [];
  const goals20 = (Array.isArray((input as any).goals20y) ? (input as any).goals20y : d.goals20) || [];
  const freedom = (input as any).freedomDef ?? d.freedom ?? '';
  const confidence = Number.isFinite((input as any).confidence) ? (input as any).confidence : d.confidence ?? 5;

  // Income (annual)
  const grossIncome = sum(
    (input as any).salary,
    (input as any).bonus,
    (input as any).selfEmployment,
    (input as any).rsuVesting,
    (input as any).k1Active,
    (input as any).k1Passive,
    (input as any).otherIncome,
    (input as any).rentNOI
  );

  // Spend (annual)
  const fixedAnnual = n((input as any).fixedMonthlySpend) * 12;
  const lifestyleAnnual = n((input as any).lifestyleMonthlySpend) * 12;
  const totalAnnualSpend = fixedAnnual + lifestyleAnnual;

  // Savings
  const savingsAnnual = n((input as any).savingsMonthly) * 12;
  const impliedSavingsFromCashflow = Math.max(0, grossIncome - totalAnnualSpend);
  const impliedSavingsRate = grossIncome > 0 ? (impliedSavingsFromCashflow / grossIncome) * 100 : 0;

  // Balance sheet
  const totalAssets = sum(
    (input as any).cash,
    (input as any).brokerage,
    (input as any).retirement,
    (input as any).hsa,
    (input as any).realEstateEquity,
    (input as any).privateEquityVC,
    (input as any).crypto
  );
  const totalDebts = sum(
    (input as any).mortgageDebt,
    (input as any).studentLoans,
    (input as any).autoLoans,
    (input as any).creditCards,
    (input as any).otherDebt
  );
  const netWorth = totalAssets - totalDebts;

  // Emergency fund
  const targetEFMonths = Math.max(3, n((input as any).emergencyFundMonths));
  const monthlyBurn = Math.max(1000, n((input as any).fixedMonthlySpend) + n((input as any).lifestyleMonthlySpend));
  const targetEmergencyFund = monthlyBurn * targetEFMonths;

  // Itemize? (very rough heuristic)
  const likelyToItemize = !!(input as any).itemizeLikely;

  // Roth / Backdoor heuristics (quick thresholds — non-binding)
  const filing: any = (input as any).filingStatus;
  const aboveRothLimitsLikely =
    (grossIncome > 230_000 && filing === 'married_joint') ||
    (grossIncome > 146_000 && filing !== 'married_joint');

  // Confidence → tone
  const tone =
    confidence >= 8
      ? 'You’re confident—keep compounding but protect against tail risks.'
      : confidence <= 4
      ? 'Since confidence is lower, bias to liquidity and resilience while we build momentum.'
      : 'Solid. We’ll balance growth with safety and cash flexibility.';

  // Snapshot
  const snapshot = `Snapshot: gross income ${fmt(grossIncome)}/yr; spend ${fmt(
    totalAnnualSpend
  )}/yr ⇒ implied savings ${fmt(impliedSavingsFromCashflow)} (${impliedSavingsRate.toFixed(
    0
  )}%). Net worth ${fmt(netWorth)} (${fmt(totalAssets)} assets – ${fmt(totalDebts)} debt).`;

  const R: string[] = [];

  // Top line
  R.push(tone);
  R.push(snapshot);

  // Cash / EF
  if (n((input as any).cash) < targetEmergencyFund) {
    R.push(`Increase emergency fund to ~${targetEFMonths} months (${fmt(targetEmergencyFund)} total). Park in HYSA or T-bills.`);
  } else {
    R.push(`Emergency fund looks fine (~${targetEFMonths} months). Keep it in a HYSA/T-bill ladder for yield without risking liquidity.`);
  }

  // Savings rate nudges
  if (impliedSavingsRate < 20) {
    R.push(`Raise savings rate toward 20–30% by automating transfers after each paycheck (pay yourself first).`);
  } else if (impliedSavingsRate >= 30) {
    R.push(`Excellent savings discipline (~${impliedSavingsRate.toFixed(0)}%). Keep lifestyle in check and automate annual increases.`);
  }

  // Tax-advantaged
  R.push(`Max out tax-advantaged space: 401(k)/403(b), IRA/backdoor Roth (if needed), and HSA if eligible.`);

  if (aboveRothLimitsLikely && !(input as any).usingRothBackdoor) {
    R.push(`Income likely above direct Roth limits; consider a backdoor Roth (watch the pro-rata rule).`);
  }
  if ((input as any).usingMegaBackdoor) {
    R.push(`You’re using a mega-backdoor Roth—great. Verify plan rules and avoid after-tax leakage.`);
  }

  // RSUs / equity comp
  if ((input as any).rsuVesting > 0) {
    R.push(`RSUs: most plans under-withhold. Estimate tax gap and set aside extra each vest. Consider a 10b5-1 plan and diversify concentrated stock.`);
  }

  // Debt
  if ((input as any).creditCards > 0) {
    R.push(`Prioritize high-interest debt (credit cards) first with avalanche method; automate payments above minimums.`);
  }
  if (n((input as any).studentLoans) + n((input as any).autoLoans) > 0) {
    R.push(`After high-interest debt, target student/auto loans next while keeping retirement contributions on track.`);
  }

  // Mortgage / prepayment decision
  R.push(`If mortgage rate > your safe after-tax yield, consider modest extra principal payments once savings goals are met.`);

  // Taxes / itemizing
  if (likelyToItemize || (input as any).charitableInclination) {
    R.push(
      `Compare standard vs. itemized annually (SALT cap, mortgage interest, charitable). Consider “charitable bunching” or a Donor-Advised Fund to group gifts in high-income years.`
    );
  }

  // Protection
  if (!(input as any).hasDisability) R.push(`Add long-term disability insurance; it’s the most important income-protection coverage.`);
  if (!(input as any).hasTermLife) R.push(`If others rely on your income, add term life (20–30× annual expenses as a rough target).`);
  if (!(input as any).hasUmbrella) R.push(`Add a $1–$2M umbrella liability policy to protect against lawsuits; it’s inexpensive.`);

  // Concentration risk
  if ((input as any).concentrationRisk) R.push(`Reduce concentration risk by setting target weights and auto-selling excess positions on a schedule.`);

  // Retirement target rough-in
  if ((input as any).targetRetireIncomeMonthly > 0) {
    const annualNeed = n((input as any).targetRetireIncomeMonthly) * 12;
    const rule4 = annualNeed / 0.04; // 4% rule proxy
    R.push(
      `Retirement income target ~${fmt(annualNeed)}/yr ⇒ long-run portfolio ~${fmt(
        rule4
      )} (4% rule proxy). Adjust for pensions, real estate income, or early retirement plans.`
    );
  }

  // Estate
  if ((input as any).hasWillOrTrust) {
    R.push(`Review your will/trust every 3–5 years and after major life events. Add POA and healthcare directives.`);
  } else {
    R.push(`Create a will and (if appropriate) a revocable living trust. Add powers of attorney and healthcare directives.`);
  }

  // Goals echo (personalization)
  const short = goals5.filter(Boolean).slice(0, 3);
  const long = goals20.filter(Boolean).slice(0, 3);
  if (short.length) R.push(`Near-term goals: ${short.join(' · ')}.`);
  if (long.length) R.push(`Long-term goals: ${long.join(' · ')}.`);
  if (freedom) R.push(`“Financial freedom” (your words): ${freedom}`);

  // Action plan
  R.push(`Set a 12-month roadmap: automate savings, schedule quarterly reviews, and rebalance annually.`);

  return R;
}

/**
 * What-if wrapper: merges overrides into the input before computing recs.
 * Used by the UI for interactive tweaks.
 */
export function recommend(input: PlanInput, overrides?: Partial<PlanInput>): string[] {
  const merged = overrides ? { ...input, ...overrides } as PlanInput : input;
  return buildRecommendations(merged);
}

// Optional: default export for convenience
export default buildRecommendations;