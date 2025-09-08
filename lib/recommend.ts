// lib/recommend.ts
import type { PlanInput } from './types';

/** Output shown on Review step */
export type PlanOutput = {
  greeting: string;
  snapshot: {
    grossIncome: number;
    annualSpend: number;
    impliedSavingsRate: number; // 0..1
    efTarget: number;           // target emergency dollars
    efGap: number;              // + need, - surplus
    assets: number;
    debts: number;
    netWorth: number;
  };
  recs: string[];
};

function n(v: any) { return Number.isFinite(v) ? v : 0; }
function sum(...vals: Array<number | undefined>) { return vals.reduce((a, b) => a + n(b), 0); }
function pct(v: number) { return Math.round(v * 100); }
function money(v: number) {
  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs/1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs/1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }

/** Core calculator (pure) */
export function recommend(input: PlanInput, overrides: Partial<PlanInput> = {}): PlanOutput {
  const x = { ...input, ...overrides };

  // Income (simple, non-sensitive)
  const grossIncome =
    sum(x.salary, x.bonus, x.selfEmployment, x.rsuVesting, x.k1Active, x.k1Passive, x.otherIncome) +
    Math.max(0, n(x.rentNOI));

  // Spend and savings
  const annualSpend = 12 * (n(x.fixedMonthlySpend) + n(x.lifestyleMonthlySpend));
  const impliedSavingsRate = grossIncome > 0 ? clamp((grossIncome - annualSpend) / grossIncome, 0, 1) : 0;

  // Balance sheet
  const assets = sum(x.cash, x.brokerage, x.retirement, x.hsa, x.realEstateEquity, x.privateEquityVC, x.crypto);
  const debts  = sum(x.mortgageDebt, x.studentLoans, x.autoLoans, x.creditCards, x.otherDebt);
  const netWorth = assets - debts;

  // Emergency fund target
  const monthlyCore = n(x.fixedMonthlySpend) + Math.max(0, n(x.lifestyleMonthlySpend) * 0.5);
  const efTarget = monthlyCore * clamp(n(x.emergencyFundMonths), 0, 24); // allow >12 if user sets it
  const efGap = efTarget - n(x.cash);

  // Personalization knobs
  const wantsAggressive = n(x.confidence) >= 7;
  const doesItemize = !!x.itemizeLikely;
  const doesCharity = !!x.charitableInclination;

  const recs: string[] = [];
  const name = (x.firstName || '').trim();
  const greeting = name ? `Hi ${name} — here’s your snapshot and the next best moves:` :
                          `Here’s your snapshot and the next best moves:`;

  // Snapshot-aware, conditional recs
  // Savings rate
  if (impliedSavingsRate < 0.20) {
    recs.push(
      `Increase savings: implied rate is ~${pct(impliedSavingsRate)}%. Aim for at least 20%` +
      (wantsAggressive ? '–30% to accelerate your goals.' : '.')
    );
  } else if (impliedSavingsRate < 0.30 && wantsAggressive) {
    recs.push(`Great start: ~${pct(impliedSavingsRate)}% savings. Stretch toward ~30% while major goals are near.`);
  } else {
    recs.push(`Excellent savings discipline (~${pct(impliedSavingsRate)}%). Maintain and automate increases annually.`);
  }

  // Emergency fund
  if (efGap > 0) {
    recs.push(
      `Build emergency fund to ~${money(efTarget)} (${n(x.emergencyFundMonths)} months). Need about ${money(efGap)} more — use HYSA or T-Bills.`
    );
  } else {
    recs.push(`Emergency fund at target (~${money(efTarget)}). Keep excess cash invested if time horizon > 3 years.`);
  }

  // Tax-advantaged space
  recs.push(`Max tax-advantaged space: 401(k)/403(b), IRA/backdoor Roth, and HSA (if HDHP eligible).`);

  // Backdoor/Mega-backdoor Roth if relevant
  if (x.usingRothBackdoor || impliedSavingsRate >= 0.2) {
    recs.push(`If income exceeds Roth limits, consider backdoor Roth (watch pro-rata).`);
  }
  if (x.usingMegaBackdoor) {
    recs.push(`Your plan supports mega-backdoor Roth — use it for extra tax-advantaged savings.`);
  }

  // RSUs & concentration
  if (n(x.rsuVesting) > 0 || x.concentrationRisk) {
    recs.push(
      `RSUs / concentration: set trading rules (83b/10b5-1 when applicable), verify withholding, and diversify concentrated positions.`
    );
  }

  // Itemize vs. standard; charity
  if (doesItemize) {
    recs.push(`Likely to itemize: run standard vs. itemized comparison (SALT cap, mortgage interest, charity).`);
  } else {
    recs.push(`Likely to take standard deduction: consider “bunching” deductions in alternating years if close to the threshold.`);
  }
  if (doesCharity) {
    recs.push(`Charitable intent: consider a Donor-Advised Fund to group gifts into high-income years and donate appreciated assets.`);
  }

  // Debt ordering
  if (n(x.creditCards) > 0) recs.push(`Prioritize credit-card payoff first; then student/auto; keep mortgage if rate is attractive.`);
  else if (n(x.studentLoans) + n(x.autoLoans) > 0) recs.push(`After any high-interest debt, sustain retirement contributions while paying student/auto loans.`);

  // Portfolio
  recs.push(`Use a diversified, low-cost portfolio; set an annual rebalance rule and automate contributions.`);

  // Insurance & estate
  if (!x.hasDisability) recs.push(`Add long-term disability insurance — it’s the most important income-protection coverage.`);
  if (!x.hasUmbrella)   recs.push(`Consider umbrella liability coverage to protect against lawsuits.`);
  if (!x.hasWillOrTrust) recs.push(`Create a will and (if appropriate) a revocable living trust; add POA and healthcare directives.`);

  // Long-run retirement target (rough 4% rule proxy)
  const retireMo = Math.max(0, n(x.targetRetireIncomeMonthly));
  if (retireMo > 0) {
    const need = retireMo * 12 / 0.04;
    recs.push(
      `Retirement income goal ~${money(retireMo)}/mo ⇒ long-run nest egg ~${money(need)} (4% rule proxy). Adjust for pensions/real estate income.`
    );
  }

  return {
    greeting,
    snapshot: { grossIncome, annualSpend, impliedSavingsRate, efTarget, efGap, assets, debts, netWorth },
    recs,
  };
}