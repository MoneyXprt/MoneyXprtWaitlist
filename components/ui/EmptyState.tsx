import React from 'react'

/**
 * EmptyState
 * Gentle empty state panel with title, description, and optional action.
 */
export interface EmptyStateProps {
  /** Headline text */
  title: string
  /** Supporting text */
  description?: React.ReactNode
  /** Primary action (button/link) */
  action?: React.ReactNode
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-soft p-6 text-center">
      <div className="text-base font-medium">{title}</div>
      {description ? <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

