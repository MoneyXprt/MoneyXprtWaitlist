import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { env, assertEnv } from '@/lib/config/env'
import log from '@/lib/logger'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    if (!env.server.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 })
    }
    const client = new OpenAI({ apiKey: env.server.OPENAI_API_KEY })
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const completion = await client.chat.completions.create({
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
