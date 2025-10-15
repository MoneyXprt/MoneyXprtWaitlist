import OpenAI from 'openai'
import { env, assertEnv } from '@/lib/config/env'
import type { ScoreResult, ScoreBreakdown } from '@/lib/score'
import { sha256Hex } from '@/lib/crypto'
import { getDb } from '@/lib/db/index'
import { aiNarrativeCache } from '@/lib/db/schema'
import { and, desc, eq, gte } from 'drizzle-orm'
import { SYSTEM_NARRATIVE } from '@/lib/ai/prompts'

export interface NarrativeAction {
  label: string
  reason: string
  effort: 'low'|'med'|'high'
  est_savings_band?: '$$'|'$$$'|'$$$$'
}

export interface NarrativeSection {
  section: 'retirement'|'entity'|'deductions'|'investments'|'insurance'|'planning'
  what_helped: string[]
  what_hurt: string[]
  suggestions: string[]
}

export interface Narrative {
  title: string
  summary: string
  key_actions: NarrativeAction[]
  score_explainer: NarrativeSection[]
  disclaimers: string[]
}

export interface NarrativeInput {
  profile?: Record<string, unknown>
  scoreResult: ScoreResult
  strategies?: Array<{ code: string; name?: string }>
  year?: number
}

// System prompt is imported from shared prompts

export function buildNarrativePrompt(input: NarrativeInput): { system: string; user: string } {
  const year = input.year ?? new Date().getFullYear()
  const system = [
    'You are MoneyXprt, an educational financial assistant.',
    'Guardrails:',
    '1) Educational output only — NOT legal, tax, or financial advice.',
    '2) Include a clear “educational only” disclaimer in the JSON output.',
    '3) Avoid prescriptive/absolute language (no "you must", no "guaranteed"). Prefer ranges/bands and frame actions by effort vs impact.',
    '4) For elections or designations (e.g., S‑Corp, Real Estate Professional status, cost segregation), suggest consulting a CPA.',
    '5) Do not hallucinate unavailable data. If data is missing, state assumptions briefly.',
    '6) Keep tone concise, professional, and encouraging.',
    'Output ONLY valid JSON matching the provided schema.',
  ].join('\n')

  const payload = {
    title: `How to Keep More in ${year}`,
    profile: input.profile ?? {},
    scoreResult: input.scoreResult,
    selectedStrategies: (input.strategies || []).map(s => ({ code: s.code, name: s.name || '' })),
    schema: {
      title: 'string',
      summary: 'string (2–3 sentences)',
      key_actions: [
        { label: 'string', reason: 'string', effort: 'low|med|high', est_savings_band: '$$|$$$|$$$$ (optional)' }
      ],
      score_explainer: [
        { section: 'retirement|entity|deductions|investments|insurance|planning', what_helped: ['string'], what_hurt: ['string'], suggestions: ['string'] }
      ],
      disclaimers: ['string']
    }
  }

  const user = [
    'Create a narrative using this context (JSON):',
    JSON.stringify(payload, null, 2),
    'Rules:',
    '- Be deterministic and concise. Do not include extra commentary outside JSON.',
    '- Prioritize high-impact, low-effort actions first.',
  ].join('\n')

  return { system, user }
}

