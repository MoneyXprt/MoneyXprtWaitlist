export interface ScoreInput {
  filingStatus?: "single" | "mfj" | "mfs" | "hoh";
  w2Income?: number;
  selfEmploymentIncome?: number;
  capitalGains?: number;
  itemizedDeductions?: number;
  stateTaxRate?: number; // 0–0.15
  contributions?: { k401?: number; hsa?: number; ira?: number; megaBackdoor?: boolean };
  entity?: { type?: "none" | "llc" | "scorp"; reasonableSalary?: number };
  investmentHygiene?: { taxLossHarvestReady?: boolean; assetLocationOK?: boolean } & {
    // optional extras if present
    withholdingsOK?: boolean;
    estimatesOK?: boolean;
  };
  strategies?: Array<{ code: string }>;
}

export interface ScoreBreakdown {
  retirement: number;
  entity: number;
  deductions: number;
  investments: number;
  insurance: number;
  planning: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  notes: string[];
}

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
export const nz = (n?: number) => (Number.isFinite(n ?? NaN) ? Number(n) : 0);
export const bool = (v?: boolean) => v === true;

export function incomeBand(w2: number, se: number): "low" | "mid" | "high" {
  const total = nz(w2) + nz(se);
  if (total < 120_000) return "low";
  if (total < 350_000) return "mid";
  return "high";
}

export interface ScoreWeights {
  retirement?: number;
  entity?: number;
  deductions?: number;
  investments?: number;
  insurance?: number;
  planning?: number;
}

const MAX: ScoreBreakdown = {
  retirement: 20,
  entity: 20,
  deductions: 15,
  investments: 15,
  insurance: 10,
  planning: 20,
}

function normalizeWeights(w?: ScoreWeights): Required<ScoreWeights> {
  const defaults: Required<ScoreWeights> = { ...MAX }
  const base = { ...defaults, ...(w || {}) }
  const sum = Object.values(base).reduce((a, b) => a + (Number.isFinite(b as number) ? (b as number) : 0), 0) || 100
  const factor = 100 / sum
  return {
    retirement: (base.retirement as number) * factor,
    entity: (base.entity as number) * factor,
    deductions: (base.deductions as number) * factor,
    investments: (base.investments as number) * factor,
    insurance: (base.insurance as number) * factor,
    planning: (base.planning as number) * factor,
  }
}

function retirementPoints(
  band: "low" | "mid" | "high",
  { k401 = 0, hsa = 0, ira = 0, megaBackdoor = false }: Required<Required<ScoreInput>["contributions"]>
): { points: number; notes: string[] } {
  const notes: string[] = [];
  const targets = {
    low: { k401: 10_000, hsa: 3_300, ira: 6_500 },
    mid: { k401: 19_000, hsa: 3_300, ira: 6_500 },
    high: { k401: 23_000, hsa: 3_300, ira: 6_500 },
  }[band];

  const k401Pct = clamp(k401 / targets.k401, 0, 1);
  const hsaPct = clamp(hsa / targets.hsa, 0, 1);
  const iraPct = clamp(ira / targets.ira, 0, 1);

  let pts = 12 * k401Pct + 6 * hsaPct + 2 * iraPct;
  if (megaBackdoor) {
    pts += 2;
    notes.push("Mega backdoor Roth in place");
  }
  if (k401Pct < 0.5 && (band === "mid" || band === "high")) notes.push("401(k) below target for income band");
  return { points: clamp(pts, 0, 20), notes };
}

function entityPoints(se: number, type?: string, rs?: number): { points: number; notes: string[] } {
  const notes: string[] = [];
  let pts = 0;
  if (se < 60_000) {
    pts = 8; // small effect baseline <=10
  } else {
    if (type === "scorp") {
      pts = 18;
      const pct = se > 0 ? nz(rs) / se : 0;
      if (pct >= 0.35 && pct <= 0.6) {
        pts += 2;
        notes.push("S‑Corp with reasonable salary");
      } else {
        notes.push("Review S‑Corp reasonable compensation");
      }
    } else {
      pts = 6;
      notes.push("High SE income without S‑Corp optimization");
    }
  }
  return { points: clamp(pts, 0, 20), notes };
}

function stdHeuristic(status: ScoreInput["filingStatus"]): number {
  switch (status) {
    case "mfj":
      return 27_000;
    case "hoh":
      return 20_000;
    case "mfs":
      return 13_500;
    case "single":
    default:
      return 13_000;
  }
}

