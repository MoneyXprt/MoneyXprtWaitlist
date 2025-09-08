// lib/recommend.ts
import type { PlanInput } from './types';

function pct(n: number | undefined, d: number | undefined) {
  const N = Number(n || 0), D = Number(d || 0);
  if (!D || D <= 0) return 0;
  return (N / D) * 100;
}

function sum(...nums: Array<number | undefined>) {
  return nums.reduce((a, b) => a + (Number(b || 0)), 0);
}

export type PlanOutput = {
  recommendations: string[];
  followUps: string[];          // questions to tighten the plan
  metrics: {
    grossIncome: number;
    impliedSavingsRatePct: number;
    retirementTargetYr: number; // very rough guidance (4% rule)
  };
};

export function buildRecommendations(input: PlanInput): PlanOutput {
  const name = (input.firstName || '').trim();

  // Gross-ish income (very approximate—no sensitive breakdown)
  const grossIncome = sum(
    input.cashflow?.incomeW2,
    input.cashflow?.bonus,
    input.cashflow?.rsuVesting,
    input.cashflow?.selfEmploymentNet,
    input.cashflow?.rentalNOI,
    input.cashflow?.other,
  );

  const totalContrib = sum(
    input.savings?.employee401k,
    input.savings?.hsa,
    input.savings?.solo401kSep,
    input.savings?.contrib529
  );

  const impliedSavingsRate = pct(totalContrib, grossIncome);

  // Retirement income target: if user didn’t give one, infer rough lifestyle from income
  const desiredYrIncome = Math.max(60000, Math.min(0.5 * grossIncome, 300000));
  const portfolioNeeded = desiredYrIncome * 25; // 4% rule
  const personalizedPrefix = name ? `${name}, ` : '';

  const R: string[] = [];

  // Baseline personalization
  R.push(`${personalizedPrefix}here’s a first pass based on what you entered. Edit anything and regenerate.`);

  // Savings rate guidance
  if (impliedSavingsRate >= 30) {
    R.push(`Great job—your implied savings rate is about ${impliedSavingsRate.toFixed(0)}%. Keep it ≥20–30% to accelerate financial freedom.`);
  } else if (impliedSavingsRate >= 15) {
    R.push(`Your implied savings rate is ~${impliedSavingsRate.toFixed(0)}%. Consider nudging it toward 20–30% to reach goals faster.`);
  } else {
    R.push(`Your implied savings rate looks low (~${impliedSavingsRate.toFixed(0)}%). Redirect some cash flow into automated savings and tax-advantaged accounts.`);
  }

  // Emergency fund
  const liquidityNeed = Number(input.targets?.liquidity12mo || 0);
  if (liquidityNeed > 0) {
    R.push(`Set aside ~$${(liquidityNeed).toLocaleString()} in cash over the next 12 months for planned needs; keep it in high-yield savings or T-Bills.`);
  } else {
    R.push(`Hold an emergency fund of ~3–6 months’ expenses in high-yield savings or T-Bills.`);
  }

  // Tax-advantaged space
  R.push(`Max available tax-advantaged space: 401(k)/403(b), IRA/backdoor Roth, and HSA (if HDHP). Revisit Roth vs. pre-tax based on your target effective rate (~${input.targets?.effRate ?? 28}%).`);

  // Charitable intent
  if (input.goals?.charitableIntent) {
    R.push(`You noted charitable intent: consider bunching gifts or using a Donor-Advised Fund to get larger deductions in high-income years.`);
  }

  // Concentration & RSUs (mildly tailored if they have RSUs)
  if ((input.cashflow?.rsuVesting || 0) > 0) {
    R.push(`RSUs: confirm tax withholding; many plans under-withhold. Use a 10b5-1 plan and sell to your target allocation to manage concentration risk.`);
  } else {
    R.push(`Reduce concentration risk by setting target weights and scheduling periodic rebalancing (quarterly/annual).`);
  }

  // Debt guidance (generic but useful without asking exact balances/rates)
  R.push(`If you carry high-interest debt, prioritize those balances first, then student/auto, while making required mortgage payments.`);

  // Insurance
  R.push(`Add (or review) long-term disability insurance—often the most important income protection for high earners.`);

  // Retirement target framing
  R.push(`A rough retirement income target of ~$${desiredYrIncome.toLocaleString()}/yr implies a long-run portfolio of ~$${portfolioNeeded.toLocaleString()}. Adjust for pensions/real estate as applicable.`);

  // Estate
  if (!input.goals?.hasWillOrTrust) {
    R.push(`Create a will and (if appropriate) a revocable living trust. Add healthcare directives and durable powers of attorney.`);
  }

  // Next 12 months
  R.push(`Set a 12-month roadmap: automate savings, schedule quarterly reviews, and rebalance annually.`);

  // FOLLOW-UPS (so the user can iterate)
  const followUps: string[] = [];
  if (!name) followUps.push('What first name should we use to personalize your plan?');
  if (!input.targets?.effRate) followUps.push('What effective tax rate are you aiming for this year?');
  if (!input.savings?.employee401k) followUps.push('Do you plan to max your employee 401(k) deferrals?');
  if (input.profile?.hdhpEligible && !input.savings?.hsa) followUps.push('Since you are HDHP-eligible, do you want to fund an HSA?');
  if (input.goals?.charitableIntent && !input.deductions?.charityCash && !input.deductions?.charityNonCash)
    followUps.push('Any planned charitable gifts this year (cash or appreciated stock)?');
  if (!input.goals?.hasWillOrTrust) followUps.push('Do you want guidance on a simple estate plan checklist?');

  return {
    recommendations: R,
    followUps,
    metrics: {
      grossIncome,
      impliedSavingsRatePct: impliedSavingsRate,
      retirementTargetYr: desiredYrIncome,
    },
  };
}