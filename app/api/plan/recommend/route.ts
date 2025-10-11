import { NextResponse } from 'next/server';
import { RecommendBodySchema } from '@/lib/api/schemas';
import { recommendStrategies } from '@/lib/api/plan/recommend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = RecommendBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 });
    }
    const result = await recommendStrategies(parsed.data);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
