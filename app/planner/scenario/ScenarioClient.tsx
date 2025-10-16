"use client"
import { usePlannerStore as usePlanner } from "@/lib/store/planner"

export default function ScenarioClient({ scenarioId }: { scenarioId?: string }) {
  const data = usePlanner(s => s.data)
  const patch = usePlanner(s => s.patch)

  return (
    <div className="p-6 space-y-3">
      <div className="text-sm text-neutral-600">Scenario {scenarioId ?? "(new)"}</div>
      <button className="border rounded px-3 py-1 text-sm" onClick={() => patch({ lastEditedAt: Date.now() })}>
        Quick edit (updates store)
      </button>
      <pre className="text-xs bg-neutral-50 p-3 rounded border overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

