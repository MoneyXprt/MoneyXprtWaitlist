import type { StrategyRule } from './types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export type RoadmapStep = { month: string; action: string; owner: 'You' };
export type Roadmap = { next12mo: RoadmapStep[]; fiveYear: { year: number; theme: string }[] };

export function buildRoadmap(rule: StrategyRule): Roadmap {
  const now = new Date();
  const startIdx = now.getMonth(); // 0-11
  const hints = Array.isArray(rule.timelineHints) ? rule.timelineHints : [];

  const next12mo: RoadmapStep[] = hints.map((hint, i) => {
    const m = MONTHS[(startIdx + i) % 12];
    return { month: m, action: String(hint), owner: 'You' };
  });

  const fiveYear = [
    { year: 1, theme: rule.title || 'Execute plan' },
    { year: 3, theme: 'Optimize & scale' },
  ];

  return { next12mo, fiveYear };
}

