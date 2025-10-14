import 'server-only'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

type PlanVersionRow = {
  id: string
  planId: string
  createdAt?: string | Date
  scoreTotal?: any
  scoreBreakdown?: Record<string, number> | any
  strategies: Array<{ code: string; name?: string; rationale?: string; effort?: 'low'|'med'|'high'; est_savings_band?: '$'|'$$'|'$$$'|'$$$$' }>
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
  const brandTitle = input.brand?.title ?? 'MoneyXprt Playbook'
  const footer = input.brand?.footer ?? 'Educational only — not legal, tax, or investment advice.'

  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  // Colors
  const NAVY = rgb(0.14, 0.23, 0.38)
  const GOLD = rgb(0.85, 0.67, 0.29)
  const WHITE = rgb(1, 1, 1)

  // Page + layout
  const PAGE = { width: 612, height: 792 }
  const MARGINS = { left: 54, right: 54, top: 72, bottom: 60 }
  const USABLE_HEIGHT = PAGE.height - MARGINS.top - MARGINS.bottom
  const ONE_THIRD = USABLE_HEIGHT / 3

  let page = pdf.addPage([PAGE.width, PAGE.height])
  let y = PAGE.height - MARGINS.top

  function newPage(withHeader = true) {
    page = pdf.addPage([PAGE.width, PAGE.height])
    y = PAGE.height - MARGINS.top
    if (withHeader) drawHeader()
  }

  function drawHeader() {
    page.drawRectangle({ x: 0, y: PAGE.height - 40, width: PAGE.width, height: 40, color: NAVY })
    page.drawText(brandTitle, { x: MARGINS.left, y: PAGE.height - 28, size: 14, color: WHITE, font })
    const dateStr = new Date(version.createdAt || Date.now()).toLocaleDateString()
    page.drawText(dateStr, { x: PAGE.width - MARGINS.right - 100, y: PAGE.height - 28, size: 10, color: WHITE, font })
  }

  function ensureSpace(linesNeeded = 1, lineHeight = 16) {
    if (y - linesNeeded * lineHeight < MARGINS.bottom + 20) newPage()
  }

  function isOverOneThirdFilled() {
    const filled = PAGE.height - MARGINS.top - y
    return filled > ONE_THIRD
  }

  function startSection(title: string) {
    if (isOverOneThirdFilled()) newPage()
    // Subheader
    page.drawText(title, { x: MARGINS.left, y, size: 16, color: NAVY, font })
    y -= 8
    page.drawRectangle({ x: MARGINS.left, y: y - 2, width: PAGE.width - MARGINS.left - MARGINS.right, height: 2, color: GOLD })
    y -= 14
  }

  function drawText(text: string, size = 12, color = undefined as any) {
    const maxWidth = PAGE.width - MARGINS.left - MARGINS.right
    const lines = wrapText(text, size, maxWidth)
    for (const line of lines) {
      ensureSpace(1, size + 4)
      page.drawText(line, { x: MARGINS.left, y, size, font, color })
      y -= size + 4
    }
  }

  function wrapText(text: string, size: number, maxWidth: number) {
    const words = (text || '').split(/\s+/)
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      const candidate = cur ? cur + ' ' + w : w
      const width = font.widthOfTextAtSize(candidate, size)
      if (width > maxWidth && cur) {
        lines.push(cur)
        cur = w
      } else {
        cur = candidate
      }
    }
    if (cur) lines.push(cur)
    return lines
  }

  function drawKeyVal(label: string, value: string) {
    ensureSpace(1)
    page.drawText(label + ': ', { x: MARGINS.left, y, size: 12, font, color: NAVY })
    page.drawText(value, { x: MARGINS.left + 80, y, size: 12, font })
    y -= 18
  }

  function drawBarChart(data: Record<string, number>) {
    const entries = Object.entries(data || {})
    if (!entries.length) return
    const total = entries.reduce((a, [, v]) => a + (Number(v) || 0), 0) || 1
    const maxWidth = PAGE.width - MARGINS.left - MARGINS.right - 120
    for (const [k, v] of entries) {
      ensureSpace(1)
      const pct = (Number(v) || 0) / total
      const barW = Math.max(4, Math.round(maxWidth * pct))
      // Label
      page.drawText(k, { x: MARGINS.left, y, size: 11, font })
      // Bar
      page.drawRectangle({ x: MARGINS.left + 110, y: y - 2, width: barW, height: 10, color: GOLD })
      page.drawText(`${Math.round(pct * 100)}%`, { x: MARGINS.left + 110 + barW + 8, y, size: 10, font, color: NAVY })
      y -= 18
    }
  }

  function bandToDollars(band?: '$'|'$$'|'$$$'|'$$$$') {
    if (!band) return ''
    return '$'.repeat(band.length)
  }

  // ========== Cover Page ==========
  // Cover with brand band
  page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: WHITE })
  page.drawRectangle({ x: 0, y: PAGE.height - 120, width: PAGE.width, height: 120, color: NAVY })
  page.drawText('MoneyXprt Playbook', { x: MARGINS.left, y: PAGE.height - 80, size: 28, font, color: WHITE })
  let cy = PAGE.height - 160
  const coverLine = (t: string, size = 14) => {
    page.drawText(t, { x: MARGINS.left, y: cy, size, font, color: NAVY })
    cy -= size + 10
  }
  coverLine(`Plan: ${input.planName || 'Untitled Plan'}`)
  if (profile?.fullName) coverLine(`User: ${profile.fullName}`)
  coverLine(`Date: ${new Date(version.createdAt || Date.now()).toLocaleDateString()}`)
  cy -= 8
  const disclaimer = 'Educational only — not legal, tax, or investment advice.'
  page.drawText(disclaimer, { x: MARGINS.left, y: cy, size: 11, font, color: NAVY })

  // Header for subsequent pages
  newPage(true)

  // ========== Summary ==========
  startSection('Summary')
  const narrativeSummary: string | undefined = (version?.narrative && typeof version.narrative === 'object') ? version.narrative.summary : undefined
  if (narrativeSummary) drawText(narrativeSummary, 12)

  // Score breakdown
  if (version.scoreBreakdown && typeof version.scoreBreakdown === 'object') {
    y -= 6
    page.drawText('Keep‑More Score Breakdown', { x: MARGINS.left, y, size: 13, font, color: NAVY })
    y -= 16
    drawBarChart(version.scoreBreakdown as Record<string, number>)
  }

  // ========== Strategy Cards ==========
  startSection('Strategies')
  for (const s of version.strategies || []) {
    ensureSpace(3)
    // Card title
    page.drawRectangle({ x: MARGINS.left, y: y - 4, width: PAGE.width - MARGINS.left - MARGINS.right, height: 28, color: rgb(0.97, 0.97, 0.97) })
    page.drawText(s.name || s.code, { x: MARGINS.left + 8, y: y + 2, size: 13, font, color: NAVY })
    y -= 34
    if (s.rationale) drawText(`Why: ${s.rationale}`, 11)
    const metaBits: string[] = []
    if (s.effort) metaBits.push(`Effort: ${s.effort}`)
    if (s.est_savings_band) metaBits.push(`Impact: ${bandToDollars(s.est_savings_band)}`)
    if (metaBits.length) drawText(metaBits.join('   '), 11)
    y -= 6
    if (isOverOneThirdFilled()) newPage()
  }

  // ========== Next Steps / Disclaimer ==========
  startSection('Next Steps')
  const actions = Array.isArray(version?.narrative?.key_actions) ? version.narrative.key_actions : []
  for (const a of actions) {
    const line = `${a?.label ? '• ' + a.label : '• Action'}${a?.effort ? `  (${a.effort})` : ''}${a?.est_savings_band ? `  [${bandToDollars(a.est_savings_band)}]` : ''}`
    drawText(line, 12)
    if (a?.reason) drawText(`  - ${a.reason}`, 11)
  }
  y -= 8
  drawText('Disclaimer', 13, NAVY)
  const disclaimers: string[] = Array.isArray(version?.narrative?.disclaimers) ? version.narrative.disclaimers : []
  const footerLine = footer
  if (!disclaimers.includes(footerLine)) disclaimers.push(footerLine)
  for (const d of disclaimers) drawText(`• ${d}`, 10)

  return pdf.save()
}