function deductionPoints(
  filingStatus: ScoreInput["filingStatus"],
  itemized: number,
  stateTaxRate: number
): { points: number; notes: string[] } {
  const notes: string[] = [];
  const std = stdHeuristic(filingStatus);
  let pts = 0;
  if (itemized > std) pts = 12;
  else if (itemized >= std * 0.9) pts = 8;
  else {
    pts = 4;
    notes.push("Itemized likely below standard deduction");
  }
  if (stateTaxRate > 0.10) {
    pts -= 2; // SALT headwind
    notes.push("SALT headwind in high‑tax state");
  }
  return { points: clamp(pts, 0, 15), notes };
}

function investmentPoints(inv: NonNullable<ScoreInput["investmentHygiene"]>): { points: number; notes: string[] } {
  const notes: string[] = [];
  const loc = bool(inv.assetLocationOK) ? 9 : 4;
  const tlh = bool(inv.taxLossHarvestReady) ? 6 : 2;
  if (!bool(inv.assetLocationOK)) notes.push("Improve asset location");
  return { points: clamp(loc + tlh, 0, 15), notes };
}

function hygienePoints(inv?: NonNullable<ScoreInput["investmentHygiene"]>): { points: number; notes: string[] } {
  const notes: string[] = [];
  const withhold = inv?.withholdingsOK === true;
  const est = inv?.estimatesOK === true;
  let pts = 3;
  if (withhold && est) pts = 10;
  else if (withhold || est) pts = 6;
  return { points: clamp(pts, 0, 10), notes };
}

function advancedPoints(strategies: Array<{ code: string }>): { points: number; notes: string[] } {
  const notes: string[] = [];
  const map: Record<string, number> = {
    augusta: 4,
    augusta_280a: 4,
    cost_seg: 8,
    cost_seg_bonus: 8,
    qsbs_awareness: 4,
    daf: 4,
    daf_bunching: 4,
    rep_status: 6,
    backdoor_roth: 2,
    mega_backdoor_roth: 4,
  };
  let pts = 0;
  const seen = new Set<string>();
  for (const s of strategies || []) {
    const k = String(s.code || "").toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (k in map) pts += map[k];
  }
  return { points: clamp(pts, 0, 20), notes };
}

export function calculateKeepMoreScore(input: ScoreInput, weights?: ScoreWeights): ScoreResult {
  const {
    filingStatus = "single",
    w2Income = 0,
    selfEmploymentIncome = 0,
    capitalGains = 0,
    itemizedDeductions = 0,
    stateTaxRate = 0,
    contributions = {},
    entity = {},
    investmentHygiene = {},
    strategies = [],
  } = input;

  const band = incomeBand(w2Income, selfEmploymentIncome);
  const notes: string[] = [];

  const r = retirementPoints(band, {
    k401: nz(contributions.k401),
    hsa: nz(contributions.hsa),
    ira: nz(contributions.ira),
    megaBackdoor: bool(contributions.megaBackdoor),
  });
  notes.push(...r.notes);

  const e = entityPoints(nz(selfEmploymentIncome), entity.type, entity.reasonableSalary);
  notes.push(...e.notes);

  const d = deductionPoints(filingStatus, nz(itemizedDeductions), nz(stateTaxRate));
  notes.push(...d.notes);

  const inv = investmentPoints(investmentHygiene || {});
  notes.push(...inv.notes);

  const h = hygienePoints(investmentHygiene);
  notes.push(...h.notes);

  const a = advancedPoints(strategies);
  notes.push(...a.notes);

  const breakdown: ScoreBreakdown = {
    retirement: Math.round(r.points),
    entity: Math.round(e.points),
    deductions: Math.round(d.points),
    investments: Math.round(inv.points),
    insurance: Math.round(h.points),
    planning: Math.round(a.points),
  };

  // Weighted scoring: map each category to [0,1] by its max, then scale by normalized weights summing to 100
  const w = normalizeWeights(weights);
  const total =
    (breakdown.retirement / MAX.retirement) * w.retirement +
    (breakdown.entity / MAX.entity) * w.entity +
    (breakdown.deductions / MAX.deductions) * w.deductions +
    (breakdown.investments / MAX.investments) * w.investments +
    (breakdown.insurance / MAX.insurance) * w.insurance +
    (breakdown.planning / MAX.planning) * w.planning;
  const score = clamp(Math.round(total));

  return { score, breakdown, notes };
}

export default calculateKeepMoreScore;
