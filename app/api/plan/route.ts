import { NextResponse } from 'next/server';
import type { PlanInput } from '@/lib/types';
import { buildRecommendations } from '@/lib/recommend';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlanInput;
    const recommendations = buildRecommendations(body);
    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Failed to build plan' },
      { status: 400 }
    );
  }
}