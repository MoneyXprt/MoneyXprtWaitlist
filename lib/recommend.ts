// lib/recommend.ts
import type { PlanInput } from './types';

// --- helpers ---
const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) => vals.reduce((a, b) => a + n(b), 0);
const fmt = (x: number) =>
  x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// 2024-ish standard deduction rough values (good enough for guidance)
const STD_DED = {
  single: 14600,
  married_joint: 29200,
  married_separate: 14600,
  head: 21900,
};

// assume employee 401k limit (under 50) for quick guidance
const EMP_401K_LIMIT = 23000;

// quick RSU default federal withholding often ~22% for supplemental wages (not precise)
// high earners commonly owe more (e.g., 32–37%). We'll use 35% as "likely true rate" for a gap estimate.
const RSU_DEFAULT_WH = 0.22;
const RSU_PLAUSIBLE_RATE = 0.35;

export function buildRecommendations(input: PlanInput): string[] {
  // Discovery fallbacks
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
  const impliedSavingsRate = grossIncome > 0 ? (impliedSavingsFromCashflow / grossIncome) * 100 : 0;

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
  const monthlyBurn = Math.max(1000, n(input.fixedMonthlySpend) + n(input.lifestyleMonthlySpend));
  const targetEmergencyFund = monthlyBurn * targetEFMonths;
  const efGap = Math.max(0, targetEmergencyFund - n(input.cash));
  const efGapPerMonth = Math.ceil(efGap / 12);

  // Itemize heuristic
  const likelyToItemize = !!input.itemizeLikely;
  const stdDed = STD_DED[input.filingStatus] ?? STD_DED.single;

  // Roth / Backdoor heuristic
  const aboveRothLimitsLikely =
    (grossIncome > 230_000 && input.filingStatus === 'married_joint') ||
    (grossIncome > 146_000 && input.filingStatus !== 'married_joint');

  // Confidence → tone
  const tone =
    confidence >= 8
      ? 'You’re confident—lean into compounding, while covering tail risks.'
      : confidence <= 4
      ? 'Since confidence is lower, bias to liquidity and resilience as we build momentum.'
      : 'Solid. We’ll balance growth with safety and cash flexibility.';

  // Snapshot up front
  const snapshot = `Snapshot: income ${fmt(grossIncome)}/yr; spend ${fmt(
    totalAnnualSpend
  )}/yr ⇒ implied savings ${fmt(impliedSavingsFromCashflow)} (${Math.round(impliedSavingsRate)}%). Net worth ${fmt(
    netWorth
  )}.`;

  const R: string[] = [];
  R.push(tone);
  R.push(snapshot);

  // Actionable: emergency fund
  if (efGap > 0) {
    R.push(
      `Raise emergency fund to ~${targetEFMonths} months (${fmt(
        targetEmergencyFund
      )}). Autotransfer about ${fmt(efGapPerMonth)}/mo to HYSA/T-bills until you hit the target.`
    );
  } else {
    R.push(
      `Emergency fund ok (~${targetEFMonths} months). Keep it in HYSA/T-bill ladder for yield without sacrificing liquidity.`
    );
  }

  // Actionable: savings rate target
  if (impliedSavingsRate < 20) {
    const to20 = Math.ceil((0.2 * grossIncome - impliedSavingsFromCashflow) / 12);
    if (to20 > 0) {
      R.push(
        `Increase savings rate toward 20–30%: bump automated transfers by ~${fmt(
          to20
        )}/mo (pay-yourself-first after each paycheck).`
      );
    } else {
      R.push(`Increase savings rate toward 20–30% via automatic bumps after raises/bonuses.`);
    }
  } else if (impliedSavingsRate >= 30) {
    R.push(`Excellent savings discipline (~${Math.round(impliedSavingsRate)}%). Set a 1% auto-increase each year.`);
  }

  // Actionable: retirement space
  const employee401kGap = Math.max(0, EMP_401K_LIMIT - Math.min(EMP_401K_LIMIT, n(input.retirement)));
  if (employee401kGap > 0) {
    R.push(
      `If not already maxing, target employee 401(k) limit (~${fmt(
        EMP_401K_LIMIT
      )}). Increase payroll deferrals by ~${fmt(Math.ceil(employee401kGap / 12))}/mo.`
    );
  }
  R.push(`Max tax-advantaged space: 401(k)/403(b), IRA/backdoor Roth (if needed), HSA if eligible.`);

  if (aboveRothLimitsLikely && !input.usingRothBackdoor) {
    R.push(`Income likely above direct Roth limits; consider a backdoor Roth (watch the pro-rata rule).`);
  }
  if (input.usingMegaBackdoor) {
    R.push(`Using a mega-backdoor Roth—great. Confirm plan rules and avoid after-tax leakage.`);
  }

  // RSU tax gap (if vesting)
  if (input.rsuVesting > 0) {
    const estGap = Math.max(0, RSU_PLAUSIBLE_RATE - RSU_DEFAULT_WH) * n(input.rsuVesting);
    if (estGap > 0) {
      R.push(
        `RSUs: plans often withhold ~${Math.round(RSU_DEFAULT_WH * 100)}%. At your bracket, estimate setting aside ~${fmt(
          estGap
        )} more across vests to cover taxes. Consider 10b5-1 and diversify concentrated stock.`
      );
    } else {
      R.push(`RSUs: verify withholding and consider a 10b5-1/diversify plan to manage risk and taxes.`);
    }
  }

  // Debts
  if (input.creditCards > 0) {
    R.push(`Attack credit cards first (avalanche). Automate extra above minimums until paid off.`);
  }
  if (input.studentLoans + input.autoLoans > 0) {
    R.push(`After high-interest debt, target student/auto loans while keeping retirement on track.`);
  }
  R.push(`If mortgage rate > your safe after-tax yield, add modest extra principal payments after savings goals are met.`);

  // Taxes / itemizing
  if (likelyToItemize || input.charitableInclination) {
    R.push(
      `Itemized vs standard: compare to ~${fmt(stdDed)} annually (SALT cap applies). Consider “charitable bunching” or a Donor-Advised Fund in high-income years.`
    );
  }

  // Protection
  if (!input.hasDisability) R.push(`Add long-term disability insurance (top income-protection priority).`);
  if (!input.hasTermLife) R.push(`If others rely on your income, add term life (often 20–30× annual expenses).`);
  if (!input.hasUmbrella) R.push(`Add a $1–$2M umbrella liability policy; it’s inexpensive and high impact.`);

  // Concentration risk
  if (input.concentrationRisk) {
    R.push(`Reduce concentration risk via target weights and scheduled auto-sells on any excess.`);
  }

  // Retirement income framing (if user set a target)
  if (input.targetRetireIncomeMonthly > 0) {
    const annualNeed = n(input.targetRetireIncomeMonthly) * 12;
    const rule4 = annualNeed / 0.04;
    R.push(
      `Retirement income target ~${fmt(annualNeed)}/yr ⇒ long-run portfolio ~${fmt(
        rule4
      )} (4% proxy). Adjust for pensions, real estate income, or early retirement.`
    );
  }

  // Estate
  if (input.hasWillOrTrust) {
    R.push(`Review will/trust every 3–5 years and after major life events. Add POA/healthcare directives.`);
  } else {
    R.push(`Create a will and (if appropriate) a revocable living trust. Add POA/healthcare directives.`);
  }

  // Goals echo (personalization)
  const short = goals5.filter(Boolean).slice(0, 3);
  const long = goals20.filter(Boolean).slice(0, 3);
  if (short.length) R.push(`Near-term goals: ${short.join(' · ')}.`);
  if (long.length) R.push(`Long-term goals: ${long.join(' · ')}.`);
  if (freedom) R.push(`“Financial freedom” (your words): ${freedom}`);

  // Action cadence
  R.push(`Set a 12-month roadmap: automate transfers, schedule quarterly reviews, and rebalance annually.`);

  return R;
}

