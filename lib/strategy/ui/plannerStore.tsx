// lib/strategy/ui/plannerStore.tsx
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { PlanInput } from '@/lib/types';
import { EMPTY_PLAN } from '@/lib/types';

type PlannerState = {
  data: PlanInput;
  includeHighRisk: boolean;
  // cache last recommendations for scenario builder
  lastRecoItems?: any[];
  selectedStrategies: string[]; // codes in order
};

type PlannerAction =
  | { type: 'setAll'; payload: PlanInput }
  | { type: 'patch'; payload: Partial<PlanInput> }
  | { type: 'updatePath'; path: string; value: any }
  | { type: 'toggleHighRisk'; value?: boolean }
  | { type: 'setRecoItems'; items: any[] }
  | { type: 'select'; code: string }
  | { type: 'deselect'; code: string }
  | { type: 'clearSelected' }
  | { type: 'reorder'; from: number; to: number };

const STORAGE_KEY = 'planner:v1';

function reducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case 'setAll':
      return { ...state, data: action.payload };
    case 'patch':
      return { ...state, data: { ...state.data, ...action.payload } };
    case 'updatePath': {
      const next = structuredClone(state.data) as any;
      const parts = action.path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] ?? (cur[parts[i]] = {});
      cur[parts[parts.length - 1]] = action.value;
      return { ...state, data: next };
    }
    case 'toggleHighRisk':
      return { ...state, includeHighRisk: action.value ?? !state.includeHighRisk };
    case 'setRecoItems':
      return { ...state, lastRecoItems: action.items };
    case 'select': {
      if (state.selectedStrategies.includes(action.code)) return state;
      return { ...state, selectedStrategies: [...state.selectedStrategies, action.code] };
    }
    case 'deselect':
      return { ...state, selectedStrategies: state.selectedStrategies.filter((c) => c !== action.code) };
    case 'clearSelected':
      return { ...state, selectedStrategies: [] };
    case 'reorder': {
      const arr = [...state.selectedStrategies];
      const [item] = arr.splice(action.from, 1);
      arr.splice(action.to, 0, item);
      return { ...state, selectedStrategies: arr };
    }
    default:
      return state;
  }
}

const PlannerCtx = createContext<{
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  reset: () => void;
} | null>(null);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as any, () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as PlannerState;
      } catch {}
    }
    return { data: EMPTY_PLAN, includeHighRisk: false, selectedStrategies: [], lastRecoItems: [] } satisfies PlannerState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: 'setAll', payload: EMPTY_PLAN });
  }, []);

  const value = useMemo(() => ({ state, dispatch, reset }), [state, reset]);
  return <PlannerCtx.Provider value={value}>{children}</PlannerCtx.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerCtx);
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
  return ctx;
}

// Snapshot composer for strategy engine MVP (reuses existing engine mapping)
import type { TaxProfile, Entity, IncomeStream, Property } from '@/lib/strategy';

export function toEngineSnapshot(data: PlanInput, opts?: { year?: number; state?: string }) {
  // Coarse mapping from PlanInput to engine inputs
  const profile: TaxProfile = {
    filingStatus: (data.filingStatus as any) || 'single',
    primaryState: data.state || opts?.state || 'CA',
    year: opts?.year ?? new Date().getFullYear(),
    agiEstimate: (data.salary ?? 0) + (data.bonus ?? 0) + (data.selfEmployment ?? 0) + (data.k1Active ?? 0) + (data.k1Passive ?? 0) + (data.otherIncome ?? 0),
    itemize: !!data.itemizeLikely,
  } as any;

  const entities: Entity[] = data.entityOrSideBiz
    ? [{ type: 's_corp', ownershipPct: 100, reasonableCompEst: data.w2BaseAnnual || 0 }]
    : [];

  const income: IncomeStream[] = [
    { source: 'w2', amount: data.w2BaseAnnual || data.salary || 0 },
    { source: 'k1', amount: (data.k1Active || 0) + (data.k1Passive || 0), qbiFlag: true },
    { source: 'interest', amount: data.otherIncome || 0 },
  ];

  const properties: Property[] = (data.properties || []).map((p) => ({
    use: p.use === 'rental' || p.use === 'primary_home' ? ('rental_res' as any) : ((p.use as any) ?? 'rental_res'),
    placedInService: (p as any).placedInService || undefined,
    costBasis: p.estimatedValue || 0,
    landAllocPct: p?.state ? 20 : 20,
    bonusEligible: true,
    materialParticipation: 'none',
  }));

  return { profile, entities, income, properties };
}

// ---------- PASS 3: public Snapshot type + selector ----------
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
  const { state } = usePlanner();
  return useMemo(() => toSnapshot(state.data), [state.data]);
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
        // extra fields consumed by engine mapper
        ...( { placedInService: `${year}-01-01` } as any),
      },
    ],
    itemizeLikely: true,
    targetRetireAge: 65,
  };
  return p;
}
