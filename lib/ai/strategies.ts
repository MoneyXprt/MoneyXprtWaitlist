import OpenAI from 'openai'
import { env, assertEnv } from '@/lib/config/env'
import { SYSTEM_STRATEGY } from '@/lib/ai/prompts'

export interface StrategyDraft {
  code: string
  name: string
  rationale: string
  effort: 'low'|'med'|'high'
  est_savings_band?: '$'|'$$'|'$$$'|'$$$$'
  prerequisites?: string[]
  conflicts?: string[]
}

export interface StrategyInput {
  profile?: Record<string, unknown>
  plan?: Record<string, unknown>
  year?: number
}

// System prompt imported from shared prompts

export function buildStrategiesPrompt(input: StrategyInput): { system: string; user: string } {
  const year = input.year ?? new Date().getFullYear()
  const profileSummary = {
    filingStatus: (input.profile as any)?.filingStatus || (input.profile as any)?.filing_status || null,
    state: (input.profile as any)?.state || (input.profile as any)?.primary_state || null,
    entityType: (input.profile as any)?.entityType || (input.profile as any)?.entity_type || null,
    year,
  }
  const user = JSON.stringify({ profileSummary, plan: input.plan || {} })
  return { system: SYSTEM_STRATEGY, user }
}

export async function generateStrategies(input: StrategyInput): Promise<StrategyDraft[]> {
  assertEnv(['OPENAI_API_KEY'])
  const client = new OpenAI({ apiKey: env.server.OPENAI_API_KEY! })
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
  const { system, user } = buildStrategiesPrompt(input)

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 1200,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  const content = completion.choices?.[0]?.message?.content ?? ''
  function isStrategyDraftArray(v: any): v is StrategyDraft[] {
    return Array.isArray(v) && v.every(x => x && typeof x.code === 'string' && typeof x.name === 'string' && typeof x.rationale === 'string' && ['low','med','high'].includes(x.effort))
  }
  try {
    const parsed = JSON.parse(content)
    if (!isStrategyDraftArray(parsed)) throw new Error('Invalid strategy array shape')
    return parsed
  } catch {
    return [{
      code: 'disclaimer_only',
      name: 'Disclaimer / Not Advice',
      rationale: 'Educational only; consult a qualified CPA for decisions.',
      effort: 'low',
      est_savings_band: '$'
    }]
  }
}

export default generateStrategies
