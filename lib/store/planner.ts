// lib/store/planner.ts
import { create } from "zustand";

export type ScenarioItem = {
  code: string;
  name: string;
  savingsEst: number;
  states?: string[];
  risk?: number;
};

type PlannerState = {
  selected: ScenarioItem[];
  add: (item: ScenarioItem) => void;
  remove: (code: string) => void;
  clear: () => void;
  total: () => number;
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  selected: [],
  add: (item) =>
    set((s) =>
      s.selected.some((i) => i.code === item.code)
        ? s
        : { selected: [...s.selected, item] }
    ),
  remove: (code) =>
    set((s) => ({ selected: s.selected.filter((i) => i.code !== code) })),
  clear: () => set({ selected: [] }),
  total: () => get().selected.reduce((sum, i) => sum + (i.savingsEst || 0), 0),
}));

