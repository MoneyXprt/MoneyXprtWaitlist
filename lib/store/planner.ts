// lib/store/planner.ts
import { create } from "zustand";
import type { PlannerData as PlannerDataNew, Snapshot as SnapshotNew, Strategy as StrategyNew } from "@/lib/planner/types";
import type { PlanInput } from '@/lib/types'
import { toPlannerData } from '@/lib/planner/adapters'

export type ScenarioItem = {
  code: string;
  name: string;
  savingsEst: number;
  states?: string[];
  risk?: number;
};

export interface PlannerData extends PlannerDataNew { plan?: PlanInput }

type PlannerSetInput = PlannerData | PlanInput | Partial<PlannerData>

export interface PlannerState {
  // Core planner data (replaces legacy context state)
  data: PlannerData;
  snapshots: SnapshotNew[];
  includeHighRisk: boolean;
  lastRecoItems: any[];

  // Scenario selection (items in order)
  selected: ScenarioItem[];

  // Actions: plan data
  setAll: (input: PlannerSetInput) => void;
  patch: (partial: Partial<PlannerData>) => void;
  loadDemo: () => void;
  snapshot: () => SnapshotNew;
  updatePath: (path: string, value: unknown) => void;
  toggleHighRisk: (value?: boolean) => void;
  setRecoItems: (items: any[]) => void;

  // Actions: scenario
  add: (item: ScenarioItem) => void;
  remove: (code: string) => void;
  reorder: (from: number, to: number) => void;
  clear: () => void;

  // Selectors/helpers
  total: () => number;
  selectedStrategies: () => string[]; // codes in order
}

const DEFAULT_DATA: PlannerData = {
  profile: { state: "", filingStatus: "single", income: {}, realEstate: {} },
  strategies: [],
  assumptions: {},
  lastEditedAt: Date.now(),
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  data: DEFAULT_DATA,
  snapshots: [],
  includeHighRisk: false,
  lastRecoItems: [],

  selected: [],

  // Plan data
  setAll: (input) => {
    const prev = get().data
    const isPI = !(input as any)?.lastEditedAt && !(input as any)?.strategies
    const next = isPI
      ? toPlannerData(input as PlanInput, prev)
      : ({ ...prev, ...(input as Partial<PlannerData>), lastEditedAt: (input as any)?.lastEditedAt ?? prev.lastEditedAt ?? Date.now() } as PlannerData)
    set({ data: next })
  },
  patch: (partial) => set((s: PlannerState) => ({ data: { ...s.data, ...partial, lastEditedAt: partial.lastEditedAt ?? Date.now() } })),
  loadDemo: () => set({
    data: {
      profile: { state: "CA", filingStatus: "single", income: { w2: 180000, self: 40000 }, realEstate: { count: 1, avgBasis: 900000 } },
      strategies: [
        { code: "ptet_state", name: "PTET election", estSavings: 8000 },
        { code: "qbi_199a", name: "QBI §199A", estSavings: 12000 },
      ] as StrategyNew[],
      assumptions: { year: new Date().getFullYear() },
      lastEditedAt: Date.now(),
    },
  }),
  snapshot: () => {
    const s = get();
    const snap: SnapshotNew = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`,
      at: Date.now(),
      profile: s.data.profile,
      strategies: s.data.strategies,
    };
    set({ snapshots: [snap, ...s.snapshots].slice(0, 50) });
    return snap;
  },
  updatePath: (path, value) =>
    set((s: PlannerState) => {
      const next: any = structuredClone(s.data);
      const parts = path.split(".");
      let cur = next as any;
      for (let i = 0; i < parts.length - 1; i++) cur[parts[i]] ??= {};
      cur[parts[parts.length - 1]] = value as any;
      return { data: next } as Partial<PlannerState>;
    }),
  toggleHighRisk: (value) =>
    set((s: PlannerState) => ({ includeHighRisk: value ?? !s.includeHighRisk })),
  setRecoItems: (items) => set({ lastRecoItems: items }),

  // Scenario
  add: (item) =>
    set((s: PlannerState) =>
      s.selected.some((i: ScenarioItem) => i.code === item.code)
        ? s
        : { selected: [...s.selected, item] }
    ),
  remove: (code) =>
    set((s: PlannerState) => ({ selected: s.selected.filter((i: ScenarioItem) => i.code !== code) })),
  reorder: (from, to) =>
    set((s: PlannerState) => {
      const arr = [...s.selected];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { selected: arr };
    }),
  clear: () => set({ selected: [] }),

  total: () => get().selected.reduce((sum: number, i: ScenarioItem) => sum + (i.savingsEst || 0), 0),
  selectedStrategies: () => get().selected.map((i: ScenarioItem) => i.code),
}));
