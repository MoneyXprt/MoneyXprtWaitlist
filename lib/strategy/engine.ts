// lib/strategy/engine.ts
import { evalPredicate } from './dsl';
import STRATEGY_REGISTRY from './registry';
import {
  CalcContext,
  EngineOptions,
  RecommendationItem,
  StrategyCalcFn,
  TaxProfile,
  Entity,
  IncomeStream,
  Property,
} from './types';

import qbi_199a_basic from './calcs/qbi_199a_basic';
import state_ptet_basic from './calcs/state_ptet_basic';
import re_cost_seg_bonus_basic from './calcs/re_cost_seg_bonus_basic';
import retirement_max_gap from './calcs/retirement_max_gap';
import charity_daf_bunch from './calcs/charity_daf_bunch';
import augusta_280a from './calcs/augusta_280a';
import employ_children from './calcs/employ_children';

const CALC_MAP: Record<string, StrategyCalcFn> = {
  qbi_199a_basic,
  state_ptet_basic,
  re_cost_seg_bonus_basic,
  retirement_max_gap,
  charity_daf_bunch,
  augusta_280a,
  employ_children,
};

function sum(nums: number[]) {
  return nums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

// Enrich context with computed totals referenced by DSL
function buildEvalContext(profile: TaxProfile, entities: Entity[], income: IncomeStream[], properties: Property[]) {
  const qbi = sum(income.filter((i) => i.qbiFlag).map((i) => i.amount));
  const passThru = sum(
    income.filter((i) => i.source === 'k1' || i.source === '1099' || i.source === 'schc').map((i) => i.amount)
  );
  const depreciableBasis = properties.reduce((acc, p) => acc + (p.costBasis ?? 0) * (1 - Math.min(0.9, Math.max(0, (p.landAllocPct ?? 20) / 100))), 0);

  return {
    profile,
    entities,
    income,
    properties,
    incomeTotal: { qbi, passThru },
    propertiesTotal: { depreciableBasis },
  } as Record<string, any>;
}

export function buildRecommendations(
  profile: TaxProfile,
  entities: Entity[],
  income: IncomeStream[],
  properties: Property[],
  options: EngineOptions = {}
): RecommendationItem[] {
  const ctxEval = buildEvalContext(profile, entities, income, properties);

  const ctxCalc: CalcContext = {
    profile,
    entities,
    income,
    properties,
    stateParams: defaultStateParams, // MVP seed
    lawParams: defaultLawParams2025, // MVP seed
  };

  const year = options.year ?? profile.year;
  if (typeof year === 'number') ctxCalc.profile.year = year;

  const includeHighRisk = !!options.includeHighRisk;

  const items: RecommendationItem[] = [];
  for (const s of STRATEGY_REGISTRY) {
    if (!s.active) continue;
    if (s.highRiskToggle && !includeHighRisk) continue;
    const eligible = evalPredicate(s.eligibility, ctxEval);
    if (!eligible) continue;
    const fn = CALC_MAP[s.calc];
    if (!fn) continue;
    const res = fn(ctxCalc);
    if (!res || !(res.savingsEst > 0)) continue;
    items.push({
      strategyId: s.id,
      savingsEst: res.savingsEst,
      cashOutlayEst: res.cashOutlayEst,
      stateAddbacks: res.stateAddbacks,
      flags: res.flags,
      steps: res.steps,
      riskScore: res.riskScore ?? s.riskLevel,
      complexity: res.complexity,
    });
  }

  return items.sort((a, b) => b.savingsEst - a.savingsEst);
}

// ---------- Minimal engine over Snapshot for Pass 4 ----------
import type { Snapshot } from './ui/plannerStore';
import { BASIC_CALC_MAP } from './calcs/basic';
import type { RecommendationItem as MiniRecommendationItem } from './reco';
import core from './registry/core.json' assert { type: 'json' };

type CoreEntry = { code: string; name: string; category: string; eligibility: any };

function getPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

export function runEngine(snapshot: Snapshot): MiniRecommendationItem[] {
  const items: MiniRecommendationItem[] = [];
  const regs: CoreEntry[] = (core as any) || [];
  for (const r of regs) {
    const eligible = evalPredicate(r.eligibility as any, {
      ...snapshot,
      properties: snapshot.properties,
      income: snapshot.income,
      profile: snapshot.profile,
      settings: snapshot.settings,
      get: getPath,
    } as any);
    if (!eligible) continue;
    const calc = BASIC_CALC_MAP[r.code];
    if (!calc) continue;
    const res = calc(snapshot);
    if (!res || !(res.savingsEst > 0)) continue;
    items.push({ code: r.code, name: r.name, category: r.category, savingsEst: res.savingsEst, risk: res.risk, steps: res.steps });
  }
  return items.sort((a, b) => b.savingsEst - a.savingsEst);
}

// Minimal in-file seed params for MVP. Replace with DB-backed lookups.
export const defaultLawParams2025 = {
  '199A_thresholds': { single: 191950, married_joint: 383900 },
  'bonus_pct': 0.6, // example placeholder
};

export const defaultStateParams: Record<string, { ptet_available: boolean; ptet_rate: number }> = {
  CA: { ptet_available: true, ptet_rate: 0.093 },
  NY: { ptet_available: true, ptet_rate: 0.10 },
  TX: { ptet_available: false, ptet_rate: 0 }, // no PIT; PTET nuances
  FL: { ptet_available: false, ptet_rate: 0 },
  WA: { ptet_available: false, ptet_rate: 0 }, // B&O; PTET style limited
  IL: { ptet_available: true, ptet_rate: 0.048 },
  MN: { ptet_available: true, ptet_rate: 0.0965 },
};
