import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

type Body = { userMessage?: string; payload?: unknown }

export async function POST(req: Request) {
  try {
    const { userMessage, payload } = (await req.json().catch(() => ({}))) as Body

    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('agent_prompts')
      .select('body')
      .eq('role', 'system')
      .eq('is_active', true)
      .limit(1)
    if (error) throw new Error(error.message)
    const systemBody = data?.[0]?.body || 'You are MoneyXprt, a calm, plain‑English financial strategist.'

    const openai = new OpenAI()
    const model = process.env.MONEYXPRT_MODEL || 'gpt-4o-mini'

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: typeof systemBody === 'string' ? systemBody : JSON.stringify(systemBody) },
    ]
    if (payload !== undefined) {
      messages.push({ role: 'user', content: typeof payload === 'string' ? payload : JSON.stringify(payload) })
    }
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage })
    }

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      messages,
    })
    const answer = completion.choices?.[0]?.message?.content || ''
    return NextResponse.json({ ok: true, answer })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
