// ✅ Force Node runtime so supabase-js works (avoids Edge warnings)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import '@/lib/observability/register-server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import OpenAI from 'openai'
import { z } from 'zod'
import { publicId as makePublicId } from '@/lib/id'
import type { ResultsV1 } from '@/types/results'
import { createClient } from '@supabase/supabase-js'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

// ---- Usage guard (quota) helpers ----
let _sbUsage: ReturnType<typeof createClient> | null = null
function sbUsage() {
  if (_sbUsage) return _sbUsage
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) as string | undefined
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE(SUPABASE_SERVICE_ROLE_KEY)')
  }
  _sbUsage = createClient(url, key)
  return _sbUsage
}

async function getBillingProfileByEmail(email: string) {
  const { data } = await sbUsage()
    .from('billing_profiles')
    .select('*')
    .eq('email', email)
    .single()
  return data as any
}

async function canRunAndLog(userId: string, opts: { dryRun?: boolean } = {}) {
  const now = new Date()
  // entitlements (fallbacks if record not created yet)
  const { data: ent } = await sbUsage()
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  const daily = (ent as any)?.daily_allowance ?? 1
  const monthly = ((ent as any)?.monthly_allowance ?? 0) + ((ent as any)?.monthly_bonus ?? 0)

  const today = await sbUsage()
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('occurred_at', startOfDay(now).toISOString())
    .lte('occurred_at', endOfDay(now).toISOString())

  const month = await sbUsage()
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('occurred_at', startOfMonth(now).toISOString())
    .lte('occurred_at', endOfMonth(now).toISOString())

  const todayUsed = (today as any).count ?? 0
  const monthUsed = (month as any).count ?? 0

  if (daily > 0 && todayUsed >= daily) return { ok: false as const, reason: 'daily' as const }
  if (monthly > 0 && monthUsed >= monthly) return { ok: false as const, reason: 'monthly' as const }

  if (!opts.dryRun) await sbUsage().from('usage_events').insert({ user_id: userId, kind: 'strategist_run' } as any)
  return { ok: true as const }
}

// ---- ResultsV1 mapper (coerce LLM JSON safely) ----
const topActionSchema = z.object({
  title: z.string(),
  whyItMatters: z.string(),
  estTaxImpact: z.coerce.number(),
  cashNeeded: z.coerce.number(),
  difficulty: z.enum(["Low","Med","High"]),
  timeToImplement: z.enum(["Now","30–60d","90d+"]),
  risks: z.array(z.string()).default([]),
})

const resultsSchema = z.object({
  summary: z.object({
    householdAGI: z.coerce.number(),
    filingStatus: z.string(),
    primaryGoal: z.string(),
  }),
  top3Actions: z.array(topActionSchema).length(3),
  taxImpact: z.object({
    thisYear: z.coerce.number(),
    nextYear: z.coerce.number(),
    _5Year: z.coerce.number().transform(v => v),
  }),
  cashPlan: z.object({
    upfront: z.coerce.number(),
    monthlyCarry: z.coerce.number(),
  }),
  riskFlags: z.array(z.string()),
  assumptions: z.array(z.string()),
  confidence: z.union([z.literal(0), z.literal(0.25), z.literal(0.5), z.literal(0.75), z.literal(1)]),
  disclaimers: z.array(z.string()).default(["This is educational, not tax advice."]),
}).transform(v => ({
  ...v,
  taxImpact: { thisYear: v.taxImpact.thisYear, nextYear: v.taxImpact.nextYear, ['5Year']: v.taxImpact._5Year },
})) as unknown as z.ZodType<ResultsV1>

function mapToResultsV1(llmJson: unknown): ResultsV1 {
  const parsed = resultsSchema.safeParse(llmJson)
  if (!parsed.success) {
    return {
      summary: { householdAGI: 0, filingStatus: 'Unknown', primaryGoal: 'Lower taxes' },
      top3Actions: Array.from({ length: 3 }).map((_, i) => ({
        title: `Action ${i + 1}`,
        whyItMatters: 'TBD',
        estTaxImpact: 0,
        cashNeeded: 0,
        difficulty: 'Med',
        timeToImplement: '30–60d',
        risks: [],
      })),
      taxImpact: { thisYear: 0, nextYear: 0, ['5Year']: 0 },
      cashPlan: { upfront: 0, monthlyCarry: 0 },
      riskFlags: ['Could not parse strategist output'],
      assumptions: [],
      confidence: 0.25,
      disclaimers: ['Parsing fallback. Not tax advice.'],
    }
  }
  return parsed.data
}

