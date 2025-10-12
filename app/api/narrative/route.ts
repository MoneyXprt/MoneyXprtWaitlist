import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/index'
import {
  profiles,
  household as householdTable,
  plan,
  planItem,
  calcSnapshot,
} from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { assertEnv } from '@/lib/config/env'
import { generateNarrative } from '@/lib/ai/narrative'
import { mapToScoreInput } from '@/lib/score/map'
import { calculateKeepMoreScore } from '@/lib/score'
import { recalculateKeepMoreScore } from '@/lib/score/actions'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    assertEnv(['OPENAI_API_KEY'])

    const body = (await req.json().catch(() => ({}))) as
      | { profileId?: string; useLatestSnapshot?: boolean }
      | undefined
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user && !body?.profileId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const userId = body?.profileId || user!.id
    const db = getDb()

    // Fetch profile, household
    const [profileRow] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
    const [householdRow] = await db.select().from(householdTable).where(eq(householdTable.ownerId, userId)).limit(1)

    // Latest plan + items
    const [latestPlan] = await db
      .select()
      .from(plan)
      .where(eq(plan.userId, userId))
      .orderBy(desc(plan.createdAt))
      .limit(1)

    const items = latestPlan
      ? await db.select().from(planItem).where(eq(planItem.recoId, latestPlan.id))
      : ([] as Array<Record<string, any>>)

    // Latest score snapshot
    let [latestSnap] = await db
      .select()
      .from(calcSnapshot)
      .where(eq(calcSnapshot.userId, userId))
      .orderBy(desc(calcSnapshot.createdAt))
      .limit(1)

    // If snapshot missing and the request is for the current user, recalc and try again
    if ((!latestSnap || !(latestSnap as any)?.payload?.score) && (!body?.profileId || body?.profileId === user?.id)) {
      await recalculateKeepMoreScore()
      ;[latestSnap] = await db
        .select()
        .from(calcSnapshot)
        .where(eq(calcSnapshot.userId, userId))
        .orderBy(desc(calcSnapshot.createdAt))
        .limit(1)
    }

    // Build scoreResult
    let scoreResult: { score: number; breakdown: Record<string, number>; notes: string[] }
    const payload = (latestSnap as any)?.payload
    if (payload && typeof payload.score === 'number' && payload.breakdown) {
      scoreResult = { score: payload.score, breakdown: payload.breakdown, notes: [] }
    } else {
      // Compute on the fly without persisting
      const scoreInput = mapToScoreInput({ profile: profileRow, household: householdRow, planItems: items })
      const res = calculateKeepMoreScore(scoreInput)
      scoreResult = { score: res.score, breakdown: res.breakdown as any, notes: res.notes }
    }

    // Map strategies for narrative: codes and names when available on plan items
    const strategies = (items || []).map((it: any) => ({
      code: String(it?.code || it?.strategyId || ''),
      name: it?.name || undefined,
    }))

    const narrative = await generateNarrative({ profile: profileRow as any, scoreResult, strategies })
    return NextResponse.json(narrative)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

