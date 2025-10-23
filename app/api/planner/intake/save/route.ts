import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/index'
import { taxProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const json = await req.json().catch(() => ({} as any))
    const year = Number(json?.year || new Date().getFullYear())
    const filingStatus = String(json?.filingStatus || 'single') as any
    const primaryState = String(json?.state || '')
    const dependents = Number(json?.dependents || 0) || 0
    const itemize = Boolean(json?.itemize || false)

    const db = getDb()
    // Upsert by (userId, year) simplistic: delete existing then insert
    await db.delete(taxProfiles).where(eq(taxProfiles.userId, user.id))
    const [row] = await db.insert(taxProfiles).values({
      userId: user.id,
      filingStatus: filingStatus,
      primaryState,
      dependents,
      itemize,
      year,
    } as any).returning()
    return NextResponse.json({ ok: true, id: row?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}
