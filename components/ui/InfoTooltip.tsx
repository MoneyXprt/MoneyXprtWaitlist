"use client"
import React from 'react'

/**
 * InfoTooltip
 * Minimal dependency-free tooltip used for tiny “What this means” explainers.
 * Appears on hover and keyboard focus. Use concise, plain-English content.
 */
export interface InfoTooltipProps {
  /** Trigger content (defaults to a tiny link) */
  children?: React.ReactNode
  /** Tooltip text content (one short sentence) */
  content: string
}

export default function InfoTooltip({ children, content }: InfoTooltipProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="text-xs underline underline-offset-2 text-emerald-700 focus-visible:ring-2 ring-emerald-600 rounded-sm"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-describedby={open ? 'infotp' : undefined}
      >
        {children || 'What this means'}
      </button>
      {open && (
        <div
          role="tooltip"
          id="infotp"
          className="absolute z-50 mt-1 max-w-xs rounded-md border bg-popover text-popover-foreground text-xs px-3 py-2 shadow-md"
        >
          {content}
        </div>
      )}
    </span>
  )
}

