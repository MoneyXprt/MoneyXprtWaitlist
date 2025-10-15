import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/index'
import { planVersions } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') ?? '20')
    const db = getDb()
    const rows = await db
      .select()
      .from(planVersions)
      .where(eq(planVersions.userId, user.id))
      .orderBy(desc(planVersions.createdAt))
      .limit(Number.isFinite(limit) ? limit : 20)

    return NextResponse.json({ items: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

