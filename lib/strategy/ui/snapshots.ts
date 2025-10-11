"use client";
// lib/strategy/ui/snapshots.ts
import { useMemo } from "react";
import type { PlanInput } from "@/lib/types";
import { EMPTY_PLAN } from "@/lib/types";
import { usePlannerStore } from "@/lib/store/planner";

// Snapshot composer and helpers migrated from legacy plannerStore

export function toEngineSnapshot(data: PlanInput, opts?: { year?: number; state?: string }) {
  const profile: any = {
    filingStatus: (data.filingStatus as any) || 'single',
    primaryState: data.state || opts?.state || 'CA',
    year: opts?.year ?? new Date().getFullYear(),
    agiEstimate:
      (data.salary ?? 0) +
      (data.bonus ?? 0) +
      (data.selfEmployment ?? 0) +
      (data.k1Active ?? 0) +
      (data.k1Passive ?? 0) +
      (data.otherIncome ?? 0),
    itemize: !!data.itemizeLikely,
  } as any;

  const entities: any[] = data.entityOrSideBiz
    ? [{ type: 's_corp', ownershipPct: 100, reasonableCompEst: data.w2BaseAnnual || 0 }]
    : [];

  const income: any[] = [
    { source: 'w2', amount: data.w2BaseAnnual || data.salary || 0 },
    { source: 'k1', amount: (data.k1Active || 0) + (data.k1Passive || 0), qbiFlag: true },
    { source: 'interest', amount: data.otherIncome || 0 },
  ];

  const properties: any[] = (data.properties || []).map((p) => ({
    use: p.use === 'rental' || p.use === 'primary_home' ? ('rental_res' as any) : ((p.use as any) ?? 'rental_res'),
    placedInService: (p as any).placedInService || undefined,
    costBasis: p.estimatedValue || 0,
    landAllocPct: p?.state ? 20 : 20,
    bonusEligible: true,
    materialParticipation: 'none',
  }));

  return { profile, entities, income, properties };
}

export type Snapshot = {
  profile: {
    filingStatus: 'Single' | 'MFJ' | 'MFS' | 'HOH';
    domicileState: string;
    residency?: { state: string; start?: string; end?: string }[];
    dependents?: number;
  };
  income: { w2?: number; k1?: number; other1099?: number; passiveRE?: number };
  entities: { type: 's_corp' | 'partnership' | 'sole_prop'; wages?: number; ubia?: number }[];
  properties: {
    use: 'rental_res' | 'rental_comm' | 'STR';
    basis: number;
    landPct: number;
    placedInService?: string;
    bonusEligible?: boolean;
    materialParticipation?: 'none' | '100' | '500' | 'MBP';
  }[];
  settings: { year: number; states: string[]; highRisk?: boolean };
  selected: string[];
};

function filingToSnapshot(fs: PlanInput['filingStatus']): Snapshot['profile']['filingStatus'] {
  switch (fs) {
    case 'married_joint':
      return 'MFJ';
    case 'married_separate':
      return 'MFS';
    case 'head':
      return 'HOH';
    default:
      return 'Single';
  }
}

export function toSnapshot(data: PlanInput): Snapshot {
  const year = new Date().getFullYear();
  return {
    profile: {
      filingStatus: filingToSnapshot(data.filingStatus),
      domicileState: data.state || '',
      residency: (data.residency || []).map((r) => ({ state: r.state, start: r.startDate, end: r.endDate })),
      dependents: undefined,
    },
    income: {
      w2: data.w2BaseAnnual || data.salary || 0,
      k1: (data.k1Active || 0) + (data.k1Passive || 0),
      other1099: data.selfEmployment || 0,
      passiveRE: data.rentNOI || 0,
    },
    entities: data.entityOrSideBiz ? [{ type: 's_corp', wages: data.w2BaseAnnual || 0, ubia: undefined }] : [],
    properties: (data.properties || []).map((p: any) => ({
      use: (p.use === 'rental' ? 'rental_res' : p.use) || 'rental_res',
      basis: p.estimatedValue || 0,
      landPct: 0.2,
      placedInService: p.placedInService,
      bonusEligible: true,
      materialParticipation: 'none',
    })),
    settings: { year, states: data.state ? [data.state] : [], highRisk: undefined },
    selected: [],
  };
}

export function usePlannerSnapshot(): Snapshot {
  const data = usePlannerStore((s) => s.data);
  return useMemo(() => toSnapshot(data), [data]);
}

// Demo prefill helper
export function buildDemoSnapshot(kind: string): PlanInput | null {
  const demo = kind === 'ca300k1rental';
  if (!demo) return null;
  const year = new Date().getFullYear();
  const p: PlanInput = {
    ...EMPTY_PLAN,
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
    state: 'CA',
    filingStatus: 'single',
    w2BaseAnnual: 300000,
    salary: 300000,
    rentNOI: 24000,
    properties: [
      {
        id: 'demo-prop-1',
        use: 'rental',
        estimatedValue: 450000,
        mortgageBalance: 0,
        state: 'CA',
        nickname: 'Demo Rental',
        ...( { placedInService: `${year}-01-01` } as any),
      },
    ],
    itemizeLikely: true,
    targetRetireAge: 65,
  };
  return p;
}

