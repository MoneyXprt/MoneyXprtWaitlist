// app/api/plan/route.ts
import { NextResponse } from 'next/server';
import { buildRecommendations, type PlannerInput } from '@/lib/recommend';

export const runtime = 'nodejs'; // keep Node for future libs; switch to 'edge' if desired

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as PlannerInput;

    // very light validation; expand as needed
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const recommendations = buildRecommendations(payload);
    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Failed to build plan' },
      { status: 500 }
    );
  }
}