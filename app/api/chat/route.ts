import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { env, assertEnv } from '@/lib/config/env'
import log from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { checkDailyLimit, incrementUsage } from '@/lib/usage'

// Ensure the API key exists at runtime and initialize client once per module
assertEnv(["OPENAI_API_KEY"])
const openai = new OpenAI({ apiKey: env.server.OPENAI_API_KEY! })

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const allow = await checkDailyLimit(user.id, 20)
    if (!allow) return NextResponse.json({ error: 'Daily advisor message limit reached. Please try again tomorrow.' }, { status: 429 })
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are MoneyXprt, an AI financial advisor specializing in helping high-income earners and real estate investors optimize their wealth. You provide expert advice on:

- Tax planning and optimization strategies
- Investment portfolio management
- Real estate investment opportunities
- Retirement planning
- Estate planning
- Business financial planning
- Wealth preservation strategies

Always provide practical, actionable advice. Be professional but approachable. When discussing specific financial strategies, include relevant disclaimers about consulting with qualified professionals for personalized advice.

Keep responses concise but comprehensive, typically 2-3 paragraphs unless the question requires more detail.`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.'

    await incrementUsage({ userId: user.id, tokensIn: 0, tokensOut: 0 })
    return NextResponse.json({ response })
  } catch (error: any) {
    log.error('OpenAI API error', { error: error?.message || String(error) })
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'OpenAI API quota exceeded. Please check your API key and billing settings.' 
      }, { status: 429 })
    }
    
    return NextResponse.json({ 
      response: 'I apologize, but I\'m experiencing technical difficulties. Please try again later or contact support if the issue persists.' 
    })
  }
}
