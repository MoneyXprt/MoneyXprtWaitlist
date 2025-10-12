import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recalculateKeepMoreScore } from '@/lib/score/actions'
import { generateNarrative } from '@/lib/ai/narrative'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { planId?: string; strategies?: Array<string | { code: string; name?: string }>; profile?: any }

    const stream = new ReadableStream<Uint8Array>({
      start: async (controller) => {
        const enc = new TextEncoder()
        const send = (obj: unknown) => controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"))
        try {
          send({ type: 'status', message: 'scoring' })
          const { score, breakdown } = await recalculateKeepMoreScore()
          const scoreResult = { score, breakdown, notes: [] as string[] }
          send({ type: 'score', scoreResult })

          send({ type: 'status', message: 'narrative' })
          const strategies = Array.isArray(body.strategies)
            ? body.strategies.map((s) => (typeof s === 'string' ? { code: s } : { code: s.code, name: s.name }))
            : []
          const narrative = await generateNarrative({ profile: body.profile || {}, scoreResult, strategies })
          send({ type: 'narrative', narrative })

          send({ type: 'done' })
          controller.close()
        } catch (e: any) {
          send({ type: 'error', error: e?.message || 'failed' })
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

