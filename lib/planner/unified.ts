import { getDb } from '@/lib/db/index'
import { calcSnapshot } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { recalculateKeepMoreScore } from '@/lib/score/actions'
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
  scoreResult: { score: number; breakdown: Record<string, number>; notes: string[] }
  narrative: Narrative
  delta: {
    scorePct?: number
    sections?: Record<string, number>
  }
  snapshotId: string
}

function computeDelta(
  prev?: { score?: number; breakdown?: Record<string, number> },
  next?: { score?: number; breakdown?: Record<string, number> }
): { scorePct?: number; sections?: Record<string, number> } {
  if (!prev || !next) return {}
  const out: { scorePct?: number; sections?: Record<string, number> } = {}
  const pScore = typeof prev.score === 'number' ? prev.score : undefined
  const nScore = typeof next.score === 'number' ? next.score : undefined
  if (pScore !== undefined && nScore !== undefined) {
    const base = pScore === 0 ? 1 : pScore
    out.scorePct = Math.round(((nScore - pScore) / base) * 100)
  }
  const pB = prev.breakdown || {}
  const nB = next.breakdown || {}
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
  const scoreResult = { score, breakdown: breakdown as Record<string, number>, notes: [] as string[] }

  // Generate narrative
  const narrative = await generateNarrative({ profile, scoreResult, strategies: selectedStrategies })

  // Compute delta vs previous
  const delta = computeDelta(prevPayload, scoreResult)

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

  const snapshotId = inserted?.[0]?.id as string

  return { scoreResult, narrative, delta, snapshotId }
}

export default runUnifiedPlanner

