import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listPlanVersions } from '@/lib/db/plans'

export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') ?? '10')
    const planId = params.id
    if (!planId) return NextResponse.json({ error: 'missing plan id' }, { status: 400 })
    const rows = await listPlanVersions(planId, Number.isFinite(limit) ? limit : 10)
    return NextResponse.json({ items: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

