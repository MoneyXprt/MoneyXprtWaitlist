import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/index'
import { planVersions, plans } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { createPlan } from '@/lib/db/plans'

export const runtime = 'nodejs'

type SnapshotBody = {
  payload?: any
  score?: number
  breakdown?: Record<string, number>
  narrative?: any
  strategies?: Array<{ code: string; name?: string }>
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = (await req.json().catch(() => ({}))) as SnapshotBody
    const db = getDb()

    // Ensure we have a plan to attach the version to (plan_id is non-nullable)
    let planId: string | undefined
    const [existing] = await db
      .select()
      .from(plans)
      .where(eq(plans.userId, user.id))
      .orderBy(desc(plans.createdAt))
      .limit(1)
    if (existing?.id) {
      planId = existing.id
    } else {
      const plan = await createPlan(user.id, 'My Plan')
      planId = plan.id
    }

    const row = (await db
      .insert(planVersions)
      .values({
        planId: planId!,
        userId: user.id,
        payload: body.payload as any,
        score: body.score !== undefined ? String(body.score) : undefined,
        breakdown: body.breakdown as any,
        narrative: body.narrative as any,
        // For compatibility with existing fields
        scoreTotal: body.score !== undefined ? String(body.score) : undefined,
        scoreBreakdown: (body.breakdown ?? {}) as any,
        strategies: (body.strategies ?? []) as any,
      })
      .returning())[0]

    return NextResponse.json({ item: row })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}
