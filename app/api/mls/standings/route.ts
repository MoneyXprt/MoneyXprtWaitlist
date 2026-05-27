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
  // Eastern Conference
  { espnId:'17362', slug:'inter-miami',             name:'Inter Miami CF',          abbreviation:'MIA',  conference:'Eastern', wins:16, losses:5,  draws:4,  points:52, goalsFor:48, goalsAgainst:22 },
  { espnId:'18486', slug:'atlanta-united',           name:'Atlanta United FC',       abbreviation:'ATL',  conference:'Eastern', wins:13, losses:6,  draws:6,  points:45, goalsFor:43, goalsAgainst:28 },
  { espnId:'18858', slug:'fc-cincinnati',            name:'FC Cincinnati',           abbreviation:'CIN',  conference:'Eastern', wins:13, losses:7,  draws:5,  points:44, goalsFor:41, goalsAgainst:30 },
  { espnId:'18396', slug:'nycfc',                    name:'New York City FC',        abbreviation:'NYC',  conference:'Eastern', wins:11, losses:8,  draws:5,  points:38, goalsFor:35, goalsAgainst:32 },
  { espnId:'754',   slug:'columbus-crew',            name:'Columbus Crew',           abbreviation:'CLB',  conference:'Eastern', wins:10, losses:8,  draws:7,  points:37, goalsFor:36, goalsAgainst:34 },
  { espnId:'399',   slug:'new-york-red-bulls',       name:'New York Red Bulls',      abbreviation:'RBNY', conference:'Eastern', wins:10, losses:9,  draws:6,  points:36, goalsFor:34, goalsAgainst:30 },
  { espnId:'18058', slug:'philadelphia-union',       name:'Philadelphia Union',      abbreviation:'PHI',  conference:'Eastern', wins:10, losses:10, draws:5,  points:35, goalsFor:33, goalsAgainst:34 },
  { espnId:'22502', slug:'nashville-sc',             name:'Nashville SC',            abbreviation:'NSH',  conference:'Eastern', wins: 9, losses: 9, draws:7,  points:34, goalsFor:32, goalsAgainst:30 },
  { espnId:'22403', slug:'charlotte-fc',             name:'Charlotte FC',            abbreviation:'CLT',  conference:'Eastern', wins: 9, losses:10, draws:6,  points:33, goalsFor:31, goalsAgainst:35 },
  { espnId:'928',   slug:'new-england-revolution',   name:'New England Revolution',  abbreviation:'NE',   conference:'Eastern', wins: 9, losses:10, draws:6,  points:33, goalsFor:30, goalsAgainst:34 },
  { espnId:'5526',  slug:'toronto-fc',               name:'Toronto FC',              abbreviation:'TOR',  conference:'Eastern', wins: 8, losses:10, draws:6,  points:30, goalsFor:28, goalsAgainst:34 },
  { espnId:'18887', slug:'orlando-city',             name:'Orlando City SC',         abbreviation:'ORL',  conference:'Eastern', wins: 8, losses:11, draws:5,  points:29, goalsFor:27, goalsAgainst:35 },
  { espnId:'256',   slug:'dc-united',                name:'D.C. United',             abbreviation:'DC',   conference:'Eastern', wins: 7, losses:11, draws:7,  points:28, goalsFor:26, goalsAgainst:37 },
  { espnId:'1930',  slug:'cf-montreal',              name:'CF Montréal',             abbreviation:'MTL',  conference:'Eastern', wins: 7, losses:12, draws:5,  points:26, goalsFor:24, goalsAgainst:38 },
  { espnId:'674',   slug:'chicago-fire',             name:'Chicago Fire FC',         abbreviation:'CHI',  conference:'Eastern', wins: 5, losses:14, draws:6,  points:21, goalsFor:22, goalsAgainst:44 },
  // Western Conference
  { espnId:'18966', slug:'lafc',                     name:'Los Angeles FC',          abbreviation:'LAFC', conference:'Western', wins:17, losses:4,  draws:4,  points:55, goalsFor:52, goalsAgainst:24 },
  { espnId:'396',   slug:'la-galaxy',                name:'LA Galaxy',               abbreviation:'LA',   conference:'Western', wins:13, losses:7,  draws:5,  points:44, goalsFor:43, goalsAgainst:32 },
  { espnId:'6808',  slug:'portland-timbers',         name:'Portland Timbers',        abbreviation:'POR',  conference:'Western', wins:11, losses:8,  draws:6,  points:39, goalsFor:37, goalsAgainst:34 },
  { espnId:'22500', slug:'austin-fc',                name:'Austin FC',               abbreviation:'ATX',  conference:'Western', wins:11, losses:9,  draws:5,  points:38, goalsFor:36, goalsAgainst:33 },
  { espnId:'23213', slug:'san-diego-fc',             name:'San Diego FC',            abbreviation:'SD',   conference:'Western', wins:10, losses:9,  draws:6,  points:36, goalsFor:34, goalsAgainst:31 },
  { espnId:'265',   slug:'sporting-kc',              name:'Sporting Kansas City',    abbreviation:'SKC',  conference:'Western', wins: 9, losses:10, draws:6,  points:33, goalsFor:31, goalsAgainst:35 },
  { espnId:'18979', slug:'minnesota-united',         name:'Minnesota United FC',     abbreviation:'MIN',  conference:'Western', wins: 9, losses:11, draws:5,  points:32, goalsFor:30, goalsAgainst:35 },
  { espnId:'9726',  slug:'seattle-sounders',         name:'Seattle Sounders FC',     abbreviation:'SEA',  conference:'Western', wins: 9, losses:11, draws:6,  points:33, goalsFor:32, goalsAgainst:36 },
  { espnId:'255',   slug:'colorado-rapids',          name:'Colorado Rapids',         abbreviation:'COL',  conference:'Western', wins: 8, losses:10, draws:6,  points:30, goalsFor:28, goalsAgainst:34 },
  { espnId:'11408', slug:'houston-dynamo',           name:'Houston Dynamo FC',       abbreviation:'HOU',  conference:'Western', wins: 8, losses:11, draws:5,  points:29, goalsFor:27, goalsAgainst:35 },
  { espnId:'17209', slug:'vancouver-whitecaps',      name:'Vancouver Whitecaps FC',  abbreviation:'VAN',  conference:'Western', wins: 7, losses:10, draws:7,  points:28, goalsFor:26, goalsAgainst:34 },
  { espnId:'11120', slug:'real-salt-lake',           name:'Real Salt Lake',          abbreviation:'RSL',  conference:'Western', wins: 7, losses:11, draws:6,  points:27, goalsFor:25, goalsAgainst:35 },
  { espnId:'6977',  slug:'fc-dallas',                name:'FC Dallas',               abbreviation:'DAL',  conference:'Western', wins: 7, losses:13, draws:4,  points:25, goalsFor:24, goalsAgainst:40 },
  { espnId:'23197', slug:'st-louis-city',            name:'St. Louis City SC',       abbreviation:'STL',  conference:'Western', wins: 6, losses:13, draws:5,  points:23, goalsFor:22, goalsAgainst:41 },
  { espnId:'279',   slug:'san-jose-earthquakes',     name:'San Jose Earthquakes',    abbreviation:'SJ',   conference:'Western', wins: 5, losses:15, draws:4,  points:19, goalsFor:20, goalsAgainst:46 },
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
