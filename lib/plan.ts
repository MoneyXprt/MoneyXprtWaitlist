// lib/plan.ts
import type { PlanInput } from './types';

/** ---------- Action Plan contracts (from Step 1) ---------- */
export type ActionBucket =
  | 'Cash'
  | 'Taxes'
  | 'Investing'
  | 'Debt'
  | 'Protection'
  | 'Estate'
  | 'RealEstate'
  | 'Admin';

export type ActionId = string;

export interface Action {
  id: ActionId;
  title: string;
  bucket: ActionBucket;
  priority: number; // 1 (highest) .. 5 (lowest)
  timeframe: 'This week' | 'This month' | 'This quarter' | 'This year';
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  rationale: string;
  calcRefs?: string[];
  estDollars?: {
    annualTaxSavings?: number;
    annualCashFlowChange?: number;
    oneTimeCostOrFunding?: number;
  };
  links?: { label: string; href: string }[];
  toggles?: string[];
  done?: boolean;
}

export interface Checklist {
  title: 'This week' | 'This month' | 'This quarter' | 'This year';
  actions: ActionId[];
}

export interface CalcTrace {
  id: string;
  label: string;
  inputs: Record<string, number | string | boolean>;
  result?: number | string | boolean;
  note?: string;
}

export interface ActionPlan {
  generatedAt: string;
  assumptionsNote?: string;
  actions: Record<ActionId, Action>;
  checklists: Checklist[];
  flags?: string[];
  traces: CalcTrace[];
}

/** ---------- tiny utils ---------- */
const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) => vals.reduce<number>((a, b) => a + n(b), 0);
const uid = () => Math.random().toString(36).slice(2, 10);

const EMP_401K_LIMIT = 23_000;      // 2024 employee limit (under 50)
const RSU_DEFAULT_WH = 0.22;        // typical supplemental withholding
const RSU_PLAUSIBLE_RATE = 0.35;    // likely true rate for high earners
const TARGET_SAVINGS_LOW = 0.20;    // 20%
const TARGET_SAVINGS_HIGH = 0.30;   // 30%

/** Heuristic: above direct Roth income limits? */
function likelyAboveRothLimits(grossIncome: number, filingStatus: PlanInput['filingStatus']) {
  return (filingStatus === 'married_joint' ? grossIncome > 230_000 : grossIncome > 146_000);
}

