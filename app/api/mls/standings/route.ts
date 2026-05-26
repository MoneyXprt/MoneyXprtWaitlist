import { NextResponse } from 'next/server';
import { fetchMLSStandings, getStatValue, ESPN_TEAM_IDS, ESPN_ID_TO_SLUG } from '@/lib/mls/espn';
import { getSalariesForTeam } from '@/lib/mls/salaries';
import { LiveTeamData } from '@/lib/mls/types';

// Revalidate every 5 minutes
export const revalidate = 300;

/** Map ESPN displayName / shortDisplayName to our internal slug */
function espnIdToSlug(espnId: string): string {
  return ESPN_ID_TO_SLUG[espnId] ?? espnId;
}

/** Estimate team revenue by slug — reasonable 2025 approximations */
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

export async function GET() {
  try {
    const entries = await fetchMLSStandings();

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'ESPN standings unavailable' },
        { status: 502 }
      );
    }

    // Build the list of ESPN team IDs we care about
    const featuredIds = new Set(Object.values(ESPN_TEAM_IDS));

    const standings: Array<LiveTeamData & {
      slug: string;
      totalPayroll: number;
      dpCount: number;
      dpCost: number;
    }> = [];

    let position = 1;

    for (const entry of entries) {
      const { team, stats } = entry;
      if (!featuredIds.has(team.id)) continue;

      const slug = espnIdToSlug(team.id);
      const salaries = getSalariesForTeam(slug);
      const totalPayroll = salaries.reduce((s, r) => s + r.guaranteedComp, 0);
      const dpPlayers = salaries.filter(r => r.isDesignatedPlayer);

      const wins = getStatValue(stats, 'wins');
      const losses = getStatValue(stats, 'losses');
      const draws = getStatValue(stats, 'ties');
      const points = getStatValue(stats, 'points');
      const goalsFor = getStatValue(stats, 'pointsFor');
      const goalsAgainst = getStatValue(stats, 'pointsAgainst');

      standings.push({
        espnId: team.id,
        name: team.displayName,
        abbreviation: team.abbreviation,
        wins,
        losses,
        draws,
        points,
        goalsFor,
        goalsAgainst,
        position,
        conference: '', // populated below
        slug,
        totalPayroll,
        dpCount: dpPlayers.length,
        dpCost: dpPlayers.reduce((s, r) => s + r.guaranteedComp, 0),
      });

      position++;
    }

    return NextResponse.json({ standings, lastUpdated: new Date().toISOString() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch standings';
    console.error('[/api/mls/standings]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
