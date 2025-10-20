import * as React from 'react'

export default function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

