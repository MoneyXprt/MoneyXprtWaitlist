import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PlaybookBodySchema } from '@/lib/api/schemas';
import { buildPlaybook } from '@/lib/api/plan/playbook';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = PlaybookBodySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 });
    const playbook = await buildPlaybook(parsed.data);
    return NextResponse.json(playbook);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
