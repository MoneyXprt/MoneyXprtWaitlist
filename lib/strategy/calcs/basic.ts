// lib/strategy/calcs/basic.ts
import { LAW_2025 } from '../law-params';
import type { Snapshot } from '../ui/plannerStore';

export function costSegBonus(snapshot: Snapshot) {
  const props = snapshot.properties || [];
  const depreciable = props.reduce((acc, p) => acc + Math.max(0, (p.basis || 0) * (1 - (p.landPct || 0))), 0);
  if (depreciable <= 50000) return null;
  const accelPortion = 0.25; // portion identified to shorter lives
  const bonus = depreciable * accelPortion * LAW_2025.bonusPct;
  const savingsEst = bonus * LAW_2025.marginalTop;
  return { savingsEst, steps: ['Engage cost segregation study', 'Coordinate tax reporting with CPA'], risk: 3 };
}

export function qbi199a(snapshot: Snapshot) {
  const qbiIncome = (snapshot.income.k1 || 0) + (snapshot.income.other1099 || 0);
  if (qbiIncome <= 0) return null;
  const deduction = LAW_2025.qbiPct * qbiIncome;
  const savingsEst = deduction * LAW_2025.marginalHigh;
  return { savingsEst, steps: ['Confirm QBI classification', 'Check wage/UBIA limits'], risk: 2 };
}

export function ptetState(snapshot: Snapshot) {
  const state = (snapshot.settings.states[0] || '');
  const rate = LAW_2025.ptetRates[state] || 0;
  const passThru = (snapshot.income.k1 || 0) + (snapshot.income.other1099 || 0);
  if (rate <= 0 || passThru <= 0) return null;
  const deductible = passThru * rate;
  const savingsEst = deductible * LAW_2025.marginalHigh;
  return { savingsEst, steps: ['Elect PTET', 'Make entity-level estimated payments'], risk: 2 };
}

export const BASIC_CALC_MAP: Record<string, (s: Snapshot) => { savingsEst: number; steps: string[]; risk: number } | null> = {
  cost_seg_bonus: costSegBonus,
  qbi_199a: qbi199a,
  ptet_state: ptetState,
};

