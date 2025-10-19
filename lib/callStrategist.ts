export type StrategistInput = { userMessage?: string; payload?: any; profileId?: string | null }
export type StrategistResult = { ok: boolean; answer?: string; error?: string; meta?: any }

export async function callStrategist(input: StrategistInput): Promise<StrategistResult> {
  try {
    const res = await fetch('/api/strategist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userMessage: input.userMessage, payload: input.payload, profileId: input.profileId ?? null }),
    })
    const json = await res.json().catch(() => ({})) as any
    if (!res.ok) {
      const msg = json?.error || `Strategist failed (${res.status})`
      return { ok: false, error: String(msg) }
    }
    return { ok: Boolean(json?.ok), answer: json?.answer, error: json?.error, meta: json?.meta }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error' }
  }
}

export default callStrategist
