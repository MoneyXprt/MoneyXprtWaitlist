// app/api/plan/route.ts
import { NextResponse } from 'next/server';
import { buildRecommendations } from '@/lib/recommend';
import type { PlanInput } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlanInput;
    const out = buildRecommendations(body);
    return NextResponse.json(out);
  } catch (e: any) {
    return new NextResponse(e?.message ?? 'Bad request', { status: 400 });
  }
}