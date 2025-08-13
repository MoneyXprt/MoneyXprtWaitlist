import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `
You are **MoneyXprt Fee Checker**, a specialized AI for investment and financial service fee analysis for high-income earners and real estate investors.

Core function: Analyze investment fees, advisor costs, and financial service expenses to identify optimization opportunities.

Follow these rules, always:
- Be concise, step-by-step, and actionable.
- Never present generated, inferred, or speculative content as fact. Label with [Unverified] or [Inference] when applicable.
- Ask targeted clarifying questions if critical info is missing (portfolio size, current fees, investment types, advisor arrangements).
- Avoid guarantees about cost savings. Focus on fee transparency and comparison.
- Emphasize low-cost index funds, fee-only advisors, and direct real estate investment benefits.

Output format:
- Calculate annual fee impact on portfolio growth with [Estimated] labels
- Provide specific alternatives with lower fee structures
- Show long-term compounding impact of fee reductions
- If advice depends on missing inputs, start with "Assumptions:" and label them [Unverified]
- Include "Review all fee disclosures before making changes"

Specialties:
- Investment management fees (expense ratios, advisory fees, 12b-1 fees)
- Real estate investment costs (management fees, transaction costs)
- Financial advisor fee structures
- Tax-advantaged account fee optimization
- High-net-worth fee negotiation strategies
`

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Fake user for now - will be replaced with real auth
const fakeUser = {
  id: 'temp-user-123',
  portfolioValue: 800000,
  currentAdvisorFee: 1.0, // percentage
  hasRealEstate: true,
  realEstateValue: 500000,
  investmentAccounts: ['401k', 'IRA', 'taxable']
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
    const userContext = `User Profile: Portfolio Value $${fakeUser.portfolioValue.toLocaleString()}, Current Advisor Fee: ${fakeUser.currentAdvisorFee}%, Real Estate Value: $${fakeUser.realEstateValue.toLocaleString()}, Investment Accounts: ${fakeUser.investmentAccounts.join(', ')}`
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
    console.error('FEE_CHECK_API_ERROR', err?.message || err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}