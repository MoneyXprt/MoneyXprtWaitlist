// lib/recommend.ts
import type { PlanInput } from './types';

// --- helpers ---
const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) => vals.reduce<number>((a, b) => a + n(b), 0);
const fmt = (x: number) =>
  x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const STD_DED = { single: 14600, married_joint: 29200, married_separate: 14600, head: 21900 } as const;
const EMP_401K_LIMIT = 23000;
const RSU_DEFAULT_WH = 0.22;
const RSU_PLAUSIBLE_RATE = 0.35;

/** ---------- Snapshot used by APIs / UI ---------- */
export function getPlanSnapshot(input: PlanInput) {
  // Income & spend
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
  const spendAnnual = n(input.fixedMonthlySpend) * 12 + n(input.lifestyleMonthlySpend) * 12;
  const impliedSavings = Math.max(0, grossIncome - spendAnnual);
  const savingsRate = grossIncome > 0 ? (impliedSavings / grossIncome) * 100 : 0;

  // Balance sheet from properties[] + alts
  const propertyEquity = (input.properties || []).reduce(
    (acc, p) => acc + (n(p.estimatedValue) - n(p.mortgageBalance)),
    0
  );
  const altAssets = n(input.alts?.privateEquityVC) + n(input.alts?.collectibles) + n(input.alts?.other);

  const totalAssets = sum(
    input.cash,
    input.brokerage,
    input.retirement,
    input.hsa,
    input.crypto,
    propertyEquity,
    altAssets
  );
  const totalDebts = sum(
    input.mortgageDebt,
    input.studentLoans,
    input.autoLoans,
    input.creditCards,
    input.otherDebt
  );
  const netWorth = totalAssets - totalDebts;

  // EF
  const targetEFMonths = Math.max(3, n(input.emergencyFundMonths));
  const monthlyBurn = Math.max(1000, n(input.fixedMonthlySpend) + n(input.lifestyleMonthlySpend));
  const efTarget = monthlyBurn * targetEFMonths;
  const efCoverageMonths = monthlyBurn > 0 ? n(input.cash) / monthlyBurn : 0;
  const efPct = efTarget > 0 ? Math.min(100, (n(input.cash) / efTarget) * 100) : 0;

  return {
    grossIncome,
    spendAnnual,
    impliedSavings,
    savingsRate,
    totalAssets,
    totalDebts,
    netWorth,
    ef: {
      targetEFMonths,
      monthlyBurn,
      efTarget,
      efCoverageMonths,
      efPct,
    },
  };
}

