// app/api/plan/route.ts
import { NextResponse } from 'next/server';
import { buildRecommendations } from '@/lib/recommend';
import type { PlanInput } from '@/lib/types';

export async function POST(req: Request) {
  const input = (await req.json()) as PlanInput;
  const out = buildRecommendations(input);
  return NextResponse.json(out);
}