import { NextResponse } from 'next/server'
import { recalculateKeepMoreScore } from '@/lib/score/actions'

export async function POST() {
  try {
    const { score, breakdown } = await recalculateKeepMoreScore()
    return NextResponse.json({ score, breakdown })
  } catch (e: any) {
    const msg = e?.message || 'failed'
    const isUnauthorized = /unauthorized|no user/i.test(msg)
    return NextResponse.json({ error: msg }, { status: isUnauthorized ? 401 : 500 })
  }
}
