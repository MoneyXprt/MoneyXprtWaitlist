/**
 * POST /api/mls/social-live
 * Generate social media post using live ESPN standings + 2026 MLSPA salary data.
 */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  fetchMLSStandings,
  getStatValue,
  ESPN_TEAM_IDS,
  ESPN_ID_TO_SLUG,
} from '@/lib/mls/espn';
import { getSalariesForTeam } from '@/lib/mls/salaries';
import { calculateTeamFinancialsFromLive } from '@/lib/mls/enriched-analytics';
import type { EnrichedPlayer, LiveTeamData, TeamFinancials, ESPNPlayerStats } from '@/lib/mls/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type FocusArea = 'salary' | 'performance' | 'lineup' | 'efficiency';
type Platform = 'twitter' | 'linkedin' | 'instagram';

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

function fmt(n: number): string {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

function buildPrompt(
  focusArea: FocusArea,
  platform: Platform,
  teamName: string,
  liveTeam: LiveTeamData,
  financials: TeamFinancials,
  topSalaries: EnrichedPlayer[]
): string {
  const record = `${liveTeam.wins}W-${liveTeam.losses}L-${liveTeam.draws}D (${liveTeam.points} pts)`;

  const platformInstructions: Record<Platform, string> = {
    twitter: 'Write a punchy Twitter/X thread or single tweet (max 280 chars). Short, impactful sentences. Emojis OK but sparingly.',
    linkedin: 'Write a professional LinkedIn post (3-5 paragraphs). Data storytelling, end with a strategic takeaway. Professional tone.',
    instagram: 'Write an Instagram caption (2-3 short paragraphs). Hook with a bold statement. Relevant hashtags at end.',
  };

  const focusPrompts: Record<FocusArea, string> = {
    salary: `Focus on payroll structure and salary allocation. Key figures:
- Total Payroll: ${fmt(financials.totalPayroll)}
- DP Count: ${financials.dpCount} DPs costing ${fmt(financials.dpCost)} combined (cap charge only ${fmt(financials.dpCount * 703_125)})
- TAM Players: ${financials.tamPlayerCount} players, ${fmt(financials.tamCost)} total
- Payroll as % of est. revenue: ${financials.payrollAsRevenuePct.toFixed(1)}%
- Payroll Rank in MLS: #${financials.payrollRank}
- Top 3 earners (2026 MLSPA): ${topSalaries.slice(0, 3).map(p => `${p.name} (${fmt(p.guaranteedComp)})`).join(', ')}`,

    performance: `Focus on performance vs. investment ROI using LIVE ESPN standings. Key metrics:
- Current Record: ${record}
- Cost per Standing Point: ${fmt(financials.costPerPoint)}
- Value Rating (G+A per $M): ${financials.valueRating.toFixed(2)}
- Total Payroll: ${fmt(financials.totalPayroll)}
- DP spend: ${fmt(financials.dpCost)} for ${financials.dpCount} DPs`,

    lineup: `Focus on lineup optimization and CFO perspective on the optimal 11.
- Current Record: ${record}
- Top earners by salary: ${topSalaries.slice(0, 5).map(p => `${p.name} (${fmt(p.guaranteedComp)})`).join(', ')}
- Value Rating: ${financials.valueRating.toFixed(2)} G+A per $M spent
- Total Payroll: ${fmt(financials.totalPayroll)}`,

    efficiency: `Focus on capital allocation efficiency using live 2026 data.
- Current Record: ${record}
- Value Rating: ${financials.valueRating.toFixed(2)} G+A per $M
- Senior Budget Used: ${fmt(financials.seniorBudgetUsed)} of ${fmt(financials.seniorBudgetMax)} max
- Cost per point: ${fmt(financials.costPerPoint)}
- Payroll rank: #${financials.payrollRank} in MLS`,
  };

  return `Team: ${teamName} (2026 MLS Season — Live ESPN Data + MLSPA Salaries)
${focusPrompts[focusArea]}

Platform: ${platformInstructions[platform]}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { teamId: string; platform: Platform; focusArea: FocusArea };
    const { teamId, platform, focusArea } = body;

    if (!teamId || !platform || !focusArea) {
      return NextResponse.json({ error: 'Missing required fields: teamId, platform, focusArea' }, { status: 400 });
    }

    let espnId: string;
    let slug: string;

    if (ESPN_TEAM_IDS[teamId]) {
      espnId = ESPN_TEAM_IDS[teamId];
      slug = teamId;
    } else if (ESPN_ID_TO_SLUG[teamId]) {
      espnId = teamId;
      slug = ESPN_ID_TO_SLUG[teamId];
    } else {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const entries = await fetchMLSStandings();
    const entry = entries.find(e => e.team.id === espnId);

    const liveTeam: LiveTeamData = entry
      ? {
          espnId: entry.team.id,
          name: entry.team.displayName,
          abbreviation: entry.team.abbreviation,
          wins: getStatValue(entry.stats, 'wins'),
          losses: getStatValue(entry.stats, 'losses'),
          draws: getStatValue(entry.stats, 'ties'),
          points: getStatValue(entry.stats, 'points'),
          goalsFor: getStatValue(entry.stats, 'pointsFor'),
          goalsAgainst: getStatValue(entry.stats, 'pointsAgainst'),
          position: 0,
          conference: '',
        }
      : { espnId, name: slug, abbreviation: slug.toUpperCase().slice(0, 4), wins: 0, losses: 0, draws: 0, points: 0, goalsFor: 0, goalsAgainst: 0, position: 0, conference: '' };

    const salaries = getSalariesForTeam(slug);
    const enrichedPlayers: EnrichedPlayer[] = salaries.map((s, idx) => ({
      espnId: `salary-${idx}`,
      name: s.name,
      position: 'MF',
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
    const topSalaries = [...enrichedPlayers].sort((a, b) => b.guaranteedComp - a.guaranteedComp);

    const userPrompt = buildPrompt(focusArea, platform, liveTeam.name, liveTeam, financials, topSalaries);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are the CFO of an MLS team analyzing financial performance using 2026 live ESPN standings and MLSPA salary data. Write sharply analytical social media content using specific dollar figures, ratios, and metrics. Be provocative but data-driven. Cite the exact figures provided to you.',
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content ?? '';
    const hashtagMatches = content.match(/#\w+/g) ?? [];
    const hashtags = hashtagMatches.length > 0
      ? hashtagMatches
      : ['#MLS', '#MLSSoccer', `#${liveTeam.abbreviation}`, '#SportsBusiness', '#SportsFinance'];

    const metrics = [
      `Total Payroll: ${fmt(financials.totalPayroll)}`,
      `Cost/Point: ${fmt(financials.costPerPoint)}`,
      `Value Rating: ${financials.valueRating.toFixed(2)} G+A per $M`,
      `Payroll Rank: #${financials.payrollRank} in MLS`,
    ];

    return NextResponse.json({ post: { platform, content, hashtags, metrics }, financials, liveTeam });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate social post';
    console.error('Social post generation error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
