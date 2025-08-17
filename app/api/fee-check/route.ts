import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'CSV file is required (field name: file)' }, { status: 400 });
    }
    // TODO: parse CSV + fee math
    const name = (file as any)?.name ?? 'upload.csv';
    return NextResponse.json({ ok: true, message: 'Fee check stub ran', filename: name });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
