import React from 'react'

/**
 * Toolbar
 * Responsive top toolbar with left/right slots and optional role="toolbar".
 */
export interface ToolbarProps {
  /** Left content (e.g., title, filters) */
  left?: React.ReactNode
  /** Right content (e.g., primary actions) */
  right?: React.ReactNode
  /** Accessible label for the toolbar region */
  'aria-label'?: string
}

export default function Toolbar(props: ToolbarProps) {
  const { left, right, 'aria-label': ariaLabel } = props
  return (
    <div role="toolbar" aria-label={ariaLabel} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">{left}</div>
      {right ? <div className="shrink-0 flex items-center gap-2">{right}</div> : null}
    </div>
  )
}

