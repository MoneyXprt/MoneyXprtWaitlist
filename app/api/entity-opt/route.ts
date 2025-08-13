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

  const body = await req.json();
  const facts = {
    w2_income: Number(body.w2 || 0),
    rental_units: Number(body.re_units || 0),
    side_income: Number(body.side_income || 0),
  };

  const prompt = `
Given: ${JSON.stringify(facts)}
Recommend an entity structure and tax tactics for a US taxpayer (W-2 + rentals + side income).
- Show dollar-impact ranges where possible, labeled [Unverified].
- Include pros/cons and steps for the next 90 days.
- No guarantees.`;

  const out = await (await import('@/lib/ai')).chat([
    { role:'system', content: 'You are MoneyXprt. Provide concise, actionable steps with clearly labeled uncertainty.' },
    { role:'user', content: prompt }
  ]);

  const { error } = await admin.from('reports').insert({
    user_id: userData.user.id,
    kind: 'entity_opt',
    input_summary: facts,
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