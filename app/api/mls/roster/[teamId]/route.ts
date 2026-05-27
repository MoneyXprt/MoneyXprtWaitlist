import { NextRequest, NextResponse } from 'next/server';
import {
  fetchTeamRoster,
  ESPN_TEAM_IDS,
  ESPN_ID_TO_SLUG,
} from '@/lib/mls/espn';
import { findSalaryRecord } from '@/lib/mls/salaries';
import { calculateEnrichedPlayerValueScore } from '@/lib/mls/enriched-analytics';
import { EnrichedPlayer, ESPNPlayerStats } from '@/lib/mls/types';

// Rosters change infrequently — cache for 1 hour
export const revalidate = 3600;

const EMPTY_STATS: ESPNPlayerStats = {
  goals: 0,
  assists: 0,
  gamesPlayed: 0,
  minutesPlayed: 0,
  shots: 0,
  shotsOnTarget: 0,
  passAccuracy: 0,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;

    // Resolve to ESPN numeric ID and internal slug
    let espnId: string;
    let slug: string;

    if (ESPN_TEAM_IDS[teamId]) {
      espnId = ESPN_TEAM_IDS[teamId];
      slug = teamId;
    } else if (ESPN_ID_TO_SLUG[teamId]) {
      espnId = teamId;
      slug = ESPN_ID_TO_SLUG[teamId];
    } else {
      return NextResponse.json({ error: 'Unknown team ID' }, { status: 404 });
    }

    // Try ESPN roster; fall back to salary data if unreachable or empty
    const espnPlayers = await fetchTeamRoster(espnId);
    let source = 'espn';
    let enriched: EnrichedPlayer[] = [];

    if (espnPlayers.length > 0) {
      enriched = espnPlayers.map(athlete => {
        const salary = findSalaryRecord(athlete.displayName, slug);
        const base: EnrichedPlayer = {
          espnId: athlete.id,
          name: athlete.displayName,
          position: athlete.position?.abbreviation ?? 'MF',
          teamId: slug,
          teamName: '',
          age: athlete.age,
          nationality: athlete.birthPlace?.country,
          guaranteedComp: salary?.guaranteedComp ?? 0,
          budgetCharge: salary?.budgetCharge ?? 0,
          isDesignatedPlayer: salary?.isDesignatedPlayer ?? false,
          isTAM: salary?.isTAM ?? false,
          stats: { ...EMPTY_STATS },
          valueScore: 0,
          costPerGoalContribution: 0,
        };
        base.valueScore = calculateEnrichedPlayerValueScore(base);
        return base;
      });
    } else {
      // ESPN unavailable — build roster from 2025 MLSPA salary records
      source = 'static-2025';
      const { getSalariesForTeam } = await import('@/lib/mls/salaries');
      const salaries = getSalariesForTeam(slug);
      enriched = salaries.map((s, idx) => {
        const base: EnrichedPlayer = {
          espnId: `salary-${idx}`,
          name: s.name,
          position: s.isDesignatedPlayer ? 'FW' : s.isTAM ? 'MF' : 'MF',
          teamId: slug,
          teamName: '',
          guaranteedComp: s.guaranteedComp,
          budgetCharge: s.budgetCharge,
          isDesignatedPlayer: s.isDesignatedPlayer,
          isTAM: s.isTAM,
          stats: { ...EMPTY_STATS },
          valueScore: 0,
          costPerGoalContribution: 0,
        };
        base.valueScore = calculateEnrichedPlayerValueScore(base);
        return base;
      });
    }

    return NextResponse.json({
      teamId: slug,
      espnId,
      players: enriched,
      totalPlayers: enriched.length,
      salaryMatchCount: enriched.filter(p => p.guaranteedComp > 0).length,
      source,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch roster';
    console.error('[/api/mls/roster]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
