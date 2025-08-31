import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get('next') || '/';
  // If you pass ?next=/app from your auth flow, you’ll land there
  return NextResponse.redirect(new URL(next, req.url));
}