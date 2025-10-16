"use client"
import { useEffect, useState } from "react"

export default function PlaybookClient({ planVersionId }: { planVersionId?: string }) {
  const [data, setData] = useState<any | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!planVersionId) return
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`/api/plan/playbook`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planVersionId }), signal: controller.signal })
        if (!res.ok) throw new Error(`playbook failed: ${res.status}`)
        setData(await res.json())
      } catch (e: any) { setErr(e?.message ?? String(e)) }
    })()
    return () => controller.abort()
  }, [planVersionId])

  const exportPdf = async () => {
    const res = await fetch(`/api/plan/playbook.export`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planVersionId }) })
    if (!res.ok) return alert("Export failed")
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `playbook-${planVersionId ?? "latest"}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  if (!planVersionId) return <div className="p-6 text-sm">No plan selected yet — run Intake/Recommendations first.</div>
  if (err) return <div className="p-6 text-sm text-red-600">{err}</div>
  if (!data) return <div className="p-6 text-sm text-neutral-500">Building playbook…</div>

  return (
    <div className="p-6 space-y-3">
      <button className="border rounded px-3 py-1 text-sm" onClick={exportPdf}>Export Playbook PDF</button>
      <pre className="text-xs bg-neutral-50 p-3 rounded border overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

