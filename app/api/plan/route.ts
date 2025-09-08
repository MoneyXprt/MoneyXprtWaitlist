// app/api/plan/route.ts
import { NextResponse } from 'next/server';
import type { PlanInput } from '@/lib/types';
import { buildRecommendations, getPlanSnapshot } from '@/lib/recommend';

export async function POST(req: Request) {
  const input = (await req.json()) as PlanInput;

  const bullets = buildRecommendations(input);
  const snapshot = getPlanSnapshot(input);

  const apiKey = process.env.OPENAI_API_KEY;
  let narrative = '';

  if (apiKey) {
    // call OpenAI directly via fetch to avoid adding deps
    const prompt = [
      {
        role: 'system',
        content:
          'You are a fiduciary-quality financial & tax planner for high-net-worth clients. ' +
          'Write clear, specific, and actionable guidance. Avoid disclaimers. No medical/legal advice. ' +
          'Assume U.S. tax rules at a high level; be conservative with claims.',
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
          '1) Executive summary (3-6 bullets, tailored)\n' +
          '2) Cash flow & savings (specific % targets and dollar automation)\n' +
          '3) Investments & allocation (public markets + any concentration notes)\n' +
          '4) Tax planning (Roth/backdoor, RSUs, itemize vs standard, entity/side-biz nudge if relevant)\n' +
          '5) Risk/insurance (term life, LTD, umbrella; name gaps)\n' +
          '6) Retirement trajectory (use snapshot inputs; include rough numbers)\n' +
          '7) 90-day action checklist (numbered, concrete)\n' +
          'Keep it concise, tailored to the inputs provided, and avoid asking for PII. Do not invent unknowns.',
      },
    ];

    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // small, fast; swap to gpt-4o for richer output if desired
          messages: prompt,
          temperature: 0.2,
        }),
      });
      const data = await resp.json();
      narrative = data?.choices?.[0]?.message?.content ?? '';
    } catch {
      narrative = '';
    }
  }

  return NextResponse.json({
    recommendations: bullets,
    narrative, // empty string when no API key; UI should handle gracefully
    snapshot,
  });
}