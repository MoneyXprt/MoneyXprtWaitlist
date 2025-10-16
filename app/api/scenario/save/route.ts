import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/index'
import { calcSnapshot } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { title?: string; payload?: any }
    const title = (body?.title || '').toString().slice(0, 200)
    const payload = body?.payload ?? {}
    const db = getDb()
    const [row] = await db.insert(calcSnapshot).values({ userId: user.id, kind: 'scenario', payload: { title, ...payload } as any }).returning({ id: calcSnapshot.id })
    return NextResponse.json({ id: row?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

