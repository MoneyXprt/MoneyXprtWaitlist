import { NextRequest, NextResponse } from 'next/server';
import {
  fetchMLSStandings,
  getStatValue,
  ESPN_TEAM_IDS,
  ESPN_ID_TO_SLUG,
} from '@/lib/mls/espn';
import { getSalariesForTeam } from '@/lib/mls/salaries';
import { calculateTeamFinancialsFromLive } from '@/lib/mls/enriched-analytics';
import { EnrichedPlayer, LiveTeamData, ESPNPlayerStats } from '@/lib/mls/types';

export const revalidate = 300;

/** Static revenue estimates (2025) */
const TEAM_REVENUE: Record<string, number> = {
  'inter-miami': 95_000_000,
  'la-galaxy': 72_000_000,
  lafc: 78_000_000,
  'seattle-sounders': 65_000_000,
  'atlanta-united': 68_000_000,
  'portland-timbers': 55_000_000,
  'fc-cincinnati': 58_000_000,
  'columbus-crew': 52_000_000,
  'new-england-revolution': 60_000_000,
  nycfc: 70_000_000,
};

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

    // Resolve teamId — accept ESPN numeric ID or internal slug
    let espnId = teamId;
    let slug = teamId;

    if (ESPN_TEAM_IDS[teamId]) {
      // provided a slug
      espnId = ESPN_TEAM_IDS[teamId];
      slug = teamId;
    } else if (ESPN_ID_TO_SLUG[teamId]) {
      // provided ESPN numeric id
      espnId = teamId;
      slug = ESPN_ID_TO_SLUG[teamId];
    } else {
      return NextResponse.json({ error: 'Unknown team ID' }, { status: 404 });
    }

    // Fetch live standings to get team record / points
    const entries = await fetchMLSStandings();
    const entry = entries.find(e => e.team.id === espnId);

    let liveTeam: LiveTeamData;
    if (entry) {
      const { team, stats } = entry;
      liveTeam = {
        espnId: team.id,
        name: team.displayName,
        abbreviation: team.abbreviation,
        wins: getStatValue(stats, 'wins'),
        losses: getStatValue(stats, 'losses'),
        draws: getStatValue(stats, 'ties'),
        points: getStatValue(stats, 'points'),
        goalsFor: getStatValue(stats, 'pointsFor'),
        goalsAgainst: getStatValue(stats, 'pointsAgainst'),
        position: 0,
        conference: '',
      };
    } else {
      // Fallback — ESPN could not return data
      liveTeam = {
        espnId,
        name: slug,
        abbreviation: slug.toUpperCase().slice(0, 4),
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        position: 0,
        conference: '',
      };
    }

    // Build enriched players from MLSPA salary data (no ESPN roster for this endpoint — use salaries only)
    const salaries = getSalariesForTeam(slug);
    const enrichedPlayers: EnrichedPlayer[] = salaries.map((s, idx) => ({
      espnId: `salary-${idx}`,
      name: s.name,
      position: 'MF', // unknown without roster call
      teamId: slug,
      teamName: liveTeam.name,
      guaranteedComp: s.guaranteedComp,
      budgetCharge: s.budgetCharge,
      isDesignatedPlayer: s.isDesignatedPlayer,
      isTAM: s.isTAM,
      stats: { ...EMPTY_STATS },
      valueScore: 0,
      costPerGoalContribution: 0,
    }));

    const revenue = TEAM_REVENUE[slug] ?? 60_000_000;
    const allPayrolls = Object.keys(TEAM_REVENUE).map(s => ({
      teamId: ESPN_TEAM_IDS[s] ?? s,
      payroll: getSalariesForTeam(s).reduce((sum, r) => sum + r.guaranteedComp, 0),
    }));

    const financials = calculateTeamFinancialsFromLive(liveTeam, enrichedPlayers, revenue, allPayrolls);

    return NextResponse.json({
      team: liveTeam,
      financials,
      salaryCount: salaries.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch team';
    console.error('[/api/mls/team]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
