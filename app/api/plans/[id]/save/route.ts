import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPlanVersion } from '@/lib/db/plans'

export const runtime = 'nodejs'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const planId = params.id
    if (!planId) return NextResponse.json({ error: 'missing plan id' }, { status: 400 })

    const body = await req.json().catch(() => ({})) as any
    const scoreTotal = Number(body?.scoreTotal ?? body?.scoreResult?.score ?? 0)
    const scoreBreakdown = (body?.scoreBreakdown ?? body?.scoreResult?.breakdown ?? {}) as Record<string, number>
    const strategies = (body?.strategies ?? body?.selectedStrategies ?? []).map((s: any) =>
      typeof s === 'string' ? { code: s } : { code: s?.code, name: s?.name }
    )
    const narrative = body?.narrative ?? null

    const row = await createPlanVersion(planId, { scoreTotal, scoreBreakdown, strategies, narrative })
    return NextResponse.json({ versionId: row.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

