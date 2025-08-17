import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // TODO: call your optimizer here
    return NextResponse.json({
      ok: true,
      message: 'Entity optimizer stub ran',
      input: body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
