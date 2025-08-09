import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabaseServer'

const SYSTEM_PROMPT = `
You are **MoneyXprt**, an AI financial co‑pilot for high‑income W‑2 earners and real estate investors.
Follow these rules, always:
- Be concise, step-by-step, and actionable.
- Never present generated, inferred, or speculative content as fact. Label with [Unverified] or [Inference] when applicable.
- Ask targeted clarifying questions if info is missing.
- Avoid guarantees or absolutes ("prevents," "ensures," "guarantees"). If the user asks for certainty, explain limits.
- Prefer Next.js + Supabase + Tailwind + Vercel patterns in code suggestions.
- When code is needed, provide copy‑paste blocks with minimal explanation.

Output format:
- Short paragraphs, bullets when helpful.
- If advice depends on missing inputs, start with "Assumptions:" and label them [Unverified].
`

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not set' },
        { status: 500 }
      )
    }

    const { prompt, context } = await req.json().catch(() => ({ }))
    const userPrompt = String(prompt ?? '').trim()
    const extra = String(context ?? '').trim()

    if (!userPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // soft caps
    const cap = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s)
    const cappedPrompt = cap(userPrompt, 2000)
    const cappedContext = cap(extra, 1000)

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(cappedContext ? [{ role: 'system' as const, content: `Context: ${cappedContext}` }] : []),
      { role: 'user' as const, content: cappedPrompt }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      max_tokens: 500,
      messages
    })

    let content = completion.choices[0]?.message?.content?.trim() || ''
    
    // Post-process for absolute claims
    const absoluteClaims = ['guarantees', 'ensures', 'prevents', 'always works', 'never fails', 'will definitely']
    const hasAbsoluteClaim = absoluteClaims.some(claim => 
      content.toLowerCase().includes(claim.toLowerCase())
    )
    
    if (hasAbsoluteClaim) {
      content += '\n\n[Unverified] This claim may be conditional. Provide missing inputs or constraints.'
    }
    
    // Check for missing key financial info in user prompt
    const keyInfoTerms = ['income', 'salary', 'earning', 'state', 'filing status', 'married', 'single', 'dependents', 'age']
    const hasMissingInfo = keyInfoTerms.every(term => 
      !cappedPrompt.toLowerCase().includes(term.toLowerCase()) && 
      !cappedContext.toLowerCase().includes(term.toLowerCase())
    )
    
    if (hasMissingInfo && cappedPrompt.length > 20) {
      content = '[Unverified] Assumptions: General advice without specific income/tax situation details.\n\n' + content
    }

    try {
      if (supabaseAdmin) {
        // Optional: extract user_id from a header later; for now null
        await supabaseAdmin.from('conversations').insert({
          user_id: null,
          prompt: cappedPrompt,
          response: content,
          meta: cappedContext ? { context: cappedContext } : null
        })
      }
    } catch (e) {
      console.warn('convo log failed', e)
    }

    return NextResponse.json({ response: content })
  } catch (err: any) {
    console.error('ASK_API_ERROR', err?.message || err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}