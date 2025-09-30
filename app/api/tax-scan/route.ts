import { NextResponse } from 'next/server';
import { taxScanRequest } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'PDF is required (field name: file)' }, { status: 400 });
    }
    
    // In production, we would OCR and extract data from the PDF
    // For now, we'll send a comprehensive analysis request
    const prompt = `Please provide comprehensive tax optimization strategies focusing on:

1. Entity Structure Optimization
   - LLC/S-Corp analysis for business income
   - Real estate holding company considerations
   - Professional service corporation options

2. Tax-Advantaged Account Maximization
   - Traditional/Roth strategy based on income levels
   - Backdoor and Mega Backdoor Roth opportunities
   - HSA/FSA optimization strategies
   - Solo 401(k) and SEP IRA analysis

3. Real Estate Tax Strategies
   - Cost segregation opportunities
   - 1031 exchange evaluation
   - QBI deduction optimization
   - Short-term vs long-term rental considerations

4. Investment Tax Optimization
   - Tax-loss harvesting opportunities
   - Asset location optimization across accounts
   - Tax-efficient fund selection criteria
   - Capital gains management strategies

5. Estate Planning Integration
   - Trust structure recommendations
   - Gifting strategies and annual limits
   - Legacy planning considerations
   - Generation-skipping strategies

6. Risk Management
   - Asset protection structures
   - Insurance integration with tax planning
   - Liability mitigation strategies

Please provide specific action items with:
- Estimated financial impact [Estimated]
- Implementation timeline
- Required professional assistance
- Compliance requirements
- Ongoing maintenance needs`;

    const response = await taxScanRequest(prompt);
    
    return NextResponse.json({
      ok: true,
      message: response.response,
      sha256: response.requestHash,
      filename: (file as any)?.name ?? 'upload.pdf'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
