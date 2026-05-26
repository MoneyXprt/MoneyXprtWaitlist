// ESPN public API client for live MLS data (no auth required)

export interface ESPNTeam {
  id: string;
  displayName: string;
  shortDisplayName: string;
  abbreviation: string;
  location: string;
  color?: string;
  alternateColor?: string;
  logos?: Array<{ href: string; width: number; height: number }>;
}

export interface ESPNStandingEntry {
  team: ESPNTeam;
  stats: Array<{ name: string; displayName: string; shortDisplayName: string; value: number; displayValue: string }>;
}

export interface ESPNPlayer {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  position: {
    name: string;
    displayName: string;
    abbreviation: string;
  };
  age?: number;
  birthPlace?: { country?: string };
  jersey?: string;
  headshot?: { href: string };
}

export interface ESPNRosterEntry {
  athlete: ESPNPlayer;
  position?: { abbreviation: string };
}

export interface ESPNScoreboardEvent {
  id: string;
  name: string;
  date: string;
  status: {
    type: { name: string; description: string; completed: boolean };
    displayClock: string;
    period: number;
  };
  competitions: Array<{
    competitors: Array<{
      id: string;
      team: ESPNTeam;
      score?: string;
      homeAway: 'home' | 'away';
    }>;
    venue?: { fullName: string; address?: { city: string; state?: string } };
  }>;
}

const ESPN_BASE = 'https://site.api.espn.com/apis/v2/sports/soccer/usa.1';
const ESPN_SITE_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1';

// Default fetch options — short revalidation for live data
const LIVE_FETCH: RequestInit = { next: { revalidate: 300 } } as RequestInit;
const ROSTER_FETCH: RequestInit = { next: { revalidate: 3600 } } as RequestInit;

async function espnFetch<T>(url: string, opts: RequestInit = LIVE_FETCH): Promise<T> {
  const res = await fetch(url, opts);
  if (!res.ok) {
    throw new Error(`ESPN API error: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchMLSStandings(): Promise<ESPNStandingEntry[]> {
  try {
    const data = await espnFetch<{ children?: Array<{ standings?: { entries?: ESPNStandingEntry[] } }> }>(
      `${ESPN_BASE}/standings`,
      LIVE_FETCH
    );
    // ESPN wraps conference standings under children
    const entries: ESPNStandingEntry[] = [];
    if (data.children) {
      for (const conference of data.children) {
        if (conference.standings?.entries) {
          entries.push(...conference.standings.entries);
        }
      }
    }
    return entries;
  } catch (err) {
    console.error('[ESPN] fetchMLSStandings failed:', err);
    return [];
  }
}

export async function fetchMLSTeams(): Promise<ESPNTeam[]> {
  try {
    const data = await espnFetch<{ sports?: Array<{ leagues?: Array<{ teams?: Array<{ team: ESPNTeam }> }> }> }>(
      `${ESPN_BASE}/teams`,
      LIVE_FETCH
    );
    const teams: ESPNTeam[] = [];
    if (data.sports) {
      for (const sport of data.sports) {
        for (const league of sport.leagues ?? []) {
          for (const entry of league.teams ?? []) {
            teams.push(entry.team);
          }
        }
      }
    }
    return teams;
  } catch (err) {
    console.error('[ESPN] fetchMLSTeams failed:', err);
    return [];
  }
}

export async function fetchTeamDetails(espnTeamId: string): Promise<ESPNTeam | null> {
  try {
    const data = await espnFetch<{ team?: ESPNTeam }>(
      `${ESPN_SITE_BASE}/teams/${espnTeamId}`,
      LIVE_FETCH
    );
    return data.team ?? null;
  } catch (err) {
    console.error(`[ESPN] fetchTeamDetails(${espnTeamId}) failed:`, err);
    return null;
  }
}

export async function fetchTeamRoster(espnTeamId: string): Promise<ESPNPlayer[]> {
  try {
    const data = await espnFetch<{ athletes?: ESPNPlayer[] | Array<{ items?: ESPNPlayer[] }> }>(
      `${ESPN_SITE_BASE}/teams/${espnTeamId}/roster`,
      ROSTER_FETCH
    );

    if (!data.athletes) return [];

    // ESPN sometimes returns athletes as a flat array, sometimes grouped by position group
    const first = data.athletes[0] as ESPNPlayer | { items?: ESPNPlayer[] };
    if ('items' in first && Array.isArray(first.items)) {
      // grouped format
      return (data.athletes as Array<{ items?: ESPNPlayer[] }>).flatMap(g => g.items ?? []);
    }
    return data.athletes as ESPNPlayer[];
  } catch (err) {
    console.error(`[ESPN] fetchTeamRoster(${espnTeamId}) failed:`, err);
    return [];
  }
}

export async function fetchMLSScoreboard(): Promise<ESPNScoreboardEvent[]> {
  try {
    const data = await espnFetch<{ events?: ESPNScoreboardEvent[] }>(
      `${ESPN_BASE}/scoreboard`,
      LIVE_FETCH
    );
    return data.events ?? [];
  } catch (err) {
    console.error('[ESPN] fetchMLSScoreboard failed:', err);
    return [];
  }
}

/** Extract a named stat value from the ESPN stats array (returns 0 if not found) */
export function getStatValue(stats: ESPNStandingEntry['stats'], name: string): number {
  return stats.find(s => s.name === name || s.shortDisplayName === name)?.value ?? 0;
}

/** Canonical ESPN team IDs for the 10 featured MLS clubs */
export const ESPN_TEAM_IDS: Record<string, string> = {
  'inter-miami': '17362',
  'la-galaxy': '396',
  lafc: '18966',
  'seattle-sounders': '9726',
  'atlanta-united': '18486',
  'portland-timbers': '6808',
  'fc-cincinnati': '18858',
  'columbus-crew': '754',
  'new-england-revolution': '928',
  nycfc: '18396',
};

/** Reverse map: espnId → internal slug */
export const ESPN_ID_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(ESPN_TEAM_IDS).map(([slug, id]) => [id, slug])
);
