export interface ScoreInput {
  filingStatus?: "single" | "mfj" | "mfs" | "hoh";
  w2Income?: number;
  selfEmploymentIncome?: number;
  capitalGains?: number;
  itemizedDeductions?: number;
  stateTaxRate?: number; // 0–0.15
  contributions?: { k401?: number; hsa?: number; ira?: number; megaBackdoor?: boolean };
  entity?: { type?: "none" | "llc" | "scorp"; reasonableSalary?: number };
  investmentHygiene?: { taxLossHarvestReady?: boolean; assetLocationOK?: boolean };
  strategies?: Array<{ code: string }>;
}

export interface ScoreBreakdown {
  retirement: number;
  entity: number;
  deductions: number;
  investments: number;
  hygiene: number;
  advanced: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  notes: string[];
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function stdDeduction(status: ScoreInput["filingStatus"]): number {
  switch (status) {
    case "mfj":
      return 29200;
    case "hoh":
      return 21900;
    case "mfs":
    case "single":
    default:
      return 14600;
  }
}

export function calculateKeepMoreScore(input: ScoreInput): ScoreResult {
  const notes: string[] = [];
  const agi = (input.w2Income || 0) + (input.selfEmploymentIncome || 0) + (input.capitalGains || 0);

  // 1) Retirement (max 20)
  const c = input.contributions || {};
  const k401Max = 23000; // baseline employee deferral
  const hsaBase = (input.filingStatus === "mfj" ? 8300 : 4150); // rough
  const iraBase = 6500; // rough
  let retireScore = 0;
  const k401Ratio = clamp((c.k401 || 0) / k401Max, 0, 1);
  retireScore += 12 * k401Ratio;
  if (k401Ratio < 0.5 && agi > 120000) notes.push("Consider increasing 401(k) deferrals toward the annual limit");
  const hsaRatio = clamp((c.hsa || 0) / hsaBase, 0, 1);
  retireScore += 4 * hsaRatio;
  const iraRatio = clamp((c.ira || 0) / iraBase, 0, 1);
  retireScore += 4 * iraRatio;
  if (c.megaBackdoor) retireScore += 2;
  retireScore = clamp(retireScore, 0, 20);

  // 2) Entity optimization (max 20)
  const se = input.selfEmploymentIncome || 0;
  const ent = input.entity || { type: "none" as const };
  let entityScore = 0;
  if (se <= 20000) {
    entityScore = 5; // likely not worth entity complexity
  } else if (se <= 60000) {
    entityScore = ent.type === "llc" ? 8 : ent.type === "scorp" ? 10 : 6;
  } else {
    if (ent.type === "scorp") {
      // Reasonable salary heuristic 30–60% of profit
      const rs = ent.reasonableSalary || 0;
      const pct = se > 0 ? rs / se : 0;
      if (pct >= 0.3 && pct <= 0.6) entityScore = 18;
      else if (rs > 0) entityScore = 14;
      else entityScore = 12;
      if (entityScore < 18) notes.push("Review reasonable compensation for S‑Corp salary");
    } else if (ent.type === "llc") {
      entityScore = 10;
      notes.push("Consider S‑Corp election to optimize SE tax on profits");
    } else {
      entityScore = 6;
      notes.push("High self‑employment income without entity optimization");
    }
  }
  entityScore = clamp(entityScore, 0, 20);

  // 3) Deductions use (max 15)
  const itemized = input.itemizedDeductions || 0;
  const std = stdDeduction(input.filingStatus);
  let deductionsScore = 0;
  if (itemized <= 0) {
    deductionsScore = 5;
  } else if (itemized < std) {
    deductionsScore = input.stateTaxRate && input.stateTaxRate > 0.09 ? 4 : 5;
    notes.push("Standard deduction may beat itemizing — consider bunching/DAF");
  } else if (itemized >= std * 1.1) {
    deductionsScore = 15;
  } else {
    // proportional between std..1.1*std => 8..15
    const ratio = (itemized - std) / (0.1 * std);
    deductionsScore = 8 + clamp(ratio, 0, 1) * 7;
  }

  // 4) Investments tax-efficiency (max 15)
  const inv = input.investmentHygiene || {};
  let investScore = 0;
  investScore += inv.taxLossHarvestReady ? 7 : 3;
  investScore += inv.assetLocationOK ? 8 : 3;
  investScore = clamp(investScore, 0, 15);
  if (!inv.assetLocationOK) notes.push("Improve asset location between tax‑deferred and taxable accounts");

  // 5) Hygiene (max 10)
  let hygieneScore = 0;
  // Proxy signals
  hygieneScore += input.w2Income ? 3 : 2; // assume payroll withholding
  hygieneScore += se ? 1 : 0; // SE requires est taxes; low default unless strategy present
  if (ent.reasonableSalary) hygieneScore += 2;
  if ((c.k401 || 0) + (c.hsa || 0) + (c.ira || 0) > 0) hygieneScore += 2;
  hygieneScore = clamp(hygieneScore, 0, 10);

  // 6) Advanced strategies (max 20)
  const codes = new Set((input.strategies || []).map((s) => s.code));
  const advancedSet = [
    "augusta_280a",
    "cost_seg_bonus",
    "qsbs_awareness",
    "daf_bunching",
    "ptet_state",
    "backdoor_roth",
  ];
  let advancedHits = 0;
  for (const code of advancedSet) if (codes.has(code)) advancedHits++;
  let advancedScore = 0;
  if (advancedHits > 0) {
    const weights = [8, 6, 4];
    for (let i = 0; i < Math.min(advancedHits, weights.length); i++) advancedScore += weights[i];
    if (advancedHits > weights.length) advancedScore += (advancedHits - weights.length) * 2;
  }
  advancedScore = clamp(advancedScore, 0, 20);

  const breakdown: ScoreBreakdown = {
    retirement: Math.round(retireScore),
    entity: Math.round(entityScore),
    deductions: Math.round(deductionsScore),
    investments: Math.round(investScore),
    hygiene: Math.round(hygieneScore),
    advanced: Math.round(advancedScore),
  };

  const score = clamp(
    breakdown.retirement +
      breakdown.entity +
      breakdown.deductions +
      breakdown.investments +
      breakdown.hygiene +
      breakdown.advanced,
    0,
    100
  );

  // Nudge: if essentially no data, provide a modest baseline ~30
  if (agi === 0 && !input.entity && !input.contributions && !input.investmentHygiene && (!input.strategies || input.strategies.length === 0)) {
    return { score: 30, breakdown: { retirement: 4, entity: 6, deductions: 6, investments: 6, hygiene: 8, advanced: 0 }, notes };
  }

  return { score, breakdown, notes };
}

export default calculateKeepMoreScore;

