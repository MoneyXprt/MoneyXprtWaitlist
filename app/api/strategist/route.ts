import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { intake } = body || {};

    const prompt = `
      You are MoneyXprt — an AI tax strategist.
      Given this profile, produce a short JSON summary of 3 recommended strategies:
      ${JSON.stringify(intake ?? {}, null, 2)}
    `;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const result = completion.choices[0].message?.content || "No response";
    return NextResponse.json({ url: "/history", result });
  } catch (err: any) {
    console.error("Strategist error:", err);
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