function extractJsonCandidate(text: string): unknown | null {
  if (!text) return null
  // try direct JSON
  try { return JSON.parse(text) } catch {}
  // fenced code blocks ```json ... ``` or ``` ... ```
  const fence = /```(?:json)?\n([\s\S]*?)```/i.exec(text)
  if (fence?.[1]) {
    try { return JSON.parse(fence[1]) } catch {}
  }
  // find first { ... }
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const slice = text.slice(firstBrace, lastBrace + 1)
    try { return JSON.parse(slice) } catch {}
  }
  return null
}

// Row type for the select
type PromptRow = { body: string }

// small helper
async function tryChat(openai: OpenAI, model: string, messages: any[]) {
  return openai.chat.completions.create({ model, temperature: 0.2, messages })
}

// simple exponential backoff
async function withRetries<T>(fn: () => Promise<T>, attempts = 3) {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e: any) {
      lastErr = e
      const status = e?.status || e?.response?.status
      // only retry on 429/5xx
      if (!(status === 429 || (status >= 500 && status < 600))) break
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, i)))
    }
  }
  throw lastErr
}

export async function POST(req: Request) {
  console.log('[strategist] POST hit')
  try {
    // Parse body once for guard + regular payload
    const body = (await req.json().catch(() => ({} as any))) as {
      email?: string
      userMessage?: string
      payload?: unknown
      profileId?: string | null
    }

    // Guard: require identity and enforce quotas
    const email = body?.email
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 401 })
    const bp = await getBillingProfileByEmail(email)
    if (!(bp as any)?.user_id) return NextResponse.json({ error: 'profile missing' }, { status: 401 })
    const authz = await canRunAndLog((bp as any).user_id as string)
    if (!authz.ok) {
      return NextResponse.json(
        { error: 'quota_exceeded', reason: authz.reason, upgrade: { pro: true, topup50: true } },
        { status: 402 }
      )
    }

    const admin = supabaseAdmin()

    // ✅ Ask Supabase for a single row with typing
    const { data, error } = await admin
      .from('agent_prompts')
      .select('body')
      .eq('role', 'system')
      .eq('is_active', true)
      .maybeSingle<PromptRow>() // <- typed single row (or null)

    if (error) throw new Error(error.message)

    const systemBody =
      data?.body ?? 'You are MoneyXprt, a calm, plain-English financial strategist.'

    // Encourage deterministic JSON-only output for mapper
    const strictSystem = `You are a tax strategist. Reply ONLY with strict JSON matching this TypeScript type:\n\n` +
      `type TopAction = {\n  title: string; whyItMatters: string; estTaxImpact: number; cashNeeded: number;\n  difficulty: \"Low\"|\"Med\"|\"High\"; timeToImplement: \"Now\"|\"30–60d\"|\"90d+\"; risks: string[];\n};\n` +
      `type ResultsV1 = {\n  summary: { householdAGI: number; filingStatus: string; primaryGoal: string; };\n  top3Actions: [TopAction, TopAction, TopAction];\n  taxImpact: { thisYear: number; nextYear: number; _5Year: number; };\n  cashPlan: { upfront: number; monthlyCarry: number; };\n  riskFlags: string[]; assumptions: string[]; confidence: 0|0.25|0.5|0.75|1; disclaimers: string[];\n};`

    const { userMessage, payload, profileId } = body
    console.log('[strategist] body:', {
      hasUserMessage: Boolean(userMessage && String(userMessage).length > 0),
      hasPayload: payload != null,
      profileId,
    })

    // Server-side payload validation (schema-first)
    const reqId = (globalThis as any).crypto?.randomUUID?.() || `req_${Date.now().toString(36)}`
    const intakeSchema = z.object({
      filingStatus: z.enum(['single', 'mfj', 'mfs', 'hoh', 'qw']),
      state: z.string().min(2),
      dependents: z.coerce.number().int().min(0).max(10),
      w2Income: z.coerce.number().nonnegative().default(0),
      seIncome: z.coerce.number().nonnegative().default(0),
      realEstateIncome: z.coerce.number().nonnegative().default(0),
      capitalGains: z.coerce.number().nonnegative().default(0),
      mortgageInterest: z.coerce.number().nonnegative().default(0),
      salt: z.coerce.number().nonnegative().default(0),
      charity: z.coerce.number().nonnegative().default(0),
      preTax401k: z.coerce.number().nonnegative().default(0),
      iraContribution: z.coerce.number().nonnegative().default(0),
    })
    const intake = (payload as any)?.intake
    const parsed = intakeSchema.safeParse(intake)
    if (!parsed.success) {
      console.warn('[strategist] invalid intake payload', {
        reqId,
        issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), code: i.code })),
      })
      return NextResponse.json({ ok: false, error: 'Invalid intake payload', reqId }, { status: 400 })
    }

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      { role: 'system', content: strictSystem },
      { role: 'system', content: systemBody },
    ]
    if (payload) messages.push({ role: 'user', content: JSON.stringify(payload) })
    if (userMessage) messages.push({ role: 'user', content: userMessage })

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const primary = process.env.MONEYXPRT_MODEL || 'gpt-4o-mini'

    let answer = ''
    try {
      const completion = await withRetries(() => tryChat(openai, primary, messages), 3)
      answer = completion.choices?.[0]?.message?.content ?? ''
      console.log('[strategist] openai answer length:', answer?.length || 0)
    } catch (e1: any) {
      // fallback to tiny model
      try {
        const completion2 = await tryChat(openai, 'gpt-4o-mini', messages)
        answer = completion2.choices?.[0]?.message?.content ?? ''
        console.log('[strategist] used fallback model (gpt-4o-mini)')
        // save and return with meta.fallback
        try {
          const sb2 = supabaseAdmin()
          console.log('[strategist] saving row to scenario_simulations')
          const taxYear: number = (payload as any)?.meta?.taxYear ?? new Date().getFullYear()
          await sb2.from('scenario_simulations').insert({
            profile_id: profileId ?? null,
            tax_year: taxYear,
            scenario_data: (payload as any) ?? {},
            user_message: userMessage ?? '',
            model: 'gpt-4o-mini',
            answer,
          } as any)
        } catch (e: any) {
          console.error('[strategist] error saving (fallback):', e?.message || e)
        }
        const llmJson = extractJsonCandidate(answer)
        const results = mapToResultsV1(llmJson)
        return NextResponse.json({ ok: true, answer, results, meta: { fallback: true, error: e1?.message } })
      } catch (e2: any) {
        console.error('[strategist] fallback model also failed:', e2?.message || e2)
        const fallbackAnswer =
          'We hit a temporary capacity limit contacting the AI. Here is a quick starter:\n' +
          '• Verify itemize vs. standard deduction and SALT cap.\n' +
          '• Max pre-tax 401(k)/IRA; consider backdoor Roth if eligible.\n' +
          '• If self-employed income: S-Corp/LLC taxed as S for reasonable comp + distributions.\n' +
          '• Charitable “bundle” year with DAF to exceed standard deduction.\n' +
          '• If renting a business use of home (Augusta Rule), document FMV and meetings.\n' +
          'Talk to a CPA/attorney to implement. (App temporarily in fallback mode.)'
        const results = mapToResultsV1(null)
        return NextResponse.json({ ok: true, answer: fallbackAnswer, results, meta: { fallback: true, error: e2?.message || e1?.message } })
      }
    }

    // 5) Save the run to Supabase (typed insert, non-fatal on failure)
    type ScenarioSimInsert = {
      profile_id: string | null
      tax_year: number
      scenario_data: any
      user_message: string
      model: string
      answer: string
    }

    try {
      const sb2 = supabaseAdmin()
      console.log('[strategist] saving row to scenario_simulations')
      const taxYear: number = (payload as any)?.meta?.taxYear ?? new Date().getFullYear()

      const row: ScenarioSimInsert = {
        profile_id: profileId ?? null,
        tax_year: taxYear,
        scenario_data: (payload as any) ?? {},
        user_message: userMessage ?? '',
        model: primary,
        answer,
      }

      await sb2.from('scenario_simulations').insert(row as any)
    } catch (e: any) {
      console.error('Error saving scenario run:', e?.message || e)
    }

    const llmJson = extractJsonCandidate(answer)
    const results = mapToResultsV1(llmJson)
    try {
      const suggestedPid = makePublicId()
      console.log('[strategist] results mapped; suggest save with public_id:', { suggestedPid })
    } catch {}
    return NextResponse.json({ ok: true, answer, results })
  } catch (e: any) {
    console.error('[strategist] error:', e?.message || e)
    // Capture API failure in Sentry if available
    try {
      const Sentry = await import('@sentry/nextjs')
      Sentry.captureException(e)
    } catch {}
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
