import { NextResponse } from 'next/server';
import log from '@/lib/logger';
import type { NextRequest } from 'next/server';
import { TaxInfo } from '@/lib/taxStrategies';

export async function POST(request: NextRequest) {
  try {
    const input: TaxInfo = await request.json();
    
    const dummyStrategies = [
      {
        strategyId: "401k",
        title: "Max Out 401(k) Contribution",
        savings: 9500,
        complexity: "Easy" as const,
        requiresCPA: false,
        plainExplanation: "Contributing to your 401(k) reduces your taxable income for both federal and state taxes. At your tax bracket, maxing out your contribution could save significant taxes.",
      },
      {
        strategyId: "hsa",
        title: "Health Savings Account (HSA)",
        savings: 2800,
        complexity: "Easy" as const,
        requiresCPA: false,
        plainExplanation: "HSA contributions are tax-deductible and grow tax-free. Withdrawals for medical expenses are also tax-free.",
      },
      {
        strategyId: "scorp",
        title: "S-Corporation Election for Side Business",
        savings: "varies",
        complexity: "Advanced" as const,
        requiresCPA: true,
        plainExplanation: "Converting your side business to an S-Corp can reduce self-employment taxes on a portion of your business income.",
      },
      {
        strategyId: "qoz",
        title: "Qualified Opportunity Zone Investment",
        savings: "varies",
        complexity: "Advanced" as const,
        requiresCPA: true,
        plainExplanation: "Investing capital gains into QOZ projects can defer and reduce taxes while providing development incentives.",
      }
    ];

    return NextResponse.json({ strategies: dummyStrategies });
  } catch (error) {
    log.error('Error in tax scan endpoint', { error: (error as any)?.message || String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
