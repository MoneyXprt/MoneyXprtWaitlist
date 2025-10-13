"use client";

import React from 'react'
import { useSearchParams } from 'next/navigation'

type VersionRow = {
  id: string
  createdAt: string
  scoreTotal: string | number
  scoreBreakdown: Record<string, number>
  strategies: Array<{ code: string; name?: string }>
  narrative?: any
}

export default function PlannerHistoryPage() {
  const params = useSearchParams()
  const planId = params.get('planId') || ''
  const [items, setItems] = React.useState<VersionRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)

  async function load() {
    if (!planId) return
    setLoading(true); setErr(null)
    try {
      const res = await fetch(`/api/plans/${planId}/versions?limit=10`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')
      setItems(json.items || [])
    } catch (e: any) {
      setErr(e?.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [planId])

  async function restore(v: VersionRow) {
    if (!planId) return
    setBusy(v.id)
    try {
      // Re-run with the saved strategies
      const run = await fetch('/api/planner/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, strategies: v.strategies })
      })
      const data = await run.json()
      if (!run.ok) throw new Error(data?.error || 'Failed to run planner')
      // Save as a new plan version
      await fetch(`/api/plans/${planId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreResult: data.scoreResult, strategies: v.strategies, narrative: data.narrative })
      })
      await load()
    } catch (e: any) {
      setErr(e?.message || 'Failed to restore version')
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Plan History</h1>
      {!planId && (
        <div className="text-sm text-neutral-700">Provide a planId in the URL query to view history, e.g. <code>?planId=...</code></div>
      )}
      {err && <div className="text-sm text-red-700">{err}</div>}
      {loading ? (
        <div className="text-sm text-neutral-600">Loading…</div>
      ) : (
        <div className="grid gap-3">
          {items.map((v) => (
            <div key={v.id} className="border rounded p-3 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">Score: {Math.round(Number(v.scoreTotal || 0))}</div>
                  <div className="text-neutral-600">{new Date(v.createdAt).toLocaleString()}</div>
                  <div className="text-neutral-600 text-xs">Strategies: {Array.isArray(v.strategies) ? v.strategies.length : 0}</div>
                </div>
                <button
                  className="rounded px-3 py-1.5 bg-black text-white text-sm disabled:opacity-60"
                  onClick={() => restore(v)}
                  disabled={busy === v.id}
                >
                  {busy === v.id ? 'Restoring…' : 'Restore this version'}
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && planId && (
            <div className="text-sm text-neutral-600">No history yet for this plan.</div>
          )}
        </div>
      )}
    </main>
  )
}

