import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPlan } from '@/lib/db/plans'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({} as any)) as { name?: string }
    const name = (body?.name || '').toString().trim()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const row = await createPlan(user.id, name)
    return NextResponse.json({ planId: row.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

