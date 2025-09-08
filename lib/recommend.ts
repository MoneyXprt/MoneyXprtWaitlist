// lib/recommend.ts
import type { PlanInput } from './types';

const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) => vals.reduce((a, b) => a + n(b), 0);
const fmt = (x: number) =>
  x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** A lightweight “planner math” snapshot the UI and LLM can both use. */
export function getPlanSnapshot(input: PlanInput) {
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

  const fixedAnnual = n(input.fixedMonthlySpend) * 12;
  const lifestyleAnnual = n(input.lifestyleMonthlySpend) * 12;
  const totalAnnualSpend = fixedAnnual + lifestyleAnnual;

  const impliedSavingsFromCashflow = Math.max(0, grossIncome - totalAnnualSpend);
  const impliedSavingsRate = grossIncome > 0 ? (impliedSavingsFromCashflow / grossIncome) * 100 : 0;

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

  const targetEFMonths = Math.max(3, n(input.emergencyFundMonths));
  const monthlyBurn = Math.max(1000, n(input.fixedMonthlySpend) + n(input.lifestyleMonthlySpend));
  const targetEmergencyFund = monthlyBurn * targetEFMonths;

  // super simple heuristics the AI can elaborate on
  const aboveRothLimitsLikely =
    (grossIncome > 230_000 && input.filingStatus === 'married_joint') ||
    (grossIncome > 146_000 && input.filingStatus !== 'married_joint');

  return {
    grossIncome,
    totalAnnualSpend,
    impliedSavingsFromCashflow,
    impliedSavingsRate,
    totalAssets,
    totalDebts,
    netWorth,
    targetEFMonths,
    targetEmergencyFund,
    monthlyBurn,
    aboveRothLimitsLikely,
  };
}

/** Deterministic “rule engine” recommendations (fallback and guardrails). */
export function buildRecommendations(input: PlanInput): string[] {
  const d: any = (input as any).discovery || {};
  const goals5 = (Array.isArray((input as any).goals5y) ? (input as any).goals5y : d.goals5) || [];
  const goals20 = (Array.isArray((input as any).goals20y) ? (input as any).goals20y : d.goals20) || [];
  const freedom = (input as any).freedomDef ?? d.freedom ?? '';
  const confidence = Number.isFinite((input as any).confidence) ? (input as any).confidence : d.confidence ?? 5;

  const S = getPlanSnapshot(input);
  const R: string[] = [];

  const tone =
    confidence >= 8
      ? 'You’re confident—keep compounding but protect against tail risks.'
      : confidence <= 4
      ? 'Since confidence is lower, bias to liquidity and resilience while we build momentum.'
      : 'Solid. We’ll balance growth with safety and cash flexibility.';

  R.push(tone);
  R.push(
    `Snapshot: gross income ${fmt(S.grossIncome)}/yr; spend ${fmt(S.totalAnnualSpend)}/yr ⇒ implied savings ` +
      `${fmt(S.impliedSavingsFromCashflow)} (${S.impliedSavingsRate.toFixed(0)}%). Net worth ${fmt(S.netWorth)}.`
  );

  if (n(input.cash) < S.targetEmergencyFund) {
    R.push(`Increase emergency fund to ~${S.targetEFMonths} months (${fmt(S.targetEmergencyFund)} total).`);
  } else {
    R.push(`Emergency fund looks fine (~${S.targetEFMonths} months). Keep in HYSA/T-bill ladder.`);
  }

  if (S.impliedSavingsRate < 20) {
    R.push('Raise savings rate toward 20–30% by automating transfers after each paycheck.');
  } else if (S.impliedSavingsRate >= 30) {
    R.push('Excellent savings discipline. Keep lifestyle in check and automate annual increases.');
  }

  R.push('Max tax-advantaged space: 401(k)/403(b), IRA/backdoor Roth (if needed), HSA if eligible.');
  if (S.aboveRothLimitsLikely && !input.usingRothBackdoor) {
    R.push('Income likely above direct Roth limits; consider a backdoor Roth (watch pro-rata rule).');
  }
  if (input.usingMegaBackdoor) R.push('Using a mega-backdoor Roth—great. Verify plan rules to avoid after-tax leakage.');
  if (input.rsuVesting > 0) R.push('RSUs: estimate under-withholding each vest, consider 10b5-1/diversify concentrated stock.');

  if (input.creditCards > 0) R.push('Attack high-interest debt first (avalanche), automate above-minimum payments.');
  if (input.studentLoans + input.autoLoans > 0)
    R.push('After high-interest debt, target student/auto loans while keeping retirement on track.');
  R.push('If mortgage rate > safe after-tax yield, consider modest prepayments after savings goals are met.');

  if (input.itemizeLikely || input.charitableInclination) {
    R.push('Compare standard vs. itemized annually; consider “charitable bunching” or a Donor-Advised Fund.');
  }

  if (!input.hasDisability) R.push('Add long-term disability insurance (top income-protection priority).');
  if (!input.hasTermLife) R.push('If others rely on you, add term life (~20–30× annual expenses).');
  if (!input.hasUmbrella) R.push('Add $1–$2M umbrella liability policy; inexpensive protection.');
  if (input.concentrationRisk) R.push('Reduce concentration risk via target weights + scheduled trims.');

  if (input.targetRetireIncomeMonthly > 0) {
    const annualNeed = n(input.targetRetireIncomeMonthly) * 12;
    const rule4 = annualNeed / 0.04;
    R.push(`Retirement income ~${fmt(annualNeed)}/yr ⇒ long-run portfolio ~${fmt(rule4)} (4% rule proxy).`);
  }

  const short = goals5.filter(Boolean).slice(0, 3);
  const long = goals20.filter(Boolean).slice(0, 3);
  if (short.length) R.push(`Near-term goals: ${short.join(' · ')}.`);
  if (long.length) R.push(`Long-term goals: ${long.join(' · ')}.`);
  if (freedom) R.push(`“Financial freedom” (your words): ${freedom}`);

  R.push('Set a 12-month roadmap: automate savings, quarterly reviews, annual rebalance.');
  return R;
}

// Legacy alias for components already importing { recommend }
export { buildRecommendations as recommend };