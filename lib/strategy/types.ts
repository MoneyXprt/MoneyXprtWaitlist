// lib/strategy/types.ts

// Core types for the strategy engine. Keep runtime-only and UI-agnostic.

export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

export type MaterialParticipation = 'none' | '100' | '500' | 'MBP';

export type EntityType = 'sole_prop' | 's_corp' | 'partnership' | 'c_corp' | 'disregarded_llc';

export type IncomeSource =
  | 'w2'
  | 'k1'
  | '1099'
  | 'schc'
  | 'passive_re'
  | 'interest'
  | 'div'
  | 'capg';

export type PropertyUse = 'rental_res' | 'rental_comm' | 'STR' | 'primary';

export type AgiBand = '200-500' | '500-1M' | '1M-5M' | '5M+' | 'lt-200';

// Inputs collected by intake. Minimal for engine MVP; can extend as needed.
export type TaxProfile = {
  id?: string;
  userId?: string;
  filingStatus: FilingStatus;
  primaryState: string;
  residencyDays?: Record<string, number>;
  dependents?: number;
  ages?: number[];
  agiBand?: AgiBand;
  itemize?: boolean;
  year: number;
  agiEstimate?: number;
};

export type Entity = {
  id?: string;
  userId?: string;
  type: EntityType;
  ownershipPct?: number; // 0..100
  reasonableCompEst?: number; // for S-Corp
};

export type IncomeStream = {
  id?: string;
  profileId?: string;
  source: IncomeSource;
  amount: number;
  qbiFlag?: boolean;
};

export type Property = {
  id?: string;
  entityId?: string | null;
  use: PropertyUse;
  placedInService?: string; // ISO date
  costBasis?: number;
  landAllocPct?: number; // 0..100
  bonusEligible?: boolean;
  materialParticipation?: MaterialParticipation;
};

// Strategy registry metadata and rules
export type StrategyRegistryItem = {
  id: string; // short code e.g. "qbi_199a"
  name: string;
  category:
    | 'Entity/Comp'
    | 'Family'
    | 'Timing'
    | 'Retirement'
    | 'Real Estate'
    | 'Charity'
    | 'Equity/Ownership'
    | 'State/Local'
    | 'Investments/NIIT'
    | 'Insurance'
    | 'Estate/Wealth'
    | 'Business exits/exports'
    | 'International';
  description: string;
  active: boolean;
  requiredInputs?: string[];
  riskLevel?: number; // 1-5
  highRiskToggle?: boolean; // true if must be gated behind High-Risk toggle
  eligibility: DslNode; // JSON DSL predicate
  calc: StrategyCalcCode; // key to calculator
  stateOverrides?: Record<string, Partial<Pick<StrategyRegistryItem, 'eligibility' | 'description'>>>;
};

// DSL definition
export type DslValue = string | number | boolean | null | DslNode;
export type DslNode =
  | { and: DslNode[] }
  | { or: DslNode[] }
  | { not: DslNode }
  | { gt: [string, number] }
  | { gte: [string, number] }
  | { lt: [string, number] }
  | { lte: [string, number] }
  | { eq: [string, DslValue] }
  | { in: [string, (string | number | boolean | null)[]] }
  | { exists: [string] };

// Calculator interface
export type CalcContext = {
  profile: TaxProfile;
  entities: Entity[];
  income: IncomeStream[];
  properties: Property[];
  stateParams?: Record<string, unknown>;
  lawParams?: Record<string, unknown>;
};

export type CalcResult = {
  savingsEst: number; // positive tax savings estimate (annualized unless otherwise noted)
  cashOutlayEst?: number;
  stateAddbacks?: Record<string, number>;
  flags?: Record<string, unknown>;
  steps?: { label: string; due?: string }[];
  riskScore?: number; // 1..5
  complexity?: number; // 1..5
};

export type StrategyCalcFn = (ctx: CalcContext) => CalcResult | null;
export type StrategyCalcCode =
  | 'qbi_199a_basic'
  | 'state_ptet_basic'
  | 're_cost_seg_bonus_basic'
  | 'retirement_max_gap'
  | 'charity_daf_bunch'
  | 'augusta_280a'
  | 'employ_children';

export type RecommendationItem = {
  strategyId: string;
  savingsEst: number;
  cashOutlayEst?: number;
  stateAddbacks?: Record<string, number>;
  flags?: Record<string, unknown>;
  steps?: { label: string; due?: string }[];
  riskScore?: number;
  complexity?: number;
};

export type EngineOptions = {
  includeHighRisk?: boolean; // default false
  year?: number; // default current year
  primaryState?: string;
};
