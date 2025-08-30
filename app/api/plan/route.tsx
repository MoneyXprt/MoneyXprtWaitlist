// app/api/plan/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Body = {
  filingStatus: 'single' | 'married';
  state: string;
  marginalRatePct: number;

  w2Income: number;
  selfEmploymentIncome: number;
  businessProfit: number;

  k401Contrib: number;
  hsaContrib: number;
  hsaCoverage: 'single' | 'family';

  rentalUnits: number;
  charitableGiving: number;

  portfolioValue: number;
  advisorFeePct: number;
};

export async function POST(req: Request) {
  const b = (await req.json()) as Body;
  const mtr = Math.max(0, Math.min(60, b.marginalRatePct)) / 100;

  // Rough 2024-ish limits (update annually)
  const K401_LIMIT = 23000;
  const HSA_LIMIT = b.hsaCoverage === 'family' ? 8300 : 4150;

  const recs: {title: string; why: string; estSavings?: number}[] = [];
  let total = 0;

  // 1) Max employee 401(k)
  if (b.w2Income > 0 && b.k401Contrib < K401_LIMIT) {
    const room = Math.max(0, K401_LIMIT - b.k401Contrib);
    const save = Math.round(room * mtr);
    total += save;
    recs.push({
      title: 'Increase 401(k) deferrals to the annual limit',
      why: `You contributed $${b.k401Contrib.toLocaleString()} — room of $${room.toLocaleString()}. Traditional deferrals reduce taxable income.`,
      estSavings: save,
    });
  }

  // 2) HSA top-up
  if (b.hsaContrib < HSA_LIMIT) {
    const room = Math.max(0, HSA_LIMIT - b.hsaContrib);
    const save = Math.round(room * mtr);
    total += save;
    recs.push({
      title: 'Max your HSA',
      why: `Coverage: ${b.hsaCoverage}. Remaining room ~$${room.toLocaleString()}. HSA is triple-tax-advantaged.`,
      estSavings: save,
    });
  }

  // 3) Solo 401(k)/SEP for SE income
  if (b.businessProfit > 0 || b.selfEmploymentIncome > 0) {
    const profit = Math.max(b.businessProfit, b.selfEmploymentIncome * 0.6); // crude proxy
    const employerSide = Math.max(0, Math.round(profit * 0.20));
    const save = Math.round(employerSide * mtr);
    total += save;
    recs.push({
      title: 'Open Solo 401(k) or SEP for self-employment',
      why: `With profit around $${profit.toLocaleString()}, employer contribution headroom is roughly $${employerSide.toLocaleString()}.`,
      estSavings: save,
    });
  }

  // 4) Potential S-Corp optimization
  if (b.selfEmploymentIncome > 0 && b.businessProfit > 0) {
    const estSavings = Math.round(Math.max(0, (b.businessProfit - 60000) * 0.0765)); // *very* rough
    if (estSavings > 0) {
      total += estSavings;
      recs.push({
        title: 'Evaluate S-Corp (reasonable salary + distributions)',
        why: 'May reduce SE tax on profits above reasonable salary; model with a CPA.',
        estSavings,
      });
    }
  }

  // 5) QBI deduction
  if (b.businessProfit > 0) {
    recs.push({
      title: 'Confirm §199A QBI deduction eligibility',
      why: 'Up to 20% of qualified business income; phase-outs and wage/asset tests apply.',
    });
  }

  // 6) Real-estate levers
  if (b.rentalUnits > 0) {
    recs.push({
      title: 'Explore cost segregation / STR rules',
      why: 'Material participation or STR status can accelerate depreciation; coordinate with a specialist.',
    });
  }

  // 7) Donor-Advised Fund / bunching
  if (b.charitableGiving > 0) {
    recs.push({
      title: 'Use a Donor-Advised Fund and bunch deductions',
      why: 'Front-load multiple years of giving for larger itemized deductions in high-income years.',
    });
  }

  // 8) Advisor fee compression
  if (b.portfolioValue > 0 && b.advisorFeePct > 0.5) {
    const target = 0.30; // 0.30% example target
    const delta = Math.max(0, (b.advisorFeePct - target) / 100);
    const save = Math.round(b.portfolioValue * delta);
    if (save > 0) {
      total += save;
      recs.push({
        title: 'Negotiate/replace advisor to reduce fees',
        why: `Current ~${b.advisorFeePct}% on $${b.portfolioValue.toLocaleString()} — shaving to ~${target}% saves every year.`,
        estSavings: save,
      });
    }
  }

  // 9) Backdoor Roth (if high-income & no pre-tax IRA balance)
  if (b.w2Income + b.selfEmploymentIncome + b.businessProfit > 200000) {
    recs.push({
      title: 'Backdoor Roth IRA (and Mega Backdoor if plan allows)',
      why: 'After-tax contributions + conversions create tax-free growth; mind pro-rata and plan rules.',
    });
  }

  return NextResponse.json({
    recs,
    totalSavings: total || undefined,
  });
}