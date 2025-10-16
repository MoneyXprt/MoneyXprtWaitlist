"use client"
import { useEffect, useState } from 'react'
import { usePlannerStore as usePlanner } from "@/lib/store/planner"

export default function ScenarioClient({ scenarioId }: { scenarioId?: string }) {
  const data = usePlanner(s => s.data)
  const patch = usePlanner(s => s.patch)
  const [score, setScore] = useState<{ score: number|null; breakdown?: any; updatedAt?: string } | null>(null)
  const [scoreErr, setScoreErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/score/latest', { cache: 'no-store' })
        if (!res.ok) throw new Error(`score failed: ${res.status}`)
        const j = await res.json()
        if (alive) setScore(j)
      } catch (e: any) { if (alive) setScoreErr(e?.message ?? String(e)) }
    })()
    return () => { alive = false }
  }, [])

  return (
    <div className="p-6 space-y-3">
      <div className="text-sm text-neutral-600">Scenario {scenarioId ?? "(new)"}</div>
      <button className="border rounded px-3 py-1 text-sm" onClick={() => patch({ lastEditedAt: Date.now() })}>
        Quick edit (updates store)
      </button>
      <div className="text-xs text-neutral-600">
        Latest score: {scoreErr ? <span className="text-red-600">{scoreErr}</span> : (score?.score ?? '—')}
      </div>
      <pre className="text-xs bg-neutral-50 p-3 rounded border overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
