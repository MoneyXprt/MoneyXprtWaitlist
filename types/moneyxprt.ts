export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh'

export type MoneyXprtIntake = {
  filingStatus?: FilingStatus
  residence?: { state?: string; fullYearResident?: boolean }
  employment?: Array<{ w2?: number; self?: number; entity?: string }>
  itemized?: boolean
  goals?: string[]
}

function compact<T = any>(obj: T): T {
  if (Array.isArray(obj)) {
    const arr = obj.map(compact).filter((v) =>
      !(v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && v && Object.keys(v as any).length === 0))
    ) as any
    return arr as T
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(obj as any)) {
      const c = compact(v)
      const isEmptyObj = typeof c === 'object' && c && !Array.isArray(c) && Object.keys(c).length === 0
      const isEmptyArr = Array.isArray(c) && c.length === 0
      const isEmptyStr = typeof c === 'string' && c.trim() === ''
      if (c !== undefined && c !== null && !isEmptyObj && !isEmptyArr && !isEmptyStr) out[k] = c
    }
    return out as any
  }
  return obj
}

/**
 * Convert arbitrary form state into a compact JSON payload for /api/strategist.
 * This is intentionally lenient; it preserves known keys and removes empty values.
 */
export function toStrategistPayload(formState: any): any {
  const fx: MoneyXprtIntake = {
    filingStatus: formState?.filingStatus,
    residence: {
      state: formState?.state || formState?.residence?.state,
      fullYearResident: formState?.residence?.fullYearResident,
    },
    employment: formState?.employment || (
      formState?.w2 != null || formState?.self != null || formState?.entity
        ? [{ w2: formState?.w2, self: formState?.self, entity: formState?.entity }]
        : undefined
    ),
    itemized: formState?.itemized,
    goals: formState?.goals,
  }
  return compact(fx)
}

