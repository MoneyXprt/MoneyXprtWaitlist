import { getDb } from '@/lib/db/index'
import { calcSnapshot } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { recalculateKeepMoreScore } from '@/lib/score/actions'
import type { ScoreResult, ScoreBreakdown } from '@/lib/score'
import { compareScores, type ScoreDelta } from '@/lib/score/delta'
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
  delta: ScoreDelta
  snapshotId?: string
}

// (delta computation centralized in lib/score/delta)

function recordToBreakdown(r: Record<string, number> | undefined): ScoreBreakdown {
  const z = (n?: number) => (Number.isFinite(n ?? NaN) ? Number(n) : 0)
  const src = r ?? {}
  return {
    retirement: z((src as any).retirement),
    entity: z((src as any).entity),
    deductions: z((src as any).deductions),
    investments: z((src as any).investments),
    // prefer new keys; fallback to legacy keys
    insurance: z((src as any).insurance ?? (src as any).hygiene),
    planning: z((src as any).planning ?? (src as any).advanced),
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
    scoreResult, // pass ScoreResult (with ScoreBreakdown) directly
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
  const delta = prevForDelta ? compareScores(prevForDelta, scoreResult) : compareScores({ score: 0, breakdown: recordToBreakdown({}), notes: [] }, scoreResult)

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
