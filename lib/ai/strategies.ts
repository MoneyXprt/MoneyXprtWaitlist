import OpenAI from 'openai'
import { env, assertEnv } from '@/lib/config/env'

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

const SYSTEM = `
You are MoneyXprt’s educational strategy generator.

Constraints:
- Educational output only. No guarantees. Do not provide legal, tax, or investment advice.
- Do not invent unknowns. If information is missing, prefer conservative assumptions.
- Output MUST be strict JSON: an array of StrategyDraft objects. No markdown, no commentary.
- Each StrategyDraft must include: code, name, rationale (1–2 sentences), effort, optional est_savings_band, prerequisites, conflicts.
`;

export function buildStrategiesPrompt(input: StrategyInput): { system: string; user: string } {
  const year = input.year ?? new Date().getFullYear()
  const profileSummary = {
    filingStatus: (input.profile as any)?.filingStatus || (input.profile as any)?.filing_status || null,
    state: (input.profile as any)?.state || (input.profile as any)?.primary_state || null,
    entityType: (input.profile as any)?.entityType || (input.profile as any)?.entity_type || null,
    year,
  }
  const user = JSON.stringify({ profileSummary, plan: input.plan || {} })
  return { system: SYSTEM, user }
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
  try {
    const parsed = JSON.parse(content) as StrategyDraft[]
    if (!Array.isArray(parsed)) throw new Error('not array')
    // minimal shape checks
    const out = parsed.filter((s) => typeof s?.code === 'string' && typeof s?.name === 'string' && typeof s?.rationale === 'string')
    return out
  } catch {
    return []
  }
}

export default generateStrategies

