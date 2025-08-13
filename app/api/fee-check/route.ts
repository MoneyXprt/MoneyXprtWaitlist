import { NextRequest, NextResponse } from 'next/server'
import { sha256Hex } from '@/lib/crypto'
import { sbAdmin } from '@/lib/supabase'
import { chat } from '@/lib/ai'
import { redactPII } from '@/lib/redact'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-supabase-auth')
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const admin = sbAdmin()
    const { data: userData, error: uerr } = await admin.auth.getUser(token)
    if (uerr || !userData?.user) return NextResponse.json({ error: 'Invalid auth' }, { status: 401 })

    const { prompt, context } = await req.json().catch(() => ({}))
    const userPrompt = String(prompt ?? '').trim()
    
    if (!userPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const systemPrompt = `You are MoneyXprt, an AI financial advisor specializing in investment fee analysis and cost optimization.
Focus on:
1) Investment fee analysis and cost reduction strategies
2) Advisor fee assessment and alternatives
3) Portfolio optimization for cost efficiency
Label any estimates or assumptions as [Unverified]. Keep responses concise and actionable.`

    const output = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    const redacted = redactPII(output)
    const digest = sha256Hex(userPrompt + (context || ''))

    // Log to database with real user ID
    const { error } = await admin.from('conversations').insert({
      user_id: userData.user.id,
      prompt_hash: digest,
      response: redacted,
      metadata: { endpoint: 'fee-check', timestamp: new Date().toISOString() }
    })

    if (error) {
      console.error('Database logging failed:', error)
      // Continue anyway - don't fail the request
    }

    return NextResponse.json({ 
      response: redacted,
      metadata: {
        requestHash: digest,
        hasPII: output !== redacted,
        sanitized: true
      }
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      response: result.response,
      metadata: {
        requestHash: result.requestHash,
        hasPII: result.hasPII,
        sanitized: result.sanitized
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}