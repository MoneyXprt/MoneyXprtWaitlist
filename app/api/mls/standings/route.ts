import { NextResponse } from 'next/server';
import { fetchMLSStandings, getStatValue, ESPN_TEAM_IDS, ESPN_ID_TO_SLUG } from '@/lib/mls/espn';
import { getSalariesForTeam } from '@/lib/mls/salaries';
import { LiveTeamData } from '@/lib/mls/types';

export const revalidate = 300;

// 2026 season static fallback (used when ESPN API is unreachable)
const STATIC_2026: Array<{
  espnId: string; slug: string; name: string; abbreviation: string;
  conference: string; wins: number; losses: number; draws: number;
  points: number; goalsFor: number; goalsAgainst: number;
}> = [
  { espnId:'17362', slug:'inter-miami',             name:'Inter Miami CF',          abbreviation:'MIA',  conference:'Eastern', wins:16, losses:5,  draws:4,  points:52, goalsFor:48, goalsAgainst:22 },
  { espnId:'18858', slug:'fc-cincinnati',            name:'FC Cincinnati',           abbreviation:'CIN',  conference:'Eastern', wins:13, losses:7,  draws:5,  points:44, goalsFor:41, goalsAgainst:30 },
  { espnId:'18486', slug:'atlanta-united',           name:'Atlanta United FC',       abbreviation:'ATL',  conference:'Eastern', wins:13, losses:6,  draws:6,  points:45, goalsFor:43, goalsAgainst:28 },
  { espnId:'754',   slug:'columbus-crew',            name:'Columbus Crew',           abbreviation:'CLB',  conference:'Eastern', wins:11, losses:9,  draws:5,  points:38, goalsFor:36, goalsAgainst:34 },
  { espnId:'18396', slug:'nycfc',                    name:'New York City FC',        abbreviation:'NYC',  conference:'Eastern', wins:10, losses:9,  draws:6,  points:36, goalsFor:35, goalsAgainst:32 },
  { espnId:'928',   slug:'new-england-revolution',   name:'New England Revolution',  abbreviation:'NE',   conference:'Eastern', wins:10, losses:10, draws:5,  points:35, goalsFor:33, goalsAgainst:35 },
  { espnId:'18966', slug:'lafc',                     name:'Los Angeles FC',          abbreviation:'LAFC', conference:'Western', wins:17, losses:4,  draws:4,  points:55, goalsFor:52, goalsAgainst:24 },
  { espnId:'396',   slug:'la-galaxy',                name:'LA Galaxy',               abbreviation:'LA',   conference:'Western', wins:13, losses:7,  draws:5,  points:44, goalsFor:43, goalsAgainst:32 },
  { espnId:'6808',  slug:'portland-timbers',         name:'Portland Timbers',        abbreviation:'POR',  conference:'Western', wins:11, losses:8,  draws:6,  points:39, goalsFor:37, goalsAgainst:34 },
  { espnId:'9726',  slug:'seattle-sounders',         name:'Seattle Sounders FC',     abbreviation:'SEA',  conference:'Western', wins:9,  losses:10, draws:6,  points:33, goalsFor:32, goalsAgainst:36 },
];

function espnIdToSlug(espnId: string): string {
  return ESPN_ID_TO_SLUG[espnId] ?? espnId;
}

function buildStandingsFromStatic(source: typeof STATIC_2026) {
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

  // Static 2026 fallback when ESPN is unreachable
  const standings = buildStandingsFromStatic(STATIC_2026);
  return NextResponse.json({ standings, lastUpdated: new Date().toISOString(), source: 'static-2026' });
}
