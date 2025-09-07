import type { PlanInput } from './types';

function fmt(n: number) {
  if (!Number.isFinite(n)) return '$0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function buildRecommendations(input: PlanInput): string[] {
  const R: string[] = [];

  // ── 0) Convenience totals ────────────────────────────────────────────────
  const annualIncome =
    (input.salary || 0) +
    (input.bonus || 0) +
    (input.selfEmployment || 0) +
    (input.rsuVesting || 0) +
    (input.k1Active || 0) +
    (input.k1Passive || 0) +
    (input.rentNOI || 0) +
    (input.otherIncome || 0);

  const monthlySpend =
    (input.fixedMonthlySpend || 0) + (input.lifestyleMonthlySpend || 0);

  const annualSpend = monthlySpend * 12;
  const annualSavingsNow = (input.savingsMonthly || 0) * 12;

  const impliedSavings = Math.max(0, annualIncome - annualSpend);
  const effectiveSavings = Math.max(0, annualSavingsNow, impliedSavings);

  const savingsRate =
    annualIncome > 0 ? (effectiveSavings / annualIncome) : 0;

  // ── 1) Personal touch (but no sensitive data) ────────────────────────────
  const name = (input.goals5y?.join(' ') ?? '').trim(); // if Discovery captured first name separately you can switch
  if (!name) {
    R.push('Add your first name to personalize your plan.');
  }

  // ── 2) Cash-flow & savings strategy ──────────────────────────────────────
  if (annualIncome <= 0) {
    R.push('Enter your income to unlock cash-flow, tax, and savings recommendations.');
  } else {
    if (savingsRate < 0.2) {
      R.push(
        `Target a 20–30% savings rate. Today you’re at ~${Math.round(
          savingsRate * 100
        )}%. Consider trimming $${fmt(
          Math.max(0, 0.2 * annualIncome - effectiveSavings)
        )}/yr from spending or boosting income to hit 20%.`
      );
    } else {
      R.push(
        `Great job: your implied savings rate is ~${Math.round(
          savingsRate * 100
        )}%. Keep at least 20–30% to accelerate financial freedom.`
      );
    }
  }

  // ── 3) Emergency fund ────────────────────────────────────────────────────
  const targetEFMonths = Math.max(3, Math.min(12, input.emergencyFundMonths || 6)); // simple anchor
  const efNeeded = Math.max(0, targetEFMonths * monthlySpend);
  if ((input.emergencyFundMonths || 0) < 6) {
    R.push(
      `Build an emergency fund of ~6 months’ expenses (~$${fmt(
        6 * monthlySpend
      )}). Park this in high-yield savings or T-bills.`
    );
  } else {
    R.push(
      `Maintain your emergency fund (~${input.emergencyFundMonths} months) in high-yield, safe accounts.`
    );
  }

  // ── 4) Tax & account optimization (high-level; no sensitive data) ───────
  if (annualIncome > 0) {
    R.push(
      'Max out tax-advantaged space: 401(k)/403(b), IRA/backdoor Roth, and HSA if eligible.'
    );
  }
  if (input.charitableInclination) {
    R.push(
      'Consider “charitable bunching” or a Donor-Advised Fund to group gifts into high-income years for larger deductions.'
    );
  }
  if (input.entityOrSideBiz || input.selfEmployment > 0) {
    R.push(
      'Review entity optimization (e.g., S-Corp when appropriate) and set up Solo-401(k)/SEP-IRA for side-business income.'
    );
  }

  // RSU / K-1 specifics
  if ((input.rsuVesting || 0) > 0) {
    R.push(
      'RSUs: check tax withholding; many plans under-withhold. Consider a 10b5-1 trading plan and diversify concentrated stock.'
    );
  }
  if ((input.k1Passive || 0) + (input.k1Active || 0) > 0) {
    R.push(
      'Partnership/K-1 income: plan quarterly estimates and track passive vs. active buckets for losses and NIIT exposure.'
    );
  }

  // ── 5) Debt & interest optimization ──────────────────────────────────────
  const totalDebt =
    (input.mortgageDebt || 0) +
    (input.studentLoans || 0) +
    (input.autoLoans || 0) +
    (input.creditCards || 0) +
    (input.otherDebt || 0);

  if (totalDebt > 0) {
    R.push(
      'Prioritize high-interest debt (credit cards) first, then student/auto, while making required mortgage payments.'
    );
  }
  if ((input.mortgageDebt || 0) > 0 && (input.cash || 0) > 3 * monthlySpend) {
    R.push(
      'With strong liquidity, consider modest extra principal payments on your mortgage if the rate is above your safe yield.'
    );
  }

  // ── 6) Diversification & risk ────────────────────────────────────────────
  if (input.concentrationRisk || (input.rsuVesting || 0) > 0) {
    R.push('Reduce concentration risk by setting target weights and auto-selling excess positions on a schedule.');
  }
  if (!input.hasUmbrella) {
    R.push('Add an umbrella liability policy (often $1–2M). Inexpensive protection against lawsuit risks.');
  }
  if (!input.hasDisability) {
    R.push('Add long-term disability insurance; it’s the most important coverage for income protection.');
  }
  if (!input.hasTermLife) {
    R.push('If anyone relies on your income, add level term life (e.g., 10–20 years).');
  }

  // ── 7) Retirement target & glidepath ─────────────────────────────────────
  if ((input.targetRetireIncomeMonthly || 0) > 0) {
    const desiredAnnual = input.targetRetireIncomeMonthly * 12;
    const roughNestEgg = desiredAnnual / 0.04; // 4% rule heuristic
    R.push(
      `Retirement income target ~$${fmt(
        desiredAnnual
      )}/yr ⇒ long-run portfolio ~$${fmt(
        roughNestEgg
      )} (4% rule). Adjust with pensions/real estate as applicable.`
    );
  }
  if (input.usingRothBackdoor) {
    R.push('Continue the backdoor Roth annually; coordinate with pro-rata rules and any pre-tax IRA roll-ins.');
  }
  if (input.usingMegaBackdoor) {
    R.push('Use mega backdoor Roth if your plan allows: after-tax 401(k) + in-plan Roth conversions.');
  }

  // ── 8) Estate & legacy ───────────────────────────────────────────────────
  if (!input.hasWillOrTrust) {
    R.push('Create a will and (if appropriate) a revocable living trust. Add powers of attorney and healthcare directives.');
  }
  if (input.givingIntent) {
    R.push('Map multi-year charitable plan (DAF, appreciated securities) to align impact with tax efficiency.');
  }

  // ── 9) Friendly next steps ───────────────────────────────────────────────
  R.push('Set a 12-month roadmap: automate savings, schedule quarterly reviews, and rebalance annually.');

  // Make sure we always return at least something
  if (R.length === 0) {
    R.push('Add a few inputs to unlock personalized recommendations.');
  }
  return R;
}