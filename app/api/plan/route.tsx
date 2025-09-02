// app/api/plan/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({
    ok: true,
    message: "Inputs captured. We’ll analyze tax scenarios next.",
    receivedKeys: Object.keys(body),
  });
}