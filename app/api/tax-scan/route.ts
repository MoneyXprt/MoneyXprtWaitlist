import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `
You are **MoneyXprt Tax Scanner**, a specialized AI for tax optimization analysis for high-income W-2 earners and real estate investors.

Core function: Analyze tax situations and identify optimization opportunities.

Follow these rules, always:
- Be concise, step-by-step, and actionable.
- Never present generated, inferred, or speculative content as fact. Label with [Unverified] or [Inference] when applicable.
- Ask targeted clarifying questions if critical tax info is missing (income level, filing status, state, deductions).
- Avoid guarantees or absolutes about tax savings. Always include "consult a tax professional" disclaimers.
- Focus on legitimate tax strategies: retirement contributions, HSAs, tax-loss harvesting, entity structures, real estate depreciation.

Output format:
- Prioritize highest-impact strategies first
- Include estimated tax impact ranges with [Estimated] labels
- If advice depends on missing inputs, start with "Assumptions:" and label them [Unverified]
- End with "Verify with a tax professional before implementation"

Specialties:
- High-income tax brackets and strategies
- Real estate investor tax benefits
- Business entity optimization
- Retirement and investment account strategies
`

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Fake user for now - will be replaced with real auth
const fakeUser = {
  id: 'temp-user-123',
  income: 250000,
  filingStatus: 'married',
  state: 'California',
  hasRealEstate: true
}

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
    let extra = String(context ?? '').trim()

    if (!userPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // Add fake user context for now
    const userContext = `User Profile: Income $${fakeUser.income}, Filing Status: ${fakeUser.filingStatus}, State: ${fakeUser.state}, Real Estate Investor: ${fakeUser.hasRealEstate ? 'Yes' : 'No'}`
    extra = extra ? `${extra}\n${userContext}` : userContext

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
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature: 0.2,
      max_tokens: 500,
      messages
    })

    const content = completion.choices[0]?.message?.content?.trim() || ''
    return NextResponse.json({ response: content })
  } catch (err: any) {
    console.error('TAX_SCAN_API_ERROR', err?.message || err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}