export default generatePlaybookPdf

// Node-safe builder wrapper matching API usage
type ScoreBreakdown = {
  retirement: number; entity: number; deductions: number; investments: number; hygiene: number; advanced: number;
}
interface Strategy {
  code: string; name?: string; rationale?: string; effort?: 'low'|'med'|'high'; est_savings_band?: '$'|'$$'|'$$$'|'$$$$'
}
interface PlanVersionPayload {
  score_total?: number;
  score_breakdown?: ScoreBreakdown | Record<string, number>;
  strategies?: Strategy[];
  narrative?: any;
  created_at?: string;
  plan_name?: string;
  user_name?: string;
}

export async function buildPlaybookPDF({ plan }: { plan: PlanVersionPayload }): Promise<Uint8Array> {
  const version: PlanVersionRow = {
    id: 'plan-version',
    planId: 'plan',
    createdAt: plan.created_at || new Date().toISOString(),
    scoreTotal: plan.score_total,
    scoreBreakdown: plan.score_breakdown as any,
    strategies: (plan.strategies || []) as any,
    narrative: plan.narrative,
  }
  const profile: ProfileRow | null = {
    id: 'user',
    fullName: plan.user_name || null,
    entityType: null,
  }
  return generatePlaybookPdf({ profile, version, planName: plan.plan_name || 'MoneyXprt Playbook' })
}
