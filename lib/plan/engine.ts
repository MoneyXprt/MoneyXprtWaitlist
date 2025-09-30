// lib/plan/engine.ts
import type { PlanInput } from '@/lib/types';

// ----- Local types for the Action Plan -----
export type ActionBucket =
  | 'Cash' | 'Taxes' | 'Investing' | 'Debt' | 'Protection' | 'Estate' | 'RealEstate' | 'Admin';

export type Timeframe = 'This week' | 'This month' | 'This quarter' | 'This year';

export interface Action {
  id: string;
  title: string;
  bucket: ActionBucket;
  priority: number;  // 1 = top
  timeframe: Timeframe;
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
  title: Timeframe;
  actions: string[]; // Action ids
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
  actions: Record<string, Action>;
  checklists: Checklist[];
  flags?: string[];
  traces?: Record<string, CalcTrace>;
}

// ----- helpers -----
const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const id = (s: string) => `${s}-${Math.random().toString(36).slice(2, 9)}`;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Simple priority composer: lower is better
function scorePriority(base: number, impact: 'Low'|'Medium'|'High', effort: 'Low'|'Medium'|'High') {
  let p = base;
  if (impact === 'High') p -= 0.5;
  if (impact === 'Low') p += 0.5;
  if (effort === 'High') p += 0.5;
  if (effort === 'Low') p -= 0.25;
  return Math.max(1, Math.min(5, Math.round(p)));
}

// ----- small calc traces we can "Why this?" -----
function calcEmergencyFund(input: PlanInput): CalcTrace {
  const monthlyBurn = Math.max(1000, n(input.fixedMonthlySpend) + n(input.lifestyleMonthlySpend));
  const monthsTarget = Math.max(3, n(input.emergencyFundMonths));
  const target = monthlyBurn * monthsTarget;
  const gap = Math.max(0, target - n(input.cash));
  return {
    id: 'emergencyFund',
    label: 'Emergency fund gap',
    inputs: { monthlyBurn, monthsTarget, cash: n(input.cash) },
    result: gap,
    note: 'Target cash cushion to cover essential spending without selling investments at a bad time.',
  };
}

function calcRSUWithholdingGap(input: PlanInput): CalcTrace {
  const rsuYear = n(input.rsuVesting);
  if (rsuYear <= 0) {
    return { id: 'rsuWithholdingGap', label: 'RSU withholding gap', inputs: { rsuYear }, result: 0, note: 'No RSU vests expected this year.' };
  }
  const defaultWH = 0.22;       // typical supplemental rate withheld
  const plausibleRate = 0.35;   // many high earners end up ~32–37%
  const gap = Math.max(0, plausibleRate - defaultWH) * rsuYear;
  return {
    id: 'rsuWithholdingGap',
    label: 'RSU withholding gap',
    inputs: { rsuYear, defaultWH, plausibleRate },
    result: gap,
    note: 'Plans often under-withhold on RSU vests vs. your true marginal rate.',
  };
}

function calcSavingsRate(input: PlanInput): CalcTrace {
  const income = [
    input.salary, input.bonus, input.selfEmployment, input.rsuVesting,
    input.k1Active, input.k1Passive, input.otherIncome, input.rentNOI
  ].map(n).reduce((a,b)=>a+b,0);
  const spend = (n(input.fixedMonthlySpend) + n(input.lifestyleMonthlySpend)) * 12;
  const implied = Math.max(0, income - spend);
  const rate = income > 0 ? (implied / income) : 0;
  return {
    id: 'savingsRate',
    label: 'Savings rate',
    inputs: { income, spend, implied },
    result: rate,
    note: 'Rule-of-thumb target is 20–30% for high earners; higher if retiring early.',
  };
}

// ----- action builders (tiny, additive) -----
function actionsFromCash(input: PlanInput, traces: Record<string, CalcTrace>): Action[] {
  const ef = traces.emergencyFund?.result as number;
  if (!ef || ef <= 0) return [];
  const perMonth = Math.ceil(ef / 12);
  return [{
    id: id('cash-ef'),
    title: `Auto-move ~$${perMonth.toLocaleString()} / mo to HYSA/T-bills until cushion reached`,
    bucket: 'Cash',
    priority: scorePriority(2, 'High', 'Low'),
    timeframe: 'This month',
    effort: 'Low',
    impact: 'High',
    rationale: 'Build resilience so market dips or job risk dont force selling assets.',
    calcRefs: ['emergencyFund'],
    estDollars: { oneTimeCostOrFunding: ef },
    links: [{ label: 'Where to find: bank balance + monthly spend', href: '#' }],
    toggles: ['Pay-yourself-first']
  }];
}

