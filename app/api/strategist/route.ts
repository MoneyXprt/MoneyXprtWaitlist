// ✅ Force Node runtime so supabase-js works (avoids Edge warnings)
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import OpenAI from 'openai'

// Row type for the select
type PromptRow = { body: string }

export async function POST(req: Request) {
  try {
    const sb = supabaseAdmin()

    // ✅ Ask Supabase for a single row with typing
    const { data, error } = await sb
      .from('agent_prompts')
      .select('body')
      .eq('role', 'system')
      .eq('is_active', true)
      .maybeSingle<PromptRow>() // <- typed single row (or null)

    if (error) throw new Error(error.message)

    const systemBody =
      data?.body ?? 'You are MoneyXprt, a calm, plain-English financial strategist.'

    const { userMessage, payload } = (await req.json().catch(() => ({} as any))) as {
      userMessage?: string
      payload?: unknown
    }

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      { role: 'system', content: systemBody },
    ]
    if (payload) messages.push({ role: 'user', content: JSON.stringify(payload) })
    if (userMessage) messages.push({ role: 'user', content: userMessage })

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const model = process.env.MONEYXPRT_MODEL || 'gpt-4o-mini'

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      messages,
    })

    const answer = completion.choices[0]?.message?.content ?? ''

    // 5) Save the run to Supabase (typed insert, non-fatal on failure)
    type ScenarioSimInsert = {
      profile_id: string | null
      tax_year: number
      scenario_data: any
      user_message: string
      model: string
      answer: string
    }

    try {
      const sb2 = supabaseAdmin()
      const taxYear: number = (payload as any)?.meta?.taxYear ?? new Date().getFullYear()

      const row: ScenarioSimInsert = {
        profile_id: null,
        tax_year: taxYear,
        scenario_data: (payload as any) ?? {},
        user_message: userMessage ?? '',
        model,
        answer,
      }

      await sb2.from('scenario_simulations').insert<ScenarioSimInsert>(row)
    } catch (e: any) {
      console.error('Error saving scenario run:', e?.message || e)
    }

    return NextResponse.json({ ok: true, answer })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
