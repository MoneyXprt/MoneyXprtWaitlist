// lib/store/planner.ts
import { create } from "zustand";
import type { PlanInput } from "@/lib/types";
import { EMPTY_PLAN } from "@/lib/types";

export type ScenarioItem = {
  code: string;
  name: string;
  savingsEst: number;
  states?: string[];
  risk?: number;
};

type PlannerState = {
  // Core planner data (replaces legacy context state)
  data: PlanInput;
  includeHighRisk: boolean;
  lastRecoItems: any[];

  // Scenario selection (items in order)
  selected: ScenarioItem[];

  // Actions: plan data
  setAll: (input: PlanInput) => void;
  patch: (partial: Partial<PlanInput>) => void;
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
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  data: EMPTY_PLAN,
  includeHighRisk: false,
  lastRecoItems: [],

  selected: [],

  // Plan data
  setAll: (input) => set({ data: input }),
  patch: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  updatePath: (path, value) =>
    set((s) => {
      const next: any = structuredClone(s.data);
      const parts = path.split(".");
      let cur = next as any;
      for (let i = 0; i < parts.length - 1; i++) cur[parts[i]] ??= {};
      cur[parts[parts.length - 1]] = value as any;
      return { data: next } as Partial<PlannerState>;
    }),
  toggleHighRisk: (value) =>
    set((s) => ({ includeHighRisk: value ?? !s.includeHighRisk })),
  setRecoItems: (items) => set({ lastRecoItems: items }),

  // Scenario
  add: (item) =>
    set((s) =>
      s.selected.some((i) => i.code === item.code)
        ? s
        : { selected: [...s.selected, item] }
    ),
  remove: (code) =>
    set((s) => ({ selected: s.selected.filter((i) => i.code !== code) })),
  reorder: (from, to) =>
    set((s) => {
      const arr = [...s.selected];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { selected: arr };
    }),
  clear: () => set({ selected: [] }),

  total: () => get().selected.reduce((sum, i) => sum + (i.savingsEst || 0), 0),
  selectedStrategies: () => get().selected.map((i) => i.code),
}));

