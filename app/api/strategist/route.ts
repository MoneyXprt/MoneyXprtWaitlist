import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { assertEnv, env } from '@/lib/config/env'
import { evaluateDebt, gates as buildGates, rankStrategies } from '@/lib/strategy/rules'
import { buildFiveYear } from '@/lib/plan/fiveyear'
import { systemPrompt, userPrompt, jsonSchemaHint } from '@/lib/strategy/prompt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ----- Zod schema approximating AssessmentInput -----
const FilingStatus = z.enum(['Single', 'MFJ', 'MFS', 'HOH', 'QW'])
const EntityType = z.enum(['None', 'SoleProp', 'LLC', 'S-Corp', 'C-Corp', 'Partnership'])
const DebtType = z.enum(['credit_card','student_loan','auto','mortgage','personal','heloc','medical','other'])

const DebtItem = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: DebtType,
  balance: z.number().nonnegative(),
  aprPercent: z.number().nonnegative(),
  minPayment: z.number().nonnegative(),
  secured: z.boolean().optional(),
  fixedRate: z.boolean().optional(),
  note: z.string().optional(),
})

const AssessmentInputSchema = z.object({
  filingStatus: FilingStatus,
  state: z.string().min(2),
  dependents: z.number().int().nonnegative(),
  income: z.object({
    w2Wages: z.number().nonnegative().default(0),
    w2Withholding: z.number().nonnegative().optional(),
    seNetProfit: z.number().nonnegative().optional(),
    w2FromEntity: z.number().nonnegative().optional(),
    isQBIEligible: z.boolean().optional(),
    entityType: EntityType.optional(),
    interestIncome: z.number().nonnegative().optional(),
    dividendsOrdinary: z.number().nonnegative().optional(),
    dividendsQualified: z.number().nonnegative().optional(),
    capGainsShort: z.number().nonnegative().optional(),
    capGainsLong: z.number().nonnegative().optional(),
    rsuTaxableComp: z.number().nonnegative().optional(),
    otherIncome: z.number().nonnegative().optional(),
    rentals: z.array(z.object({
      type: z.enum(['LTR', 'STR']),
      netIncome: z.number(),
      state: z.string().optional(),
      materiallyParticipates: z.boolean().optional(),
    })).optional(),
  }),
  deductions: z.object({
    stateIncomeTaxPaid: z.number().nonnegative().optional(),
    stateSalesTaxPaid: z.number().nonnegative().optional(),
    realEstatePropertyTax: z.number().nonnegative().optional(),
    personalPropertyTax: z.number().nonnegative().optional(),
    charityCash: z.number().nonnegative().optional(),
    charityNonCash: z.number().nonnegative().optional(),
    mortgageInterestPrimary: z.number().nonnegative().optional(),
    medicalExpenses: z.number().nonnegative().optional(),
    useSalesTaxInsteadOfIncome: z.boolean().optional(),
  }).optional(),
  cashflow: z.object({
    emergencyFundMonths: z.number().nonnegative(),
    monthlySurplus: z.number(),
  }),
  preferences: z.object({
    givingAnnual: z.number().nonnegative().optional(),
    wantsSTR: z.boolean().optional(),
    willingSelfManageSTR: z.boolean().optional(),
    primaryGoal: z.string().optional(),
    riskTolerance: z.enum(['low','medium','high']).optional(),
  }).optional(),
  debts: z.array(DebtItem).optional(),
})

assertEnv(['OPENAI_API_KEY'])
const openai = new OpenAI({ apiKey: env.server.OPENAI_API_KEY! })

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = AssessmentInputSchema.safeParse(body?.intake ?? body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
    }
    const input = parsed.data

    // Precompute helpers
    const debtPlan = evaluateDebt(input)
    const gateVals = buildGates(input)
    const fiveYear = buildFiveYear(input)

    const precomputed = { debtPlan, gates: gateVals, fiveYear }

    // Call OpenAI for structured JSON response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt(input as any, precomputed) },
        { role: 'user', content: jsonSchemaHint },
      ],
    })

    const content = completion.choices?.[0]?.message?.content || '{}'
    const json = JSON.parse(content)

    if (Array.isArray(json?.strategies)) {
      json.strategies = rankStrategies(json.strategies)
    }

    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 })
  }
}

