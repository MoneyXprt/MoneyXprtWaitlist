import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { PlaybookExportBodySchema } from '@/lib/api/schemas';
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const desired = url.searchParams.get('filename') || '';
    const json = await req.json();
    const parsed = PlaybookExportBodySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 });
    const { playbook } = parsed.data;

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
      const fname = desired && desired.endsWith('.pdf') ? desired : desired ? `${desired}.pdf` : 'playbook.pdf';
      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fname}"`,
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
    const fnameHtml = desired && desired.endsWith('.html') ? desired : desired ? `${desired}.html` : 'playbook.html';
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fnameHtml}"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
