// app/api/plan/route.ts
import { NextResponse } from 'next/server';
import type { PlanInput } from '@/lib/types';
import { buildRecommendations, getPlanSnapshot } from '@/lib/recommend';

export async function POST(req: Request) {
  const { input, wantNarrative } = (await req.json()) as { input: PlanInput; wantNarrative?: boolean };

  const bullets = buildRecommendations(input);
  const snapshot = getPlanSnapshot(input);

  let narrative = '';
  if (wantNarrative && process.env.OPENAI_API_KEY) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You are a fiduciary-quality financial & tax planner for high-income W-2 clients. ' +
                'Be specific, actionable, and concise. U.S. tax context. Avoid medical/legal disclaimers.',
            },
            {
              role: 'user',
              content:
                `STRUCTURED INPUT (JSON):\n${JSON.stringify(
                  { input, snapshot, ruleEngineBullets: bullets },
                  null,
                  2
                )}\n\n` +
                'TASK: Draft a personalized plan:\n' +
                '1) Executive summary\n2) Cash flow & savings\n3) Investments & allocation\n' +
                '4) Tax planning\n5) Risk/insurance\n6) Retirement trajectory\n7) 90-day checklist',
            },
          ],
        }),
      });
      const data = await resp.json();
      narrative = data?.choices?.[0]?.message?.content ?? '';
    } catch {}
  }

  return NextResponse.json({ recommendations: bullets, snapshot, narrative });
}