/** ---------- Recommendation engine ---------- */
export function buildRecommendations(input: PlanInput): string[] {
  const d: any = (input as any).discovery || {};
  const goals5 = (Array.isArray((input as any).goals5y) ? (input as any).goals5y : d.goals5) || [];
  const goals20 = (Array.isArray((input as any).goals20y) ? (input as any).goals20y : d.goals20) || [];
  const freedom = (input as any).freedomDef ?? d.freedom ?? '';
  const confidence = Number.isFinite((input as any).confidence) ? (input as any).confidence : d.confidence ?? 5;

  const {
    grossIncome,
    spendAnnual,
    impliedSavings,
    savingsRate: impliedSavingsRate,
    netWorth,
  } = getPlanSnapshot(input);

  const stdDed = STD_DED[input.filingStatus] ?? STD_DED.single;
  const likelyToItemize = !!input.itemizeLikely;

  const aboveRothLimitsLikely =
    (grossIncome > 230_000 && input.filingStatus === 'married_joint') ||
    (grossIncome > 146_000 && input.filingStatus !== 'married_joint');

  const tone =
    confidence >= 8
      ? 'You’re confident—lean into compounding, while covering tail risks.'
      : confidence <= 4
      ? 'Since confidence is lower, bias to liquidity and resilience as we build momentum.'
      : 'Solid. We’ll balance growth with safety and cash flexibility.';

  const snapshot = `Snapshot: income ${fmt(grossIncome)}/yr; spend ${fmt(spendAnnual)}/yr ⇒ implied savings ${fmt(impliedSavings)} (${Math.round(impliedSavingsRate)}%). Net worth ${fmt(netWorth)}.`;

  const R: string[] = [tone, snapshot];

  // EF
  const { ef } = getPlanSnapshot(input);
  const efGap = Math.max(0, ef.efTarget - n(input.cash));
  if (efGap > 0) {
    R.push(`Raise emergency fund to ~${ef.targetEFMonths} months (${fmt(ef.efTarget)}). Autotransfer ~${fmt(Math.ceil(efGap / 12))}/mo to HYSA/T-bills.`);
  } else {
    R.push(`Emergency fund ok (~${ef.targetEFMonths} months). Keep it in HYSA/T-bill ladder for yield without losing liquidity.`);
  }

  // Savings rate
  if (impliedSavingsRate < 20) {
    const to20 = Math.ceil((0.2 * grossIncome - impliedSavings) / 12);
    R.push(
      to20 > 0
        ? `Increase savings rate toward 20–30%: bump automated transfers by ~${fmt(to20)}/mo (pay-yourself-first).`
        : `Increase savings rate toward 20–30% via automatic bumps after raises/bonuses.`
    );
  } else if (impliedSavingsRate >= 30) {
    R.push(`Excellent savings discipline (~${Math.round(impliedSavingsRate)}%). Set a 1% auto-increase each year.`);
  }

  // Tax-advantaged
  const employee401kGap = Math.max(0, EMP_401K_LIMIT - Math.min(EMP_401K_LIMIT, n(input.retirement)));
  if (employee401kGap > 0) {
    R.push(`If not already maxing, target employee 401(k) limit (~${fmt(EMP_401K_LIMIT)}). Increase payroll deferrals by ~${fmt(Math.ceil(employee401kGap / 12))}/mo.`);
  }
  R.push(`Max tax-advantaged space: 401(k)/403(b), IRA/backdoor Roth (if needed), HSA if eligible.`);

  if (aboveRothLimitsLikely && !input.usingRothBackdoor) {
    R.push(`Income likely above direct Roth limits; consider a backdoor Roth (watch the pro-rata rule).`);
  }
  if (input.usingMegaBackdoor) {
    R.push(`Using a mega-backdoor Roth—great. Confirm plan rules and avoid after-tax leakage.`);
  }

  // RSUs
  if (n(input.rsuVesting) > 0) {
    const estGap = Math.max(0, RSU_PLAUSIBLE_RATE - RSU_DEFAULT_WH) * n(input.rsuVesting);
    R.push(
      estGap > 0
        ? `RSUs: plans often withhold ~${Math.round(RSU_DEFAULT_WH * 100)}%. At your bracket, set aside ~${fmt(estGap)} more across vests. Consider 10b5-1 and diversify concentration.`
        : `RSUs: verify withholding and consider a 10b5-1/diversify plan to manage risk and taxes.`
    );
  }

  // Debts
  if (input.creditCards > 0) R.push(`Attack credit cards first (avalanche). Automate extra above minimums until paid off.`);
  if (input.studentLoans + input.autoLoans > 0) R.push(`After high-interest debt, target student/auto loans while keeping retirement contributions on track.`);
  R.push(`If mortgage rate > your safe after-tax yield, add modest extra principal payments after savings goals are met.`);

  // Taxes
  if (likelyToItemize || input.charitableInclination) {
    R.push(`Itemized vs standard: compare to ~${fmt(stdDed)} annually (SALT cap applies). Consider charitable “bunching” or a DAF in high-income years.`);
  }

  // Protection
  if (!input.hasDisability) R.push(`Add long-term disability insurance (top income-protection priority).`);
  if (!input.hasTermLife) R.push(`If others rely on your income, add term life (often 20–30× annual expenses).`);
  if (!input.hasUmbrella) R.push(`Add a $1–$2M umbrella liability policy; it’s inexpensive and high impact.`);

  // Concentration
  if (input.concentrationRisk) R.push(`Reduce concentration risk via target weights and scheduled auto-sells on any excess.`);

  // Retirement target
  if (input.targetRetireIncomeMonthly > 0) {
    const annualNeed = n(input.targetRetireIncomeMonthly) * 12;
    const rule4 = annualNeed / 0.04;
    R.push(`Retirement income target ~${fmt(annualNeed)}/yr ⇒ long-run portfolio ~${fmt(rule4)} (4% proxy). Adjust for pensions, rentals, or early retirement.`);
  }

  // Estate
  if (input.hasWillOrTrust) R.push(`Review will/trust every 3–5 years and after major life events. Add POA/healthcare directives.`);
  else R.push(`Create a will and (if appropriate) a revocable living trust. Add POA/healthcare directives.`);

  // Goals echo
  const short = goals5.filter(Boolean).slice(0, 3);
  const long = goals20.filter(Boolean).slice(0, 3);
  if (short.length) R.push(`Near-term goals: ${short.join(' · ')}.`);
  if (long.length) R.push(`Long-term goals: ${long.join(' · ')}.`);
  if (freedom) R.push(`“Financial freedom” (your words): ${freedom}`);

  // Cadence
  R.push(`Set a 12-month roadmap: automate transfers, schedule quarterly reviews, and rebalance annually.`);
  return R;
}

// keep legacy default import pattern if used elsewhere
export { buildRecommendations as recommend };