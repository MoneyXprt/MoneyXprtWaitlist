// app/api/plan/route.ts
import { NextResponse } from 'next/server';
import { getRecommendations, PlannerInput } from '@/lib/planner/engine';

export const runtime = 'nodejs'; // keep it on Node runtime

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<PlannerInput>;

    // very light validation: ensure required shape exists
    const required: (keyof PlannerInput)[] = [
      'filingStatus','state','age','dependents',
      'w2Income','bonusIncome','rsuVestedValue','isoExerciseBargain','selfEmploymentNet',
      'k1Active','k1Passive','capGainsShort','capGainsLong','qualifiedDividends','ordinaryDividends',
      'cryptoGains','interestIncome','otherIncome','rentalUnits','rentalNOI','niitSubject',
      'employee401k','employer401k','hsaContrib','fsaContrib','solo401kSEP','contrib529',
      'mortgageInterest','propertyTax','stateIncomeTaxPaid','charityCash','charityNonCash','medicalExpenses',
      'targetEffRate','retireAge','liquidityNeed12mo','firstName','hdhpEligible'
    ];
    for (const k of required) {
      if (body[k] === undefined) {
        return NextResponse.json(
          { error: `Missing field: ${k}` },
          { status: 400 }
        );
      }
    }

    const recommendations = getRecommendations(body as PlannerInput);
    return NextResponse.json({ recommendations });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unexpected error' },
      { status: 500 }
    );
  }
}