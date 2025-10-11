// app/api/ask/route.ts
import { NextResponse } from 'next/server';
import { assertEnv, env } from '@/lib/config/env';
import type { PlanInput } from '@/lib/types';
import { buildRecommendations, getPlanSnapshot } from '@/lib/recommend';

export async function POST(req: Request) {
  // Only require OpenAI here; other routes can assert what they need
  assertEnv(["OPENAI_API_KEY"]);
  const { input, question } = (await req.json()) as { input: PlanInput; question: string };
  const apiKey = env.server.OPENAI_API_KEY;

  const bullets = buildRecommendations(input);
  const snapshot = getPlanSnapshot(input);

  if (!apiKey) {
    // graceful fallback: echo deterministic context with a helpful note
    return NextResponse.json({
      answer:
        'AI follow-ups are disabled (no API key). Here’s context you can use:\n' +
        JSON.stringify({ snapshot, bullets }, null, 2),
    });
  }

  const prompt = [
    {
      role: 'system',
      content:
        'You are a fiduciary-quality financial & tax planner. Be specific, concise, actionable. ' +
        'Use only the provided context; do not request SSNs or sensitive identifiers.',
    },
    {
      role: 'user',
      content:
        `USER QUESTION: ${question}\n\n` +
        `CURRENT CONTEXT (JSON):\n${JSON.stringify({ input, snapshot, bullets }, null, 2)}\n\n` +
        'Answer directly in 1–3 short sections with numbered steps where helpful.',
    },
  ];

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: prompt, temperature: 0.2 }),
  });
  const data = await resp.json();
  const answer = data?.choices?.[0]?.message?.content ?? 'Sorry, I could not generate an answer.';
  return NextResponse.json({ answer });
}
