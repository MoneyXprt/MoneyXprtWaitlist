import type { ScoreResult, ScoreBreakdown } from '@/lib/score'

type Trend = 'up' | 'down' | 'same'

function trendOf(delta: number): Trend {
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return 'same'
}

function getSections(b: ScoreBreakdown): Array<keyof ScoreBreakdown> {
  return ['retirement', 'entity', 'deductions', 'investments', 'insurance', 'planning']
}

export function compareScores(prev: ScoreResult, next: ScoreResult) {
  const totalDelta = (next?.score ?? 0) - (prev?.score ?? 0)
  const prevB = prev?.breakdown as ScoreBreakdown
  const nextB = next?.breakdown as ScoreBreakdown
  const categories = getSections(nextB || ({} as ScoreBreakdown)).map((section) => {
    const a = (prevB as any)?.[section] ?? 0
    const b = (nextB as any)?.[section] ?? 0
    const delta = Number(b) - Number(a)
    return { section: String(section), delta, trend: trendOf(delta) as Trend }
  })
  return { totalDelta, categories }
}

export type ScoreDelta = ReturnType<typeof compareScores>
