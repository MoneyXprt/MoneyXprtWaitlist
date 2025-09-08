// lib/recommend.ts
import type { PlanInput } from './types';

export type PlanOutput = { recommendations: string[] };

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    isFinite(n) ? n : 0
  );

const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) => vals.reduce((a, b) => a + n(b), 0);

export function buildRecommendations(input: PlanInput): string[] {
  // Discovery fallbacks: support both flat fields and discovery object (from your Discovery.tsx)
  const d: any = (input as any).discovery || {};
  const goals5 = (Array.isArray((input as any).goals5y) ? (input as any).goals5y : d.goals5) || [];
  const goals20 = (Array.isArray((input as any).goals20y) ? (input as any).goals20y : d.goals20) || [];
  const freedom = (input as any).freedomDef ?? d.freedom ?? '';
  const confidence = Number.isFinite((input as any).confidence) ? (input as any).confidence : d.confidence ?? 5;

  // Income (annual)
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

  // Spend (annual)
  const fixedAnnual = n(input.fixedMonthlySpend) * 12;
  const lifestyleAnnual = n(input.lifestyleMonthlySpend) * 12;
  const totalAnnualSpend = fixedAnnual + lifestyleAnnual;

  // Savings
  const savingsAnnual = n(input.savingsMonthly) * 12;
  const impliedSavingsFromCashflow = Math.max(0, grossIncome - totalAnnualSpend);
  const impliedSavingsRate =
    grossIncome > 0 ? (impliedSavingsFromCashflow / grossIncome) * 100 : 0;

  // Balance sheet
  const totalAssets = sum(
    input.cash,
    input.brokerage,
    input.retirement,
    input.hsa,
    input.realEstateEquity,
    input.privateEquityVC,
    input.crypto
  );

  const totalDebts = sum(
    input.mortgageDebt,
    input.studentLoans,
    input.autoLoans,
    input.creditCards,
    input.otherDebt
  );

  const netWorth = totalAssets - totalDebts;

  // Emergency fund
  const targetEFMonths = Math.max(3, n(input.emergencyFundMonths));
  const monthlyBurn = Math.max(1000, n(input.fixedMonthlySpend) + n(input.lifestyleMonthlySpend)); // floor
  const targetEmergencyFund = monthlyBurn * targetEFMonths;

  // Itemize? (very rough heuristic)
  const likelyToItemize = !!input.itemizeLikely;

  // Roth / Backdoor heuristics
  const aboveRothLimitsLikely = grossIncome > 230_000 && input.filingStatus === 'married_joint'
    || grossIncome > 146_000 && input.filingStatus !== 'married_joint';

  // Confidence → tone nudge
  const tone =
    confidence >= 8 ? 'You’re confident—keep compounding but protect against tail risks.' :
    confidence <= 4 ? 'Since confidence is lower, bias to liquidity and resilience while we build momentum.' :
    'Solid. We’ll balance growth with safety and cash flexibility.';

  // Snapshot line (puts numbers up-front—what clients love seeing)
  const snapshot = `Snapshot: gross income ${fmt(grossIncome)}/yr; spend ${fmt(totalAnnualSpend)}/yr ⇒ implied savings ${fmt(impliedSavingsFromCashflow)} (${impliedSavingsRate.toFixed(0)}%). Net worth ${fmt(netWorth)} (${fmt(totalAssets)} assets – ${fmt(totalDebts)} debt).`;

  const R: string[] = [];

  // Top line
  R.push(tone);
  R.push(snapshot);

  // Cash / EF
  if (n(input.cash) < targetEmergencyFund) {
    R.push(
      `Increase emergency fund to ~${targetEFMonths} months (${fmt(targetEmergencyFund)} total). Park in HYSA or T-bills.`
    );
  } else {
    R.push(
      `Emergency fund looks fine (~${targetEFMonths} months). Keep it in a HYSA/T-bill ladder for yield without risking liquidity.`
    );
  }

  // Savings rate nudges
  if (impliedSavingsRate < 20) {
    R.push(
      `Raise savings rate toward 20–30% by automating transfers after each paycheck (pay yourself first).`
    );
  } else if (impliedSavingsRate >= 30) {
    R.push(`Excellent savings discipline (~${impliedSavingsRate.toFixed(0)}%). Keep lifestyle in check and automate annual increases.`);
  }

  // Tax-advantaged
  R.push(`Max out tax-advantaged space: 401(k)/403(b), IRA/backdoor Roth (if needed), and HSA if eligible.`);

  if (aboveRothLimitsLikely && !input.usingRothBackdoor) {
    R.push(`Income likely above direct Roth limits; consider a backdoor Roth (watch the pro-rata rule).`);
  }
  if (input.usingMegaBackdoor) {
    R.push(`You’re using a mega-backdoor Roth—great. Verify plan rules and avoid after-tax leakage.`);
  }

  // RSUs / equity comp
  if (input.rsuVesting > 0) {
    R.push(`RSUs: most plans under-withhold. Estimate tax gap and set aside extra each vest. Consider a 10b5-1 plan and diversify concentrated stock.`);
  }

  // Debt
  if (input.creditCards > 0) {
    R.push(`Prioritize high-interest debt (credit cards) first with avalanche method; automate payments above minimums.`);
  }
  if (input.studentLoans + input.autoLoans > 0) {
    R.push(`After high-interest debt, target student/auto loans next while keeping retirement contributions on track.`);
  }

  // Mortgage / prepayment decision
  R.push(`If mortgage rate > your safe after-tax yield, consider modest extra principal payments once savings goals are met.`);

  // Taxes / itemizing
  if (likelyToItemize || input.charitableInclination) {
    R.push(`Compare standard vs. itemized annually (SALT cap, mortgage interest, charitable). Consider “charitable bunching” or a Donor-Advised Fund to group gifts in high-income years.`);
  }

  // Protection
  if (!input.hasDisability) R.push(`Add long-term disability insurance; it’s the most important income-protection coverage.`);
  if (!input.hasTermLife) R.push(`If others rely on your income, add term life (20–30× annual expenses as a rough target).`);
  if (!input.hasUmbrella) R.push(`Add a \$1–\$2M umbrella liability policy to protect against lawsuits; it’s inexpensive.`);

  // Concentration risk
  if (input.concentrationRisk) R.push(`Reduce concentration risk by setting target weights and auto-selling excess positions on a schedule.`);

  // Retirement target rough-in
  if (input.targetRetireIncomeMonthly > 0) {
    const annualNeed = n(input.targetRetireIncomeMonthly) * 12;
    const rule4 = annualNeed / 0.04; // 4% rule proxy
    R.push(
      `Retirement income target ~${fmt(annualNeed)}/yr ⇒ long-run portfolio ~${fmt(rule4)} (4% rule proxy). Adjust for pensions, real estate income, or early retirement plans.`
    );
  }

  // Estate
  if (input.hasWillOrTrust) {
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
} // At the bottom of lib/recommend.ts
export { buildRecommendations as recommend };
// --- Keep the named export everyone should use going forward ---
export function buildRecommendations(input: PlanInput): string[] {
  const R: string[] = [];
  // ... your existing rules populate R ...
  return R;
}

// --- Compatibility + what-if wrapper ---
// Accepts an optional second arg of overrides, merges, and returns recs.
export function recommend(input: PlanInput, overrides?: Partial<PlanInput>): string[] {
  const merged = overrides ? { ...input, ...overrides } : input;
  return buildRecommendations(merged);
}

// (If you already had this line, keep it. If not, this also
// ensures any remaining old imports stay working.)
export { buildRecommendations as default };