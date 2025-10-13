import { getDb } from '@/lib/db/index'
import { plans, planVersions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function createPlan(userId: string, name: string) {
  const db = getDb()
  const rows = await db.insert(plans).values({ userId, name }).returning()
  return rows[0]
}

export async function createPlanVersion(planId: string, payload: {
  scoreTotal: number
  scoreBreakdown: Record<string, number>
  strategies: Array<{ code: string; name?: string }>
  narrative?: any
}) {
  const db = getDb()
  const rows = await db
    .insert(planVersions)
    .values({
      planId,
      scoreTotal: String(payload.scoreTotal),
      scoreBreakdown: payload.scoreBreakdown as any,
      strategies: payload.strategies as any,
      narrative: payload.narrative as any,
    })
    .returning()
  return rows[0]
}

export async function getLatestPlanVersion(planId: string) {
  const db = getDb()
  const rows = await db
    .select()
    .from(planVersions)
    .where(eq(planVersions.planId, planId))
    .orderBy(desc(planVersions.createdAt))
    .limit(1)
  return rows[0]
}

export async function listPlanVersions(planId: string, limit = 10) {
  const db = getDb()
  return db
    .select()
    .from(planVersions)
    .where(eq(planVersions.planId, planId))
    .orderBy(desc(planVersions.createdAt))
    .limit(limit)
}

