import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    const playbook = body?.playbook;
    if (!playbook) return NextResponse.json({ error: 'Missing playbook' }, { status: 400 });

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let y = 750;
    const draw = (text: string, size = 12) => {
      page.drawText(text, { x: 50, y, size, font });
      y -= size + 6;
    };

    draw('Tax Strategy Playbook', 18);
    draw(`Strategies: ${playbook?.summary?.strategies ?? 0}`);
    draw(`Estimated Savings: $${Math.round(playbook?.summary?.estSavings || 0).toLocaleString()}`);
    draw('');
    for (const it of playbook.items || []) {
      draw(`• ${it.name} (${it.category})`, 14);
      const steps = (it.steps || []).slice(0, 5);
      for (const s of steps) draw(`  - ${s.label}${s.due ? ` (due ${s.due})` : ''}`);
      draw('');
      if (y < 100) {
        y = 750;
        pdf.addPage([612, 792]);
      }
    }

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="playbook.pdf"',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