export async function generateNarrative(input: NarrativeInput): Promise<Narrative> {
  assertEnv(['OPENAI_API_KEY'])
  const client = new OpenAI({ apiKey: env.server.OPENAI_API_KEY! })
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
  // Optional cache/rate-limit only if we can infer a profile id
  const profileId = (input.profile as any)?.id as string | undefined
  const db = getDb()

  // Build a stable input hash
  const digest = {
    filingStatus: (input.profile as any)?.filingStatus || (input.profile as any)?.filing_status || null,
    state: (input.profile as any)?.state || (input.profile as any)?.primary_state || null,
    entityType: (input.profile as any)?.entityType || (input.profile as any)?.entity_type || null,
    breakdown: input.scoreResult?.breakdown || {},
    strategies: (input.strategies || []).map((s) => s.code).sort(),
  }
  const inputHash = sha256Hex(JSON.stringify(digest))

  if (profileId) {
    // Fresh cache (<7d)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const cached = await db
      .select()
      .from(aiNarrativeCache)
      .where(and(eq(aiNarrativeCache.profileId, profileId), eq(aiNarrativeCache.inputHash, inputHash), gte(aiNarrativeCache.createdAt, sevenDaysAgo)))
      .orderBy(desc(aiNarrativeCache.createdAt))
      .limit(1)
    if (cached[0]?.narrative) {
      return cached[0].narrative as unknown as Narrative
    }

    // Rate limit: 10 per day per profile
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const recent = await db
      .select()
      .from(aiNarrativeCache)
      .where(and(eq(aiNarrativeCache.profileId, profileId), gte(aiNarrativeCache.createdAt, startOfDay)))
    if (recent.length >= 10) {
      throw new Error('RATE_LIMIT: Too many narratives today; please try tomorrow.')
    }
  }

  // Build minimal user payload as strict JSON string
  const year = input.year ?? new Date().getFullYear()
  const profileSummary = {
    filingStatus: (input.profile as any)?.filingStatus || (input.profile as any)?.filing_status || null,
    state: (input.profile as any)?.state || (input.profile as any)?.primary_state || null,
    entityType: (input.profile as any)?.entityType || (input.profile as any)?.entity_type || null,
    year,
  }
  const userContent = JSON.stringify({
    profileSummary,
    scoreResult: input.scoreResult,
    strategies: input.strategies || [],
  })

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 1200,
    messages: [
      { role: 'system', content: SYSTEM_NARRATIVE },
      { role: 'user', content: userContent },
    ],
  })

  const content = completion.choices?.[0]?.message?.content ?? ''
  try {
    const parsed = JSON.parse(content) as Narrative
    // Basic structural guard
    if (!parsed || typeof parsed.title !== 'string' || !Array.isArray(parsed.disclaimers)) {
      throw new Error('Invalid narrative shape')
    }
    // Ensure standardized disclaimers are included
    const hardline1 = 'Educational only — not legal, tax, or financial advice. Consult a CPA for elections (e.g., S‑Corp), REP status, and cost segregation.'
    const hardline2 = 'MoneyXprt provides educational information only and is not a tax, legal, or investment advisor.'
    if (!parsed.disclaimers.includes(hardline1)) parsed.disclaimers.push(hardline1)
    if (!parsed.disclaimers.includes(hardline2)) parsed.disclaimers.push(hardline2)
    // Ensure standardized disclaimer is included
    const hardline = 'Educational only — not legal, tax, or financial advice. Consult a CPA for elections (e.g., S‑Corp), REP status, and cost segregation.'
    if (!parsed.disclaimers.includes(hardline)) parsed.disclaimers.push(hardline)
    // Upsert cache if possible
    if (profileId) {
      await db.insert(aiNarrativeCache).values({
        profileId,
        inputHash,
        narrative: parsed as any,
      })
    }
    return parsed
  } catch {
    const year = input.year ?? new Date().getFullYear()
    // Safe fallback
    const fallback: Narrative = {
      title: `How to Keep More in ${year}`,
      summary: 'Educational overview of actions to reduce taxes and improve after‑tax wealth. Data was insufficient for a tailored narrative; recommendations are generic.',
      key_actions: [
        { label: 'Increase 401(k) deferrals', reason: 'Reduces taxable wages', effort: 'med', est_savings_band: '$$' },
        { label: 'Optimize asset location', reason: 'More tax‑efficient investment growth', effort: 'med' },
      ],
      score_explainer: [
        { section: 'retirement', what_helped: [], what_hurt: [], suggestions: ['Evaluate 401(k), HSA, and IRA contributions.'] },
        { section: 'entity', what_helped: [], what_hurt: [], suggestions: ['If you have SE income, assess S‑Corp fit with a CPA.'] },
        { section: 'deductions', what_helped: [], what_hurt: [], suggestions: ['Check if itemizing beats standard; consider bunching/DAF.'] },
        { section: 'investments', what_helped: [], what_hurt: [], suggestions: ['Place tax‑efficient assets in taxable; consider TLH readiness.'] },
        { section: 'insurance', what_helped: [], what_hurt: [], suggestions: ['Align withholdings/estimates and review risk coverages.'] },
        { section: 'planning', what_helped: [], what_hurt: [], suggestions: ['Evaluate advanced strategies only if appropriate.'] },
      ],
      disclaimers: [
        'This content is educational only and not legal, tax, or investment advice. Consult a qualified professional before acting.',
        'Educational only — not legal, tax, or financial advice. Consult a CPA for elections (e.g., S‑Corp), REP status, and cost segregation.',
        'MoneyXprt provides educational information only and is not a tax, legal, or investment advisor.'
      ],
    }
    if (profileId) {
      await db.insert(aiNarrativeCache).values({ profileId, inputHash, narrative: fallback as any })
    }
    return fallback
  }
}

export default generateNarrative
