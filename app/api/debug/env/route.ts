export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    flags: {
      has_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
      has_OPENAI: !!process.env.OPENAI_API_KEY,
      model: process.env.MONEYXPRT_MODEL || '(unset)',
    },
  });
}
