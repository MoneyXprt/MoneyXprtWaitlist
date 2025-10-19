// ✅ Force Node runtime so supabase-js works (avoids Edge warnings)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import '@/lib/observability/register-server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import OpenAI from 'openai'
import { z } from 'zod'

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
    const sb = supabaseAdmin()

    // ✅ Ask Supabase for a single row with typing
    const { data, error } = await sb
      .from('agent_prompts')
      .select('body')
      .eq('role', 'system')
      .eq('is_active', true)
      .maybeSingle<PromptRow>() // <- typed single row (or null)

    if (error) throw new Error(error.message)

    const systemBody =
      data?.body ?? 'You are MoneyXprt, a calm, plain-English financial strategist.'

    const { userMessage, payload, profileId } = (await req.json().catch(() => ({} as any))) as {
      userMessage?: string
      payload?: unknown
      profileId?: string | null
    }
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
        return NextResponse.json({ ok: true, answer, meta: { fallback: true, error: e1?.message } })
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
        return NextResponse.json({ ok: true, answer: fallbackAnswer, meta: { fallback: true, error: e2?.message || e1?.message } })
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

    return NextResponse.json({ ok: true, answer })
  } catch (e: any) {
    console.error('[strategist] error:', e?.message || e)
    // Capture API failure in Sentry if available
    try {
      // @ts-expect-error optional dependency may be missing in local dev
      const Sentry = await import('@sentry/nextjs')
      Sentry.captureException(e)
    } catch {}
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
