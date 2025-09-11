// app/api/plan/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { PlanInput } from '@/lib/types';
import { buildRecommendations, getPlanSnapshot } from '@/lib/recommend';

// Optional: uncomment to run at the Edge (lower latency).
// export const runtime = 'edge';

// Minimal PlanInput validator (loose; matches current use)
const numberOrZero = z.number().finite().optional().default(0);
const PlanInputSchema = z.object({
  // Income
  salary: numberOrZero,
  bonus: numberOrZero,
  selfEmployment: numberOrZero,
  rsuVesting: numberOrZero,
  k1Active: numberOrZero,
  k1Passive: numberOrZero,
  otherIncome: numberOrZero,
  rentNOI: numberOrZero,

  // Spend
  fixedMonthlySpend: numberOrZero,
  lifestyleMonthlySpend: numberOrZero,

  // Balance sheet (top-level debts)
  cash: numberOrZero,
  brokerage: numberOrZero,
  retirement: numberOrZero,
  hsa: numberOrZero,
  crypto: numberOrZero,
  mortgageDebt: numberOrZero,
  studentLoans: numberOrZero,
  autoLoans: numberOrZero,
  creditCards: numberOrZero,
  otherDebt: numberOrZero,

  // Properties & alternatives (newer fields are optional)
  properties: z.array(
    z.object({
      estimatedValue: numberOrZero,
      mortgageBalance: numberOrZero,
      type: z.string().optional(),
      addressNick: z.string().optional(),
    })
  ).optional().default([]),
  alts: z.object({
    privateEquityVC: numberOrZero,
    collectibles: numberOrZero,
    other: numberOrZero,
  }).optional().default({ privateEquityVC: 0, collectibles: 0, other: 0 }),

  // Tax & planning flags
  filingStatus: z.enum(['single','married_joint','married_separate','head']).optional().default('single'),
  itemizeLikely: z.boolean().optional().default(false),
  usingRothBackdoor: z.boolean().optional().default(false),
  usingMegaBackdoor: z.boolean().optional().default(false),
  charitableInclination: z.boolean().optional().default(false),
  concentrationRisk: z.boolean().optional().default(false),

  // Safety
  emergencyFundMonths: numberOrZero,

  // Protection
  hasDisability: z.boolean().optional().default(false),
  hasTermLife: z.boolean().optional().default(false),
  hasUmbrella: z.boolean().optional().default(false),

  // Retirement target
  targetRetireIncomeMonthly: numberOrZero,

  // Discovery (optional passthrough)
  discovery: z.any().optional(),
  goals5y: z.array(z.string()).optional().default([]),
  goals20y: z.array(z.string()).optional().default([]),
  freedomDef: z.string().optional().default(''),
  confidence: z.number().optional().default(5),
});

export async function POST(req: Request) {
  // 1) Basic body size guard (1MB)
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  // 2) Parse & validate
  let input: PlanInput;
  try {
    const raw = await req.json();
    input = PlanInputSchema.parse(raw) as unknown as PlanInput;
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid input', details: err?.message }, { status: 400 });
  }

  // 3) Rule engine + snapshot
  const recommendations = buildRecommendations(input);
  const snapshot = getPlanSnapshot(input);

  // 4) Optional AI narrative
  const apiKey = process.env.OPENAI_API_KEY;
  let narrative = '';

  if (apiKey) {
    const messages = [
      {
        role: 'system',
        content:
          'You are a fiduciary-quality financial & tax planner for high-net-worth clients. ' +
          'Write clear, specific, and actionable guidance. Avoid boilerplate disclaimers. ' +
          'Assume U.S. rules at a high level; be conservative with claims.',
      },
      {
        role: 'user',
        content:
          `STRUCTURED INPUT (JSON):\n${JSON.stringify(
            { input, snapshot, ruleEngineBullets: recommendations },
            null,
            2
          )}\n\n` +
          'TASK: Draft a personalized plan:\n' +
          '1) Executive summary (3–6 bullets)\n' +
          '2) Cash flow & savings (specific % targets and dollar automation)\n' +
          '3) Investments & allocation (with any concentration notes)\n' +
          '4) Tax planning (Roth/backdoor, RSUs, itemize vs standard, entity/side-biz nudge if relevant)\n' +
          '5) Risk/insurance (term life, LTD, umbrella; name gaps)\n' +
          '6) Retirement trajectory (rough numbers from snapshot)\n' +
          '7) 90-day action checklist (numbered, concrete)\n' +
          'Keep it concise and tailored to the inputs provided; do not invent unknowns.',
      },
    ];

    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.2,
        }),
      });

      if (!resp.ok) {
        const errTxt = await resp.text().catch(() => '');
        console.error('OpenAI error', resp.status, errTxt);
      } else {
        const data = await resp.json();
        narrative = data?.choices?.[0]?.message?.content ?? '';
      }
    } catch (e) {
      console.error('OpenAI fetch failed', e);
    }
  }

  return NextResponse.json({ recommendations, narrative, snapshot });
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}