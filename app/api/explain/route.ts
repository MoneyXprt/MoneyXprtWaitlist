import { NextResponse } from 'next/server'
import { ExplainGetSchema, ExplainPostSchema } from '@/lib/api/schemas'

export const dynamic = 'force-dynamic'

const REASONS: Record<string, string> = {
  ptet_state: 'Because you have pass‑through income and live in a state that allows PTET, electing it can bypass the $10k SALT cap and lower your federal taxes.',
  qbi_199a: 'Because you have pass‑through income, you may qualify for the QBI deduction, which can reduce taxes on that business income within IRS limits.',
  cost_seg_bonus: 'Because you own rentals with significant basis, a cost segregation study can accelerate depreciation and reduce near‑term taxable income.',
  augusta_280a: 'Because you operate a business and host meetings at home, renting your home to your company up to 14 days can be tax‑free under §280A.',
  employ_kids: 'Because you have dependents and a business, paying your children reasonable wages for real work can shift income and reduce family taxes.',
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code') || undefined
  const parsed = ExplainGetSchema.safeParse({ code })
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const reason = (code && REASONS[code]) || 'This strategy may fit based on your answers.'
  return NextResponse.json({ reason })
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}))
  const parsed = ExplainPostSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const code = parsed.data.code
  const reason = (code && REASONS[code]) || 'This strategy may fit based on your answers.'
  return NextResponse.json({ reason })
}