/** ---------- core builder ---------- */
export function buildActionPlan(input: PlanInput): ActionPlan {
  // 1) key rollups
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
  const monthlyBurn = Math.max(1000, n(input.fixedMonthlySpend) + n(input.lifestyleMonthlySpend));
  const spendAnnual = monthlyBurn * 12;
  const impliedSavings = Math.max(0, grossIncome - spendAnnual);
  const savingsRate = grossIncome > 0 ? impliedSavings / grossIncome : 0;

  // Real-estate equity rollup (if you’ve already refactored properties)
  // If not present yet, this resolves to 0.
  const realEstateEquity = Array.isArray((input as any).properties)
    ? (input as any).properties.reduce(
        (acc: number, p: any) => acc + Math.max(0, n(p.estimatedValue) - n(p.mortgageBalance)),
        0
      )
    : n((input as any).realEstateEquity || 0);

  // 2) traces (so “Why this?” can show math)
  const traces: CalcTrace[] = [];

  // Emergency fund
  const targetMonths = Math.max(3, n(input.emergencyFundMonths));
  const efTarget = monthlyBurn * targetMonths;
  const efGap = Math.max(0, efTarget - n(input.cash));
  traces.push({
    id: 'emergencyFund',
    label: 'Emergency fund target',
    inputs: { monthlyBurn, targetMonths, cash: n(input.cash) },
    result: efTarget,
    note: 'Liquidity cushion for job/life risk. Target 3–12 months depending on stability.'
  });

  // Savings rate bump to 20%
  const needToLow = Math.max(0, TARGET_SAVINGS_LOW * grossIncome - impliedSavings);
  const needToLowPerMonth = Math.ceil(needToLow / 12);
  traces.push({
    id: 'savingsRate20',
    label: 'Bump to 20% savings rate',
    inputs: { grossIncome, impliedSavings, targetRate: TARGET_SAVINGS_LOW },
    result: needToLowPerMonth,
    note: 'Pay-yourself-first automation after each paycheck.'
  });

  // 401k employee deferral gap (only a rough nudge)
  // We don’t know current YTD deferral amount; we use “retirement” balance as a proxy-free hint.
  const max401kGapMonthly = Math.ceil(Math.max(0, EMP_401K_LIMIT) / 12);
  traces.push({
    id: 'employee401k',
    label: '401(k) employee deferral headroom',
    inputs: { employeeLimit: EMP_401K_LIMIT },
    result: max401kGapMonthly,
    note: 'If not maxing the employee limit, increase payroll deferral.'
  });

  // RSU withholding gap
  const rsuWithholdGap = Math.max(0, RSU_PLAUSIBLE_RATE - RSU_DEFAULT_WH) * n(input.rsuVesting);
  traces.push({
    id: 'rsuWithholdingGap',
    label: 'RSU withholding gap estimate',
    inputs: { rsuVesting: n(input.rsuVesting), defaultWH: RSU_DEFAULT_WH, plausibleRate: RSU_PLAUSIBLE_RATE },
    result: rsuWithholdGap,
    note: 'Supplemental withholding is often 22%; many high earners owe more. Set aside the gap.'
  });

  // 3) draft actions (small + concrete)
  const actions: Record<ActionId, Action> = {};

  const add = (a: Omit<Action, 'id'>): ActionId => {
    const id = uid();
    actions[id] = { id, ...a };
    return id;
  };

  // Cash — EF top-up
  if (efGap > 0) {
    add({
      title: `Auto-transfer ~$${Math.ceil(efGap / 12).toLocaleString()}/mo to HYSA until you reach ${targetMonths} months`,
      bucket: 'Cash',
      priority: 1,
      timeframe: 'This month',
      effort: 'Low',
      impact: 'High',
      rationale: `Build ${targetMonths} months of expenses (${formatMoney(efTarget)} target).`,
      calcRefs: ['emergencyFund'],
      estDollars: { oneTimeCostOrFunding: efGap },
      links: [{ label: 'Where to find balances', href: '#' }],
      toggles: ['Pay-yourself-first']
    });
  }

  // Cash — savings rate bump to 20%
  if (savingsRate < TARGET_SAVINGS_LOW) {
    add({
      title: `Increase automated savings by ~$${needToLowPerMonth.toLocaleString()}/mo (hit 20% savings rate)`,
      bucket: 'Cash',
      priority: 1,
      timeframe: 'This week',
      effort: 'Low',
      impact: 'High',
      rationale: 'Compounding > everything. Lock in a baseline savings rate.',
      calcRefs: ['savingsRate20']
    });
  }

  // Taxes — RSU withholding set-aside
  if (n(input.rsuVesting) > 0 && rsuWithholdGap > 0) {
    add({
      title: `Set aside ~$${Math.round(rsuWithholdGap).toLocaleString()} for RSU tax gap (for this year’s vests)`,
      bucket: 'Taxes',
      priority: 2,
      timeframe: 'This month',
      effort: 'Low',
      impact: 'High',
      rationale: 'Avoid April surprise; supplemental withholding usually under-withholds for high earners.',
      calcRefs: ['rsuWithholdingGap'],
      toggles: ['Use a separate “tax” sub-account']
    });
  }

  // Investing — 401(k) deferral bump (generic nudge)
  add({
    title: `If not maxing, increase 401(k) payroll deferral (rule-of-thumb: up to ~$${max401kGapMonthly.toLocaleString()}/mo)`,
    bucket: 'Investing',
    priority: 2,
    timeframe: 'This month',
    effort: 'Low',
    impact: 'Medium',
    rationale: 'Shelter more income; capture employer match; grow tax-advantaged.',
    calcRefs: ['employee401k']
  });

  // Taxes — Backdoor Roth nudge
  if (likelyAboveRothLimits(grossIncome, input.filingStatus) && !input.usingRothBackdoor) {
    add({
      title: 'Set up backdoor Roth flow (non-deductible IRA → Roth conversion)',
      bucket: 'Taxes',
      priority: 3,
      timeframe: 'This quarter',
      effort: 'Medium',
      impact: 'Medium',
      rationale: 'High earners can still fund Roth via backdoor; watch pro-rata rule.',
      calcRefs: [],
      links: [{ label: 'What is the backdoor Roth?', href: '#' }],
      toggles: ['No existing pre-tax IRA (or roll to 401k first)']
    });
  }

  // Protection — Umbrella
  if (!input.hasUmbrella) {
    add({
      title: 'Get a $1–$2M umbrella liability policy',
      bucket: 'Protection',
      priority: 3,
      timeframe: 'This month',
      effort: 'Low',
      impact: 'High',
      rationale: 'Cheap, high-impact protection for high earners.',
      calcRefs: []
    });
  }

  // Admin — Quarterly review
  add({
    title: 'Put a 30-min quarterly review on calendar (rebalance, RSU set-aside check, goals refresh)',
    bucket: 'Admin',
    priority: 4,
    timeframe: 'This quarter',
    effort: 'Low',
    impact: 'Medium',
    rationale: 'Tiny habit → big compounding gains.',
    calcRefs: []
  });

  // 4) light scoring → checklists (max 5 per list)
  const items = Object.values(actions).sort((a, b) => {
    // earlier timeframe wins, then lower priority number, then impact
    const tOrder = timeOrder(a.timeframe) - timeOrder(b.timeframe);
    if (tOrder !== 0) return tOrder;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return impactScore(b.impact) - impactScore(a.impact);
  });

  const lists: Checklist[] = [
    { title: 'This week', actions: [] },
    { title: 'This month', actions: [] },
    { title: 'This quarter', actions: [] },
    { title: 'This year', actions: [] }
  ];

  for (const it of items) {
    const list = lists.find(l => l.title === it.timeframe);
    if (!list) continue;
    if (list.actions.length < 5) list.actions.push(it.id); // cap to reduce overwhelm
  }

  // 5) flags
  const flags: string[] = [];
  if (efGap > 0) flags.push('Emergency fund below target');
  if (savingsRate < TARGET_SAVINGS_LOW) flags.push('Savings rate below 20%');
  if (rsuWithholdGap > 0 && n(input.rsuVesting) > 0) flags.push('RSU under-withholding likely');

  return {
    generatedAt: new Date().toISOString(),
    assumptionsNote: 'Using high-level 2024 limits and simplified heuristics.',
    actions,
    checklists: lists,
    flags,
    traces
  };
}

/** ---------- helpers ---------- */
function formatMoney(x: number) {
  return x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
function timeOrder(t: Action['timeframe']) {
  return t === 'This week' ? 0 : t === 'This month' ? 1 : t === 'This quarter' ? 2 : 3;
}
function impactScore(i: Action['impact']) {
  return i === 'High' ? 3 : i === 'Medium' ? 2 : 1;
}