import { getDb } from '@/lib/db/index'
import { calcSnapshot } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { recalculateKeepMoreScore } from '@/lib/score/actions'
import type { ScoreResult, ScoreBreakdown } from '@/lib/score'
import { generateNarrative, type Narrative } from '@/lib/ai/narrative'

type AnyRow = Record<string, any>

export interface UnifiedPlannerArgs {
  userId: string
  planId?: string
  selectedStrategies?: Array<{ code: string; name?: string }>
  profile?: AnyRow
  household?: AnyRow
}

export interface UnifiedPlannerResult {
  scoreResult: ScoreResult
  narrative: any
  delta: ReturnType<typeof computeDelta>
  snapshotId?: string
}

function computeDelta(
  prev?: { score?: number; breakdown?: ScoreBreakdown },
  next?: { score?: number; breakdown?: ScoreBreakdown }
): { scorePct?: number; sections?: Record<string, number> } {
  if (!prev || !next) return {}
  const out: { scorePct?: number; sections?: Record<string, number> } = {}
  const pScore = typeof prev.score === 'number' ? prev.score : undefined
  const nScore = typeof next.score === 'number' ? next.score : undefined
  if (pScore !== undefined && nScore !== undefined) {
    const base = pScore === 0 ? 1 : pScore
    out.scorePct = Math.round(((nScore - pScore) / base) * 100)
  }
  const pB = (prev.breakdown || {}) as Partial<ScoreBreakdown>
  const nB = (next.breakdown || {}) as Partial<ScoreBreakdown>
  const keys = new Set([...Object.keys(pB), ...Object.keys(nB)])
  const sec: Record<string, number> = {}
  keys.forEach((k) => {
    const a = typeof (pB as any)[k] === 'number' ? (pB as any)[k] : 0
    const b = typeof (nB as any)[k] === 'number' ? (nB as any)[k] : 0
    sec[k] = Math.round((b as number) - (a as number))
  })
  out.sections = sec
  return out
}

function breakdownToRecord(b: ScoreBreakdown): Record<string, number> {
  return {
    retirement: b.retirement,
    entity: b.entity,
    deductions: b.deductions,
    investments: b.investments,
    hygiene: b.hygiene,
    advanced: b.advanced,
  }
}

function recordToBreakdown(r: Record<string, number> | undefined): ScoreBreakdown {
  const z = (n?: number) => (Number.isFinite(n ?? NaN) ? Number(n) : 0)
  const src = r ?? {}
  return {
    retirement: z((src as any).retirement),
    entity: z((src as any).entity),
    deductions: z((src as any).deductions),
    investments: z((src as any).investments),
    hygiene: z((src as any).hygiene),
    advanced: z((src as any).advanced),
  }
}

export async function runUnifiedPlanner({
  userId,
  planId,
  selectedStrategies = [],
  profile,
  household,
}: UnifiedPlannerArgs): Promise<UnifiedPlannerResult> {
  const db = getDb()

  // Fetch prior snapshot for delta
  const [prev] = await db
    .select()
    .from(calcSnapshot)
    .where(eq(calcSnapshot.userId, userId))
    .orderBy(desc(calcSnapshot.createdAt))
    .limit(1)
  const prevPayload = (prev as any)?.payload as
    | { score?: number; breakdown?: Record<string, number> }
    | undefined

  // Recalculate score
  const { score, breakdown } = await recalculateKeepMoreScore()
  const scoreResult: ScoreResult = { score, breakdown: breakdown as ScoreBreakdown, notes: [] }

  // Generate narrative
  const narrative = await generateNarrative({
    profile,
    scoreResult: { score: scoreResult.score, breakdown: breakdownToRecord(scoreResult.breakdown), notes: scoreResult.notes },
    strategies: selectedStrategies,
  })

  // Compute delta vs previous
  const prevForDelta: ScoreResult | undefined = prevPayload
    ? {
        score: prevPayload.score ?? 0,
        breakdown: recordToBreakdown(prevPayload.breakdown as Record<string, number> | undefined),
        notes: Array.isArray((prevPayload as any).notes) ? ((prevPayload as any).notes as string[]) : [],
      }
    : undefined
  const delta = computeDelta(prevForDelta, scoreResult)

  // Store snapshot with narrative JSON
  const payload = {
    planId: planId ?? null,
    selectedStrategies,
    profileSummary: {
      filingStatus: (profile as any)?.filingStatus || (profile as any)?.filing_status || null,
      state: (profile as any)?.state || (profile as any)?.primary_state || null,
      entityType: (profile as any)?.entityType || (profile as any)?.entity_type || null,
    },
    score: scoreResult.score,
    breakdown: scoreResult.breakdown,
    narrative,
    delta,
  }

  const inserted = await db
    .insert(calcSnapshot)
    .values({ userId, kind: 'unified_planner', payload })
    .returning({ id: calcSnapshot.id })

  const snapshotId = inserted?.[0]?.id as string | undefined

  return { scoreResult, narrative, delta, snapshotId }
}

export default runUnifiedPlanner
