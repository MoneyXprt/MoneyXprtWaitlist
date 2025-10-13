import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLatestPlanVersion } from '@/lib/db/plans'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const planId = params.id
    if (!planId) return NextResponse.json({ error: 'missing plan id' }, { status: 400 })

    const row = await getLatestPlanVersion(planId)
    if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

