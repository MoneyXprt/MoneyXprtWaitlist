// app/api/plan/route.ts
import { NextResponse } from 'next/server';
import { buildRecommendations } from '@/lib/recommend';
import type { PlanInput } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlanInput;
    const recommendations = buildRecommendations(body);
    return NextResponse.json({ recommendations });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Failed to build recommendations.' },
      { status: 400 }
    );
  }
}