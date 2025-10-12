"use client";
import React from 'react'

type Narrative = {
  title: string
  summary: string
  key_actions: Array<{ label: string; reason: string; effort: 'low'|'med'|'high'; est_savings_band?: '$$'|'$$$'|'$$$$' }>
  score_explainer: Array<{ section: 'retirement'|'entity'|'deductions'|'investments'|'hygiene'|'advanced'; what_helped: string[]; what_hurt: string[]; suggestions: string[] }>
  disclaimers: string[]
}

export default function ExplainDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<Narrative | null>(null)

  React.useEffect(() => {
    if (!open) return
    setLoading(true); setError(null)
    // TODO: analytics: explain_open
    fetch('/api/narrative', { method: 'POST' })
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed')
        setData(json)
        // TODO: analytics: explain_success
      })
      .catch((e) => {
        setError(e?.message || 'Failed to load narrative')
        // TODO: analytics: explain_fail
      })
      .finally(() => setLoading(false))
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Score Explainer</h3>
          <button className="rounded px-2 py-1 border text-sm" onClick={onClose}>Close</button>
        </div>

        {loading && (
          <div className="mt-4 space-y-3">
            <div className="h-5 w-2/3 bg-neutral-200 animate-pulse rounded" />
            <div className="h-4 w-full bg-neutral-200 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-neutral-200 animate-pulse rounded" />
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && data && (
          <div className="mt-4 space-y-6">
            <div>
              <h4 className="text-xl font-semibold">{data.title}</h4>
              <p className="text-sm text-neutral-700 mt-2">{data.summary}</p>
            </div>

            <div>
              <h5 className="font-medium mb-2">Key Actions</h5>
              <ul className="space-y-2">
                {data.key_actions.map((a, i) => (
                  <li key={i} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{a.label}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 border">Effort: {a.effort}</span>
                        {a.est_savings_band && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border">{a.est_savings_band}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700 mt-1">{a.reason}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-2">Score Explainer</h5>
              <div className="space-y-3">
                {data.score_explainer.map((s, i) => (
                  <div key={i} className="border rounded p-3">
                    <div className="text-sm font-medium mb-1 capitalize">{s.section}</div>
                    <div className="text-xs text-neutral-600">What helped</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.what_helped.map((w, j) => (
                        <span key={j} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border">{w}</span>
                      ))}
                    </div>
                    <div className="text-xs text-neutral-600 mt-2">What hurt</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.what_hurt.map((w, j) => (
                        <span key={j} className="px-2 py-0.5 rounded bg-red-50 text-red-700 border">{w}</span>
                      ))}
                    </div>
                    <div className="text-xs text-neutral-600 mt-2">Suggestions</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.suggestions.map((w, j) => (
                        <span key={j} className="px-2 py-0.5 rounded bg-neutral-100 border">{w}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!!(data.disclaimers || []).length && (
              <div className="text-xs text-neutral-600 border-t pt-3">
                <div className="font-medium mb-1">Disclaimers</div>
                <ul className="list-disc pl-5 space-y-1">
                  {data.disclaimers.map((d, i) => (<li key={i}>{d}</li>))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

