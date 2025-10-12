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
import type { ScoreResult, ScoreBreakdown } from '@/lib/score'

export const runtime = 'nodejs'

function toScoreResult(prev?: { score?: number; breakdown?: Record<string, number> }): ScoreResult | undefined {
  if (!prev) return undefined;
  const b = prev.breakdown ?? {};
  const breakdown: ScoreBreakdown = {
    retirement: Number(b["retirement"] ?? 0),
    entity: Number(b["entity"] ?? 0),
    deductions: Number(b["deductions"] ?? 0),
    investments: Number(b["investments"] ?? 0),
    hygiene: Number(b["hygiene"] ?? 0),
    advanced: Number(b["advanced"] ?? 0),
  };
  const score = typeof prev.score === "number"
    ? prev.score
    : (breakdown.retirement + breakdown.entity + breakdown.deductions + breakdown.investments + breakdown.hygiene + breakdown.advanced);
  return { score, breakdown, notes: [] };
}

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
    let scoreResult: ScoreResult
    const payload = (latestSnap as any)?.payload
    if (payload && typeof payload.score === 'number' && payload.breakdown) {
      scoreResult = toScoreResult({ score: payload.score, breakdown: payload.breakdown })!
    } else {
      // Compute on the fly without persisting
      const scoreInput = mapToScoreInput({ profile: profileRow, household: householdRow, planItems: items })
      const res = calculateKeepMoreScore(scoreInput)
      scoreResult = { score: res.score, breakdown: res.breakdown, notes: res.notes }
    }

    // Map strategies for narrative: codes and names when available on plan items
    const strategies = (items || []).map((it: any) => ({
      code: String(it?.code || it?.strategyId || ''),
      name: it?.name || undefined,
    }))

    const narrative = await generateNarrative({ profile: profileRow as any, scoreResult, strategies })
    return NextResponse.json(narrative)
  } catch (e: any) {
    const msg = e?.message || 'failed'
    const isRateLimit = /RATE_LIMIT/i.test(msg)
    return NextResponse.json({ error: msg }, { status: isRateLimit ? 429 : 500 })
  }
}
