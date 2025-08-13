import { NextRequest, NextResponse } from 'next/server';
import { sbAdmin } from '@/lib/supabase';
import { chat } from '@/lib/ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-supabase-auth');
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const admin = sbAdmin();
  const { data: userData, error: uerr } = await admin.auth.getUser(token);
  if (uerr || !userData?.user) return NextResponse.json({ error: 'Invalid auth' }, { status: 401 });

  const { prompt } = await req.json();
  if (!prompt?.trim()) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

  const systemPrompt = `You are MoneyXprt, an AI financial advisor specializing in tax optimization for high-income earners.
Focus on:
1) Tax reduction strategies and missed deductions
2) Entity structure optimization for W-2 + real estate investors  
3) Specific actionable recommendations
Label any estimates or assumptions as [Unverified]. Keep responses concise and practical.`;

  const out = await (await import('@/lib/ai')).chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ]);

  const { error } = await admin.from('reports').insert({
    user_id: userData.user.id,
    kind: 'tax_scan',
    input_summary: { prompt: prompt.slice(0, 100) },
    raw_output: out
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, message: out });
}

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      response: result.response,
      metadata: {
        requestHash: result.requestHash,
        hasPII: result.hasPII,
        sanitized: result.sanitized
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}