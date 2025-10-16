import React from 'react'

/**
 * PageShell
 * Accessible page wrapper that constrains width, adds padding, and renders
 * an optional title/description header region.
 */
export interface PageShellProps {
  /** Main page title (h1). Hidden if not provided. */
  title?: string
  /** Optional short description under the title. */
  description?: React.ReactNode
  /** Optional actions rendered to the right of title/description. */
  actions?: React.ReactNode
  /** Page content */
  children: React.ReactNode
}

export default function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <div className="container py-6">
      {(title || description || actions) && (
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <h1 className="text-xl sm:text-2xl font-semibold leading-tight">{title}</h1> : null}
            {description ? <p className="text-sm text-neutral-600 dark:text-neutral-300">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      )}
      <main role="main">{children}</main>
    </div>
  )
}

