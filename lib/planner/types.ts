export type FilingStatus = 'single'|'mfj'|'mfs'|'hoh'
export type Profile = {
  state: string
  filingStatus: FilingStatus
  income: { w2?: number; self?: number }
  realEstate?: { count?: number; avgBasis?: number }
}
export type Strategy = { code: string; name?: string; estSavings?: number; summary?: string }
export type ScoreBreakdown = { retirement: number; entity: number; deductions: number; investments: number; realEstate: number; credits: number }
export type ScoreResult = { score: number; breakdown: ScoreBreakdown; notes: string[] }
export type PlannerData = { profile: Profile; strategies: Strategy[]; assumptions?: Record<string, any>; lastEditedAt: number }
export type Snapshot = { id: string; at: number; profile: Profile; strategies: Strategy[]; score?: ScoreResult; totalSavings?: number; narrative?: any }