function actionsFromRSU(input: PlanInput, traces: Record<string, CalcTrace>): Action[] {
  const gap = traces.rsuWithholdingGap?.result as number;
  if (!gap || gap <= 0) return [];
  const perVestSetAside = Math.round(gap / 4); // crude default
  return [
    {
      id: id('tax-rsu'),
      title: `Increase tax set-aside for RSU vests by ~$${perVestSetAside.toLocaleString()} per vest`,
      bucket: 'Taxes',
      priority: scorePriority(3, 'High', 'Low'),
      timeframe: 'This quarter',
      effort: 'Low',
      impact: 'High',
      rationale: 'Avoid April surprise from under-withheld supplemental wages.',
      calcRefs: ['rsuWithholdingGap'],
      estDollars: { annualTaxSavings: 0, oneTimeCostOrFunding: gap },
      links: [{ label: 'Where to find: vesting schedule & paystubs', href: '#' }],
      toggles: ['Assume 35% marginal vs 22% withheld']
    },
    {
      id: id('invest-concentration'),
      title: 'Set a 10b5-1 or scheduled auto-sell to manage concentration',
      bucket: 'Investing',
      priority: scorePriority(3, 'Medium', 'Medium'),
      timeframe: 'This quarter',
      effort: 'Medium',
      impact: 'Medium',
      rationale: 'Reduce single-stock risk while staying disciplined.',
      calcRefs: ['rsuWithholdingGap']
    }
  ];
}

function actionsFromSavingsRate(input: PlanInput, traces: Record<string, CalcTrace>): Action[] {
  const r = clamp01((traces.savingsRate?.result as number) ?? 0);
  if (r >= 0.2) return [];
  const income = (traces.savingsRate?.inputs?.income as number) ?? 0;
  const need = Math.ceil(((0.2 - r) * income) / 12);
  return [{
    id: id('cash-savingsrate'),
    title: `Raise auto-transfers by ~$${need.toLocaleString()} / mo to hit 20% savings`,
    bucket: 'Cash',
    priority: scorePriority(2, 'High', 'Low'),
    timeframe: 'This month',
    effort: 'Low',
    impact: 'High',
    rationale: 'Pay-yourself-first enforces the plan without decision fatigue.',
    calcRefs: ['savingsRate'],
    estDollars: { annualCashFlowChange: need * 12 }
  }];
}

// Example investing/retirement nudge if not obviously maxing 401k
function actionsFromRetirementSpace(input: PlanInput): Action[] {
  // We dont know exact 401k progress; provide a soft nudge
  return [{
    id: id('invest-401k'),
    title: 'Confirm 401(k) deferral will reach the annual employee limit',
    bucket: 'Investing',
    priority: scorePriority(3, 'Medium', 'Low'),
    timeframe: 'This month',
    effort: 'Low',
    impact: 'Medium',
    rationale: 'Shelter more income; adjust payroll % after raises/bonuses.',
    links: [{ label: 'Where to find: benefits portal > contributions', href: '#' }]
  }];
}

// ----- main entry -----
export function buildActionPlan(input: PlanInput): ActionPlan {
  const tracesArr = [calcEmergencyFund(input), calcRSUWithholdingGap(input), calcSavingsRate(input)];
  const traces: Record<string, CalcTrace> = Object.fromEntries(tracesArr.map(t => [t.id, t]));

  // gather raw actions
  let actions: Action[] = [
    ...actionsFromCash(input, traces),
    ...actionsFromRSU(input, traces),
    ...actionsFromSavingsRate(input, traces),
    ...actionsFromRetirementSpace(input)
  ];

  // score priorities
  actions = actions.map(a => ({ ...a, priority: scorePriority(3, a.impact, a.effort) }));

  // sort by (priority, timeframe)
  const tfScore: Record<Timeframe, number> = { 'This week': 0, 'This month': 1, 'This quarter': 2, 'This year': 3 };
  actions.sort((a,b) => a.priority - b.priority || tfScore[a.timeframe] - tfScore[b.timeframe]);

  // build checklists with 3–5 items max each to avoid overwhelm
  const lists: Timeframe[] = ['This week','This month','This quarter','This year'];
  const byTime: Record<Timeframe, Action[]> = { 'This week':[], 'This month':[], 'This quarter':[], 'This year':[] };
  for (const a of actions) {
    const bucket = byTime[a.timeframe];
    if (bucket.length < 5) bucket.push(a);
  }

  const actionMap: Record<string, Action> = {};
  const checklists: Checklist[] = [];
  for (const t of lists) {
    const ids = byTime[t].map(a => {
      actionMap[a.id] = a;
      return a.id;
    });
    if (ids.length) checklists.push({ title: t, actions: ids });
  }

  return {
    generatedAt: new Date().toISOString(),
    actions: actionMap,
    checklists,
    traces
  };
}
