import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/index'
import { plans, profiles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { planVersions } from '@/lib/db/schema'
import { buildPlaybookPDF } from '@/lib/pdf/playbook'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getLatestVersion(db: ReturnType<typeof getDb>, planId: string) {
  const rows = await db
    .select()
    .from(planVersions)
    .where(eq(planVersions.planId, planId))
    .orderBy(desc(planVersions.createdAt))
    .limit(1)
  return rows[0] as any
}

export async function GET(req: Request) {
  return handle(req)
}

export async function POST(req: Request) {
  return handle(req)
}

async function handle(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const qpId = url.searchParams.get('planId') || url.searchParams.get('plan_id')
    let bodyId: string | undefined
    if (req.method === 'POST') {
      try {
        const json = await req.json()
        bodyId = (json?.planId || json?.plan_id || '').toString()
      } catch {}
    }
    const planId = (bodyId || qpId || '').trim()
    if (!planId) return NextResponse.json({ error: 'missing planId' }, { status: 400 })

    const db = getDb()
    // Verify ownership via plans table
    const planRows = await db.select().from(plans).where(and(eq(plans.id, planId), eq(plans.userId, user.id))).limit(1)
    const plan = planRows[0]
    if (!plan) return NextResponse.json({ error: 'not found' }, { status: 404 })

    // Latest version
    const version = await getLatestVersion(db, planId)
    if (!version) return NextResponse.json({ error: 'no versions' }, { status: 404 })

    // Profile for branding
    const profileRows = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)
    const profile = profileRows[0] || null

    const bytes = await buildPlaybookPDF({
      plan: {
        plan_name: plan.name,
        user_name: profile?.fullName || undefined,
        created_at: String(version.createdAt || ''),
        score_total: Number(version.scoreTotal ?? 0),
        score_breakdown: (version as any).scoreBreakdown || {},
        strategies: version.strategies as any,
        narrative: version.narrative,
      },
    })

    const fname = (plan.name ? `${plan.name}-playbook.pdf` : 'playbook.pdf').replace(/\s+/g, '-').toLowerCase()
    return new Response(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fname}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}
