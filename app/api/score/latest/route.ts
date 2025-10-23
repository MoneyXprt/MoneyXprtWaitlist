import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/index'
import { calcSnapshot } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const db = getDb()
    const [row] = await db
      .select()
      .from(calcSnapshot)
      .where(eq(calcSnapshot.userId, user.id))
      .orderBy(desc(calcSnapshot.createdAt))
      .limit(1)

    const payload = (row as any)?.payload || null
    return NextResponse.json({
      score: payload?.score ?? null,
      breakdown: payload?.breakdown ?? null,
      updatedAt: row?.createdAt ?? null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}
