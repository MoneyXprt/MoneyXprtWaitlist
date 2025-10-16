import { EMPTY_PLAN, type PlanInput, type FilingStatus as FilingStatusFull } from '@/lib/types'
import type { PlannerData as PDTypes } from '@/lib/planner/types'
import type { PlannerData } from '@/lib/store/planner'

/** Narrow type guard to detect a PlanInput-shaped object */
export function isPlanInput(x: any): x is PlanInput {
  return !!x && typeof x === 'object' && 'state' in x && 'salary' in x && 'w2BaseAnnual' in x
}

function mapFilingStatus(s?: PDTypes['profile']['filingStatus']): FilingStatusFull {
  switch (s) {
    case 'mfj': return 'married_joint'
    case 'mfs': return 'married_separate'
    case 'hoh': return 'head'
    case 'single':
    default:
      return 'single'
  }
}

/**
 * Structural adapter: PlannerData -> PlanInput
 * - Starts from EMPTY_PLAN
 * - Copies overlapping fields with sane fallbacks
 * - No business logic
 */
export function toPlanInput(input: PDTypes | Partial<PDTypes>): PlanInput {
  const p = input?.profile || ({} as NonNullable<PDTypes['profile']>)
  const income = p?.income || {}
  const out: PlanInput = {
    ...EMPTY_PLAN,
    state: p?.state ?? EMPTY_PLAN.state,
    filingStatus: mapFilingStatus(p?.filingStatus),
    // mirror income to legacy PlanInput fields
    salary: income?.w2 ?? EMPTY_PLAN.salary,
    w2BaseAnnual: income?.w2 ?? EMPTY_PLAN.w2BaseAnnual,
    selfEmployment: income?.self ?? EMPTY_PLAN.selfEmployment,
    // keep other fields from EMPTY_PLAN
  }
  return out
}

/** Converts PlanInput -> PlannerData while preserving prior store fields */
export function toPlannerData(input: PlanInput, prev?: Partial<PlannerData>): PlannerData {
  const now = Date.now()
  const next: PlannerData = {
    ...(prev as any),
    plan: input,
    profile: (prev as any)?.profile ?? { filingStatus: 'single', state: '' },
    strategies: (prev as any)?.strategies ?? [],
    lastEditedAt: (prev as any)?.lastEditedAt ?? now,
  } as PlannerData
  return next
}

export function isPlannerData(x: any): x is PlannerData {
  return !!x && typeof x === 'object' && 'lastEditedAt' in x
}
