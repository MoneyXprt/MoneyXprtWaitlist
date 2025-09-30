import { NextResponse } from 'next/server';
import { entityOptRequest } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { w2, re_units, side_income } = body;

    // Construct the prompt for the entity optimizer
    const prompt = `Please analyze and recommend optimal entity structures for this situation:

Income Sources:
- W2 Income: $${w2 || 0}
- Real Estate Units: ${re_units || 0}
- Side Business Income: $${side_income || 0}

Please provide:
1. Recommended entity structure(s) with rationale
2. Tax implications and potential savings
3. Asset protection considerations
4. State-specific factors to consider
5. Setup and maintenance requirements
6. Next steps and timeline
7. Estimated costs for setup and ongoing maintenance`;

    const response = await entityOptRequest(prompt);
    
    return NextResponse.json({
      ok: true,
      message: response.response,
      sha256: response.requestHash
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
