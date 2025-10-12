import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runUnifiedPlanner } from '@/lib/planner/unified'

export const runtime = 'nodejs'

type ReqBody = {
  planId?: string
  strategies?: Array<string | { code: string; name?: string }>
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body: ReqBody = await req.json().catch(() => ({} as any))
    const planId = body?.planId
    const raw = Array.isArray(body?.strategies) ? body!.strategies! : []
    const selectedStrategies = raw.map((s) => (typeof s === 'string' ? { code: s } : { code: s.code, name: s.name }))

    const { scoreResult, narrative, delta } = await runUnifiedPlanner({
      userId: user.id,
      planId,
      selectedStrategies,
    })

    return NextResponse.json({ scoreResult, narrative, delta })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

