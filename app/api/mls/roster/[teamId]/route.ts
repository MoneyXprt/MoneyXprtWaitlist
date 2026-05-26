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

    // Fetch live ESPN roster
    const espnPlayers = await fetchTeamRoster(espnId);

    const enriched: EnrichedPlayer[] = espnPlayers.map(athlete => {
      // Try salary lookup by player name + team slug
      const salary = findSalaryRecord(athlete.displayName, slug);

      const stats: ESPNPlayerStats = { ...EMPTY_STATS };

      const guaranteedComp = salary?.guaranteedComp ?? 0;
      const budgetCharge = salary?.budgetCharge ?? 0;
      const isDesignatedPlayer = salary?.isDesignatedPlayer ?? false;
      const isTAM = salary?.isTAM ?? false;

      const base: EnrichedPlayer = {
        espnId: athlete.id,
        name: athlete.displayName,
        position: athlete.position?.abbreviation ?? 'MF',
        teamId: slug,
        teamName: '', // filled in by caller if needed
        age: athlete.age,
        nationality: athlete.birthPlace?.country,
        guaranteedComp,
        budgetCharge,
        isDesignatedPlayer,
        isTAM,
        stats,
        valueScore: 0,
        costPerGoalContribution: 0,
      };

      base.valueScore = calculateEnrichedPlayerValueScore(base);
      const gc = base.stats.goals + base.stats.assists;
      base.costPerGoalContribution = gc > 0 ? base.guaranteedComp / gc : 0;

      return base;
    });

    return NextResponse.json({
      teamId: slug,
      espnId,
      players: enriched,
      totalPlayers: enriched.length,
      salaryMatchCount: enriched.filter(p => p.guaranteedComp > 0).length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch roster';
    console.error('[/api/mls/roster]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
