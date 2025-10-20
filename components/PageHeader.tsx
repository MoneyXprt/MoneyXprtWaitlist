import * as React from 'react'

export default function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children ? <div className="flex gap-2">{children}</div> : null}
    </header>
  )
}

