import 'server-only'

type PlanVersionRow = {
  id: string
  planId: string
  createdAt?: string | Date
  scoreTotal?: any
  scoreBreakdown?: any
  strategies: Array<{ code: string; name?: string }>
  narrative?: any
}

type ProfileRow = {
  id: string
  fullName?: string | null
  entityType?: string | null
}

export async function generatePlaybookPdf(input: {
  profile: ProfileRow | null
  version: PlanVersionRow
  planName?: string
  brand?: { title?: string; footer?: string }
}): Promise<Uint8Array> {
  const { version, profile } = input
  const brandTitle = input.brand?.title ?? 'MoneyXprt — Tax Strategy Playbook'
  const footer = input.brand?.footer ?? 'Educational only — not legal, tax, or investment advice.'

  const { PDFDocument, StandardFonts } = await import('pdf-lib')
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  let page = pdf.addPage([612, 792]) // Letter
  let y = 750
  const left = 50

  const draw = (text: string, size = 12, opts?: { bold?: boolean }) => {
    page.drawText(text, { x: left, y, size, font })
    y -= size + 6
    if (y < 70) {
      page = pdf.addPage([612, 792])
      y = 750
    }
  }

  // Header / Brand
  draw(brandTitle, 18)
  if (input.planName) draw(`Plan: ${input.planName}`, 12)
  if (profile?.fullName) draw(`For: ${profile.fullName}`, 12)
  if (profile?.entityType) draw(`Entity: ${profile.entityType}`, 12)
  draw(`Created: ${new Date(version.createdAt || Date.now()).toLocaleDateString()}`, 12)
  draw('')

  // Summary
  const totalScore = Number(version.scoreTotal ?? 0)
  const stratCount = Array.isArray(version.strategies) ? version.strategies.length : 0
  draw('Summary', 14)
  draw(`• Strategies: ${stratCount}`)
  draw(`• Score Total: ${Number.isFinite(totalScore) ? totalScore.toFixed(2) : '—'}`)
  draw('')

  // Strategies
  draw('Strategies', 14)
  for (const s of version.strategies || []) {
    const name = s.name || s.code
    draw(`• ${name}`, 12)
  }

  // Narrative (optional short summary if present)
  const summary = (version.narrative && typeof version.narrative === 'object') ? (version.narrative.summary as string | undefined) : undefined
  if (summary) {
    draw('')
    draw('Narrative Summary', 14)
    // Split summary into lines reasonably
    const chunks = wrap(summary, 80)
    for (const line of chunks) draw(line, 12)
  }

  // Footer disclaimer on last page
  y = Math.max(y, 40)
  page.drawText(footer, { x: left, y: 40, size: 9, font })

  return pdf.save()
}

function wrap(text: string, width = 80): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w
    if (next.length > width) {
      if (cur) lines.push(cur)
      cur = w
    } else {
      cur = next
    }
  }
  if (cur) lines.push(cur)
  return lines
}

export default generatePlaybookPdf

