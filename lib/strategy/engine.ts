import type { Snapshot, StrategyItem } from "./types";
import { CA } from "./state/CA"; import { NY } from "./state/NY";
import { MN } from "./state/MN"; import { IL } from "./state/IL";

// rough constants for MVP estimates
const FED_RATE = 0.37;

const STATE = { CA, NY, MN, IL } as Record<string, { ptetRate: number; supportsPTET: boolean; name: string }>;

export function runEngine(snapshot: Snapshot): StrategyItem[] {
  const states = snapshot.settings?.states ?? [];
  const w2 = snapshot.income?.w2 ?? 0;
  const k1 = snapshot.income?.k1 ?? 0;
  const se = snapshot.income?.se ?? 0;
  const entities = snapshot.entities ?? [];
  const rentals = (snapshot.properties ?? []).filter(p => p.type === "rental");
  const hasPassThrough = entities.some(e => e.type === "S-Corp" || e.type === "Partnership");

  const out: StrategyItem[] = [];

  // --- PTET (state SALT workaround) ---
  const ptetState = states.find(s => STATE[s]?.supportsPTET);
  if (hasPassThrough && ptetState) {
    // proxy base: pass-through income; if unknown, allow W-2 overflow as crude stand-in
    const base = Math.max(k1 + se, Math.max(0, w2 - 200_000));
    const rate = STATE[ptetState].ptetRate ?? 0.09;
    const est = Math.round(base * rate * FED_RATE);
    if (est > 0) {
      out.push({
        code: "ptet_state",
        name: "PTET election",
        category: "State SALT workaround",
        savingsEst: est,
        risk: 2,
        steps: [`Elect PTET in ${ptetState}`, "Schedule quarterly estimates", "Credit owners on annual return"],
        docs: ["Election form", "Owner credit memos", "Quarterly estimate schedule"],
        states: [ptetState],
      });
    }
  }

  // --- QBI §199A (very rough MVP) ---
  const qbiBase = Math.max(0, k1 + se);
  const qbiEst = Math.min(qbiBase * 0.20, 50000); // crude wage/UBIA cap
  if (qbiEst > 0) {
    out.push({
      code: "qbi_199a",
      name: "QBI §199A deduction",
      category: "Pass-through",
      savingsEst: Math.round(qbiEst),
      risk: 2,
      steps: ["Compute wages/UBIA", "Aggregation memo if needed", "Claim §199A on return"],
      docs: ["Reasonable comp memo", "W-2 wage calc", "UBIA computation"],
    });
  }

  // --- Cost Seg + Bonus (rental basis proxy) ---
  const rentalsCount = rentals.length;
  const avgBasis = rentalsCount ? Math.round(rentals.reduce((a, r) => a + (r.basis ?? 0), 0) / rentalsCount) : 0;
  if (rentalsCount && avgBasis > 0) {
    const depreciable = avgBasis * 0.8; // remove land (20%)
    const bonusRate = 0.60; // phase-down rough
    const est = Math.round(depreciable * bonusRate * FED_RATE);
    if (est > 0) {
      out.push({
        code: "cost_seg_bonus",
        name: "Cost segregation + bonus depreciation",
        category: "Real estate",
        savingsEst: est,
        risk: 3,
        steps: ["Order engineering study", "File Form 4562", "Update fixed asset register"],
        docs: ["Engineering cost segregation report", "Form 4562", "Fixed asset register updates"],
      });
    }
  }

  // --- Augusta Rule (§280A) ---
  const hasOwnerOp = entities.some(e => e.type === "S-Corp" || e.type === "C-Corp");
  if (hasOwnerOp) {
    // rough: 14 days × $750 nightly market rate
    const est = 14 * 750 * (1 - 0.09); // assume state PIT savings too (very crude)
    out.push({
      code: "augusta_280a",
      name: "Augusta Rule (§280A) - rent your home to your business",
      category: "Owner operator",
      savingsEst: Math.round(est),
      risk: 2,
      steps: ["Approve board minutes", "Document market rate comps", "Invoice & pay from entity"],
      docs: ["Board minutes / rental agreement", "Comparable rate support", "Invoices & payment proof"],
    });
  }

  // --- Employ your children ---
  const kids = snapshot.dependents ?? 0;
  if (kids > 0 && hasOwnerOp) {
    // rough: $6,500 deductible @ 37% marginal, per child
    const est = Math.round(kids * 6500 * 0.37);
    out.push({
      code: "employ_kids",
      name: "Employ your children (family payroll planning)",
      category: "Owner operator",
      savingsEst: est,
      risk: 2,
      steps: ["Create bona fide job & pay reasonable wage", "Track time", "Run payroll; consider Roth IRA"],
      docs: ["Job description & timesheets", "Payroll setup", "Custodial Roth IRA (optional)"],
    });
  }

  // sort by impact
  return out.sort((a, b) => b.savingsEst - a.savingsEst);
}

