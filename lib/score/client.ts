export type RecalcResponse = {
  score: number
  breakdown: { retirement: number; entity: number; deductions: number; investments: number; hygiene: number; advanced: number }
}

export async function recalcScore(): Promise<RecalcResponse> {
  const res = await fetch('/api/score/recalculate', { method: 'POST' })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || 'Failed to recalculate')
  return json
}