// keep the old name available to existing imports
export { buildRecommendations as recommend };

// ---------- Snapshot for APIs / UI cards ----------
export function getPlanSnapshot(input: PlanInput) {
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

  // Savings (implied from cash flow)
  const impliedSavingsFromCashflow = Math.max(0, grossIncome - totalAnnualSpend);
  const impliedSavingsRate = grossIncome > 0 ? (impliedSavingsFromCashflow / grossIncome) * 100 : 0;

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
  const monthlyBurn = Math.max(1000, n(input.fixedMonthlySpend) + n(input.lifestyleMonthlySpend));
  const efTarget = monthlyBurn * targetEFMonths;
  const efGap = Math.max(0, efTarget - n(input.cash));
  const efGapPerMonth = Math.ceil(efGap / 12);

  // Simple 401k employee-limit gap (guidance only)
  const employee401kGap = Math.max(0, EMP_401K_LIMIT - Math.min(EMP_401K_LIMIT, n(input.retirement)));
  const employee401kGapPerMonth = Math.ceil(employee401kGap / 12);

  // RSU withholding gap rough-in
  const rsuTaxGap = Math.max(0, RSU_PLAUSIBLE_RATE - RSU_DEFAULT_WH) * n(input.rsuVesting);

  return {
    grossIncome,
    totalAnnualSpend,
    impliedSavingsFromCashflow,
    impliedSavingsRate,          // %
    totalAssets,
    totalDebts,
    netWorth,

    targetEFMonths,
    monthlyBurn,
    efTarget,
    efGap,
    efGapPerMonth,

    employee401kGap,
    employee401kGapPerMonth,

    rsuTaxGap,
  };
}