"use client"
import { useEffect, useState } from "react"
import { loadSnapshot } from "@/lib/planner/snapshotStore"
import { usePlannerStore } from "@/lib/store/planner"

export default function RecommendationsClient({ profileId, planId }: { profileId?: string; planId?: string }) {
  const [data, setData] = useState<any[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const includeHighRisk = usePlannerStore(s => s.includeHighRisk)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const snapshot = loadSnapshot() ?? {}
        const body = { snapshot, includeHighRisk }
        const res = await fetch(`/api/plan/recommend`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: controller.signal })
        if (!res.ok) throw new Error(`recommend failed: ${res.status}`)
        const j = await res.json()
        setData(j?.items ?? j?.recommendations ?? [])
      } catch (e: any) { setErr(e?.message ?? String(e)) }
    })()
    return () => controller.abort()
  }, [profileId, planId])

  if (err) return <div className="p-6 text-sm text-red-600">{err}</div>
  if (!data) return <div className="p-6 text-sm text-neutral-500">Finding strategies…</div>

  return (
    <div className="p-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.length === 0 && <div className="text-sm text-neutral-500">No strategies yet.</div>}
      {data.map((r: any, i: number) => (
        <div key={i} className="rounded-xl border p-4">
          <div className="font-medium">{r.title ?? r.name ?? `Strategy ${i+1}`}</div>
          <div className="text-xs text-neutral-600 mt-1">{r.subtitle ?? r.category ?? ""}</div>
          {r.estimated_savings && (
            <div className="mt-2 text-sm">Est. savings: ${Number(r.estimated_savings).toLocaleString()}</div>
          )}
        </div>
      ))}
    </div>
  )
}
