import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateStrategies } from '@/lib/ai/strategies'
import { getDb } from '@/lib/db/index'
import { aiNarrativeCache } from '@/lib/db/schema'
import { and, desc, eq, gte } from 'drizzle-orm'
import { sha256Hex } from '@/lib/crypto'
import { assertEnv } from '@/lib/config/env'
import { checkDailyLimit, incrementUsage } from '@/lib/usage'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    assertEnv(['OPENAI_API_KEY'])
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // Quota: 10 per day per user
    const ok = await checkDailyLimit(user.id, 10)
    if (!ok) return NextResponse.json({ error: 'Daily strategy generation limit reached. Please try again tomorrow.' }, { status: 429 })

    const body = await req.json().catch(() => ({})) as { profile?: any; plan?: any; strategies?: Array<{ code: string; name?: string }> }

    const profileSummary = {
      filingStatus: body?.profile?.filingStatus || body?.profile?.filing_status || null,
      state: body?.profile?.state || body?.profile?.primary_state || null,
      entityType: body?.profile?.entityType || body?.profile?.entity_type || null,
    }
    const digest = { profileSummary, strategies: (body?.strategies || []).map((s) => s.code).sort() }
    const inputHash = sha256Hex(JSON.stringify(digest))

    const db = getDb()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const cached = await db
      .select()
      .from(aiNarrativeCache)
      .where(and(eq(aiNarrativeCache.profileId, user.id), eq(aiNarrativeCache.inputHash, inputHash), gte(aiNarrativeCache.createdAt, sevenDaysAgo)))
      .orderBy(desc(aiNarrativeCache.createdAt))
      .limit(1)
    if (cached[0]?.narrative) {
      return NextResponse.json({ items: cached[0].narrative })
    }

    const items = await generateStrategies({ profile: body.profile, plan: body.plan })
    await db.insert(aiNarrativeCache).values({ profileId: user.id, inputHash, narrative: items as any })
    // Increment generic usage prompt count
    await incrementUsage({ userId: user.id, tokensIn: 0, tokensOut: 0 })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

