import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    const playbook = body?.playbook;
    if (!playbook) return NextResponse.json({ error: 'Missing playbook' }, { status: 400 });

    // Prefer PDF (pdf-lib available). Otherwise, fall back to HTML.
    try {
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      let page = pdf.addPage([612, 792]);
      let y = 750;
      const draw = (text: string, size = 12) => {
        page.drawText(text, { x: 50, y, size, font });
        y -= size + 6;
        if (y < 60) {
          page = pdf.addPage([612, 792]);
          y = 750;
        }
      };

      draw('Tax Strategy Playbook', 18);
      draw(`Strategies: ${playbook.summary?.count ?? 0}`);
      draw(`Estimated Savings: $${Math.round(playbook.summary?.totalSavings || 0).toLocaleString()}`);
      draw(`Year: ${playbook.summary?.year ?? ''}`);
      draw('');
      for (const it of playbook.items || []) {
        draw(`• ${it.name}`, 14);
        for (const s of (it.steps || []).slice(0, 8)) draw(`  - ${s}`);
        draw('');
      }

      const bytes = await pdf.save();
      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="playbook.pdf"',
        },
      });
    } catch {}

    // HTML fallback
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Playbook</title></head><body>
      <h1>Tax Strategy Playbook</h1>
      <p><b>Strategies:</b> ${playbook.summary?.count ?? 0}</p>
      <p><b>Estimated Savings:</b> $${Math.round(playbook.summary?.totalSavings || 0).toLocaleString()}</p>
      <p><b>Year:</b> ${playbook.summary?.year ?? ''}</p>
      ${(playbook.items || [])
        .map((it: any) => `<h3>${it.name}</h3><ul>${(it.steps || []).map((s: string) => `<li>${s}</li>`).join('')}</ul>`)
        .join('')}
    </body></html>`;
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'attachment; filename="playbook.html"',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

