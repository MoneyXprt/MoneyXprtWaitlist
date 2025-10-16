import React from 'react'

/**
 * SectionCard
 * Rounded card section with title, subtitle, optional aside area (top-right), and footer slot.
 */
export interface SectionCardProps {
  /** Section title (h2 by default) */
  title?: React.ReactNode
  /** Optional short subtitle */
  subtitle?: React.ReactNode
  /** Optional aside container placed to the right of the title block */
  aside?: React.ReactNode
  /** Content */
  children?: React.ReactNode
  /** Optional footer slot (e.g., actions) */
  footer?: React.ReactNode
}

export default function SectionCard({ title, subtitle, aside, children, footer }: SectionCardProps) {
  return (
    <section className="bg-card text-card-foreground border rounded-2xl shadow-soft">
      {(title || subtitle || aside) && (
        <div className="px-5 py-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <h2 className="text-lg font-semibold leading-tight">{title}</h2> : null}
            {subtitle ? <p className="text-sm text-neutral-600 dark:text-neutral-300">{subtitle}</p> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      )}
      {children ? <div className="px-5 py-4">{children}</div> : null}
      {footer ? <div className="px-5 py-3 border-t bg-neutral-50/60 dark:bg-neutral-900/30 rounded-b-2xl">{footer}</div> : null}
    </section>
  )
}

