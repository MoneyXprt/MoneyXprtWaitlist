import { NextResponse } from 'next/server'
import { recalculateKeepMoreScore } from '@/lib/score/actions'

export async function POST() {
  try {
    const { score, breakdown } = await recalculateKeepMoreScore()
    return NextResponse.json({ score, breakdown })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

