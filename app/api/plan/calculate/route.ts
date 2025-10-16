import { NextResponse } from 'next/server'
import { runEngine } from '@/lib/strategy/engine'
import type { Snapshot } from '@/lib/strategy/types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    // Map wizard input into engine Snapshot
    const state = String(body?.state || '').toUpperCase()
    const filingStatus = String(body?.filingStatus || '')
    const w2 = Number(body?.w2 || 0) || 0
    const se = Number(body?.se || 0) || 0
    const k1 = Number(body?.k1 || 0) || 0
    const entityType = String(body?.entityType || '')
    const rentals = Number(body?.rentals || 0) || 0
    const avgBasis = Number(body?.avgBasis || 0) || 0

    const snapshot: Snapshot = {
      profile: { filingStatus },
      settings: { year: new Date().getFullYear(), states: state ? [state] : [] },
      income: { w2, se, k1 },
      entities: entityType ? [{ type: (entityType as any) }] : [],
      properties: rentals > 0 ? Array.from({ length: rentals }).map(() => ({ type: 'rental', basis: avgBasis })) : [],
    }

    const items = runEngine(snapshot)
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

