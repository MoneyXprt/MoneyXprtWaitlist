import { NextResponse } from 'next/server';
import { fetchMLSStandings, getStatValue, ESPN_TEAM_IDS, ESPN_ID_TO_SLUG } from '@/lib/mls/espn';
import { getSalariesForTeam } from '@/lib/mls/salaries';
import { LiveTeamData } from '@/lib/mls/types';

export const revalidate = 300;

// 2025 season static fallback (used when ESPN API is unreachable)
const STATIC_2025: Array<{
  espnId: string; slug: string; name: string; abbreviation: string;
  conference: string; wins: number; losses: number; draws: number;
  points: number; goalsFor: number; goalsAgainst: number;
}> = [
  { espnId:'17362', slug:'inter-miami',             name:'Inter Miami CF',          abbreviation:'MIA',  conference:'Eastern', wins:18, losses:6,  draws:5,  points:59, goalsFor:52, goalsAgainst:28 },
  { espnId:'18858', slug:'fc-cincinnati',            name:'FC Cincinnati',           abbreviation:'CIN',  conference:'Eastern', wins:14, losses:8,  draws:7,  points:49, goalsFor:44, goalsAgainst:33 },
  { espnId:'754',   slug:'columbus-crew',            name:'Columbus Crew',           abbreviation:'CLB',  conference:'Eastern', wins:13, losses:8,  draws:8,  points:47, goalsFor:40, goalsAgainst:31 },
  { espnId:'928',   slug:'new-england-revolution',   name:'New England Revolution',  abbreviation:'NE',   conference:'Eastern', wins:11, losses:9,  draws:9,  points:42, goalsFor:35, goalsAgainst:34 },
  { espnId:'18486', slug:'atlanta-united',           name:'Atlanta United FC',       abbreviation:'ATL',  conference:'Eastern', wins:10, losses:10, draws:9,  points:39, goalsFor:34, goalsAgainst:36 },
  { espnId:'18396', slug:'nycfc',                    name:'New York City FC',        abbreviation:'NYC',  conference:'Eastern', wins:11, losses:9,  draws:7,  points:40, goalsFor:37, goalsAgainst:33 },
  { espnId:'18966', slug:'lafc',                     name:'Los Angeles FC',          abbreviation:'LAFC', conference:'Western', wins:15, losses:6,  draws:8,  points:53, goalsFor:48, goalsAgainst:30 },
  { espnId:'396',   slug:'la-galaxy',                name:'LA Galaxy',               abbreviation:'LA',   conference:'Western', wins:13, losses:8,  draws:8,  points:47, goalsFor:42, goalsAgainst:34 },
  { espnId:'9726',  slug:'seattle-sounders',         name:'Seattle Sounders FC',     abbreviation:'SEA',  conference:'Western', wins:12, losses:9,  draws:8,  points:44, goalsFor:38, goalsAgainst:33 },
  { espnId:'6808',  slug:'portland-timbers',         name:'Portland Timbers',        abbreviation:'POR',  conference:'Western', wins:9,  losses:11, draws:9,  points:36, goalsFor:31, goalsAgainst:38 },
];

function espnIdToSlug(espnId: string): string {
  return ESPN_ID_TO_SLUG[espnId] ?? espnId;
}

function buildStandingsFromStatic(source: typeof STATIC_2025) {
  return source
    .sort((a, b) => b.points - a.points)
    .map((t, i) => {
      const salaries = getSalariesForTeam(t.slug);
      const dpPlayers = salaries.filter(r => r.isDesignatedPlayer);
      return {
        ...t,
        position: i + 1,
        totalPayroll: salaries.reduce((s, r) => s + r.guaranteedComp, 0),
        dpCount: dpPlayers.length,
        dpCost: dpPlayers.reduce((s, r) => s + r.guaranteedComp, 0),
      };
    });
}

export async function GET() {
  // Try ESPN live data first
  try {
    const entries = await fetchMLSStandings();
    if (entries.length > 0) {
      const featuredIds = new Set(Object.values(ESPN_TEAM_IDS));
      const standings: Array<LiveTeamData & { slug: string; totalPayroll: number; dpCount: number; dpCost: number }> = [];
      let position = 1;

      for (const entry of entries) {
        const { team, stats } = entry;
        if (!featuredIds.has(team.id)) continue;
        const slug = espnIdToSlug(team.id);
        const salaries = getSalariesForTeam(slug);
        const dpPlayers = salaries.filter(r => r.isDesignatedPlayer);

        standings.push({
          espnId: team.id,
          name: team.displayName,
          abbreviation: team.abbreviation,
          wins: getStatValue(stats, 'wins'),
          losses: getStatValue(stats, 'losses'),
          draws: getStatValue(stats, 'ties'),
          points: getStatValue(stats, 'points'),
          goalsFor: getStatValue(stats, 'pointsFor'),
          goalsAgainst: getStatValue(stats, 'pointsAgainst'),
          position,
          conference: '',
          slug,
          totalPayroll: salaries.reduce((s, r) => s + r.guaranteedComp, 0),
          dpCount: dpPlayers.length,
          dpCost: dpPlayers.reduce((s, r) => s + r.guaranteedComp, 0),
        });
        position++;
      }

      return NextResponse.json({ standings, lastUpdated: new Date().toISOString(), source: 'espn' });
    }
  } catch (_err) {
    // fall through to static fallback
  }

  // Static 2025 fallback when ESPN is unreachable
  const standings = buildStandingsFromStatic(STATIC_2025);
  return NextResponse.json({ standings, lastUpdated: new Date().toISOString(), source: 'static-2025' });
}
