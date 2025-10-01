import { NextResponse } from 'next/server';
import type { TaxInfo } from '@/lib/taxStrategies';
import { analyzeTaxStrategies } from '@/lib/taxStrategies';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taxInfo: TaxInfo = body;

    if (!taxInfo?.income || !taxInfo?.filingStatus || !taxInfo?.state) {
      return NextResponse.json(
        { error: 'Missing required tax information' },
        { status: 400 }
      );
    }

    const strategies = await analyzeTaxStrategies(taxInfo);

    return NextResponse.json({
      strategies,
      summary: {
        potentialSavings: strategies.reduce((acc, strategy) => {
          if (typeof strategy.savings === 'number') {
            return acc + strategy.savings;
          }
          return acc;
        }, 0),
        numStrategies: strategies.length,
        requiresCPA: strategies.some(s => s.requiresCPA)
      }
    });
  } catch (error) {
    console.error('Error analyzing tax strategies:', error);
    return NextResponse.json(
      { error: 'Failed to analyze tax strategies' },
      { status: 500 }
    );
  }
}