"use client"
import React from 'react'
import InfoTooltip from '@/components/ui/InfoTooltip'
import { TERMS, TEXT_TO_KEY } from '@/lib/glossary/terms'

/**
 * Glossy
 * Auto-detects known tax terms in a short piece of text and appends a tiny
 * “What this means” tooltip link next to the matched term.
 */
export default function Glossy({ children }: { children: React.ReactNode }) {
  const text = typeof children === 'string' ? children : React.Children.toArray(children).join(' ')
  const parts: React.ReactNode[] = []
  let cursor = 0
  const hay = text

  // Find first match among all allowed terms; simple left-to-right parse
  function nextMatch(start: number): { start: number; end: number; key: keyof typeof TERMS } | null {
    let best: { start: number; end: number; key: keyof typeof TERMS } | null = null
    for (const { re, key } of TEXT_TO_KEY) {
      re.lastIndex = start
      const m = re.exec(hay)
      if (m && (best === null || m.index < best.start)) {
        best = { start: m.index, end: m.index + m[0].length, key }
      }
    }
    return best
  }

  while (cursor < hay.length) {
    const m = nextMatch(cursor)
    if (!m) { parts.push(hay.slice(cursor)); break }
    if (m.start > cursor) parts.push(hay.slice(cursor, m.start))
    const seg = hay.slice(m.start, m.end)
    const term = TERMS[m.key]
    parts.push(
      <span key={`${m.key}-${m.start}`} className="inline-flex items-center gap-2">
        <span>{seg}</span>
        <InfoTooltip content={term.oneLiner} />
      </span>
    )
    cursor = m.end
  }

  return <>{parts}</>
}

