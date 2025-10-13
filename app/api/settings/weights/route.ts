import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/index'
import { userSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = getDb()
  const [row] = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1)
  return NextResponse.json({ weights: row?.weights || null })
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = getDb()
  const body = await req.json().catch(() => ({})) as any
  const weights = body?.weights && typeof body.weights === 'object' ? body.weights : null
  await db
    .insert(userSettings)
    .values({ userId: user.id, weights: weights as any })
    .onConflictDoUpdate({ target: userSettings.userId, set: { weights: weights as any } })
  return NextResponse.json({ ok: true })
}

