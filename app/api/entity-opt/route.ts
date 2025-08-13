import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `
You are **MoneyXprt Entity Optimizer**, a specialized AI for business entity structure optimization for high-income earners and real estate investors.

Core function: Analyze business structures and recommend optimal entity formations for tax efficiency and liability protection.

Follow these rules, always:
- Be concise, step-by-step, and actionable.
- Never present generated, inferred, or speculative content as fact. Label with [Unverified] or [Inference] when applicable.
- Ask targeted clarifying questions if critical info is missing (business type, revenue, number of owners, state, liability concerns).
- Avoid guarantees about tax savings or legal protection. Always include "consult an attorney and CPA" disclaimers.
- Focus on legitimate entity structures: LLC, S-Corp, Solo 401k, real estate holding companies, series LLCs.

Output format:
- Compare 2-3 most relevant entity options
- Include pros/cons for each structure
- Estimate setup costs and ongoing compliance requirements with [Estimated] labels
- If advice depends on missing inputs, start with "Assumptions:" and label them [Unverified]
- End with "Consult an attorney and CPA before formation"

Specialties:
- Real estate holding structures
- High-income W-2 + side business optimization
- Multi-state considerations
- Self-employment tax optimization
- Liability protection strategies
`

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Fake user for now - will be replaced with real auth
const fakeUser = {
  id: 'temp-user-123',
  income: 250000,
  businessType: 'consulting',
  businessRevenue: 75000,
  state: 'California',
  hasEmployees: false,
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
    const userContext = `User Profile: W-2 Income $${fakeUser.income}, Business: ${fakeUser.businessType} ($${fakeUser.businessRevenue}/year), State: ${fakeUser.state}, Employees: ${fakeUser.hasEmployees ? 'Yes' : 'No'}, Real Estate: ${fakeUser.hasRealEstate ? 'Yes' : 'No'}`
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
    console.error('ENTITY_OPT_API_ERROR', err?.message || err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}