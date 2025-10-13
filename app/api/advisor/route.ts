import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { env, assertEnv } from '@/lib/config/env'
import { SYSTEM_ADVISOR } from '@/lib/ai/prompts'

export const runtime = 'nodejs'

// System prompt imported from shared prompts

export async function POST(req: Request) {
  try {
    assertEnv(['OPENAI_API_KEY'])
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { message?: string; planContext?: any }
    const question = (body?.message || '').toString().trim()
    if (!question) return NextResponse.json({ error: 'message is required' }, { status: 400 })

    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
    const client = new OpenAI({ apiKey: env.server.OPENAI_API_KEY! })
    const messages = [
      { role: 'system' as const, content: SYSTEM_ADVISOR },
      {
        role: 'user' as const,
        content: JSON.stringify({ question, planContext: body?.planContext || {} })
      },
    ]
    const completion = await client.chat.completions.create({ model, temperature: 0.25, messages, max_tokens: 900 })
    const response = completion.choices?.[0]?.message?.content || 'Not enough info.'
    return NextResponse.json({ response })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}
