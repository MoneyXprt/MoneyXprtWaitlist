import * as React from 'react'

export default function EmptyState({
  title,
  subtitle,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string
  subtitle?: string
  actionHref?: string
  actionLabel?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border p-6 bg-white flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <div className="font-medium">{title}</div>
        </div>
        {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
      </div>
      {actionHref && actionLabel && (
        <a href={actionHref} className="btn">{actionLabel}</a>
      )}
    </div>
  )
}

