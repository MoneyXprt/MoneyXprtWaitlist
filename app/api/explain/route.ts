import { NextResponse } from 'next/server';
import { ExplainGetSchema, ExplainPostSchema } from '@/lib/api/schemas';

const MAP: Record<string, { title: string; description: string }> = {
  ptet_state: {
    title: 'PTET election (state SALT workaround)',
    description:
      'Some states let pass‑through businesses pay state income tax at the entity level. That restores a federal deduction your individual return can’t take because of the SALT cap. You elect it, pay estimates from the business, and owners get a credit on their state returns.'
  },
  qbi_199a: {
    title: 'QBI §199A deduction',
    description:
      'If you have qualified pass‑through income, you may deduct up to 20% of that income on your federal return. There are wage and property limits and phase‑outs at higher incomes. We check basics and estimate conservatively.'
  },
  cost_seg_bonus: {
    title: 'Cost segregation + bonus depreciation',
    description:
      'A study breaks a rental property into fast‑depreciating parts so you can expense more upfront. Bonus depreciation (phasing down) magnifies year‑one deductions, improving current‑year cash flow.'
  },
  augusta_280a: {
    title: 'Augusta Rule (§280A)',
    description:
      'Your business can rent your home for up to 14 days per year, and that rental income is tax‑free to you. Keep board minutes, market‑rate evidence, invoices, and payment proof.'
  },
  employ_kids: {
    title: 'Employ your children',
    description:
      'Paying children for real, age‑appropriate work can shift income into lower brackets and allow early Roth IRA savings. Keep job descriptions, timesheets, and run payroll properly.'
  }
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = ExplainGetSchema.safeParse({ code: searchParams.get('code') || undefined });
  const code = parsed.success ? parsed.data.code || '' : '';
  const info = MAP[code] || { title: 'Strategy', description: 'Explanation coming soon.' };
  return NextResponse.json({ code, ...info });
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = ExplainPostSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 });
  const { code } = parsed.data;
  const info = code ? MAP[code] : undefined;
  return NextResponse.json({ code, ...(info || { title: 'Strategy', description: 'Explanation coming soon.' }) });
}
