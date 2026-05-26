import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MLS_TEAMS, MLS_PLAYERS } from '@/lib/mls/data';
import {
  calculateTeamFinancials,
  getBestValuePlayers,
  getOverpaidPlayers,
} from '@/lib/mls/analytics';
import { TeamFinancials } from '@/lib/mls/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type FocusArea = 'salary' | 'performance' | 'lineup' | 'efficiency';
type Platform = 'twitter' | 'linkedin' | 'instagram';

function formatCurrency(n: number): string {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

function buildPrompt(
  focusArea: FocusArea,
  platform: Platform,
  teamName: string,
  financials: TeamFinancials,
  bestValueNames: string[],
  overpaidNames: string[]
): string {
  const platformInstructions: Record<Platform, string> = {
    twitter:
      'Write a punchy Twitter/X thread or single tweet (max 280 chars). Use short, impactful sentences. Emojis OK but sparingly.',
    linkedin:
      'Write a professional LinkedIn post (3-5 paragraphs). Use data storytelling, end with a strategic takeaway. Professional tone.',
    instagram:
      'Write an Instagram caption (2-3 short paragraphs). Hook with a bold statement. Use relevant hashtags at the end.',
  };

  const focusPrompts: Record<FocusArea, string> = {
    salary: `Focus on payroll structure and salary allocation. Key figures:
- Total Payroll: ${formatCurrency(financials.totalPayroll)}
- DP Count: ${financials.dpCount} DPs costing ${formatCurrency(financials.dpCost)} combined (only ${formatCurrency(financials.dpCount * 683_750)} hits the cap)
- TAM Players: ${financials.tamPlayerCount} players, ${formatCurrency(financials.tamCost)} total
- Payroll as % of revenue: ${financials.payrollAsRevenuePct.toFixed(1)}%
- Payroll Rank in MLS: #${financials.payrollRank}`,

    performance: `Focus on performance vs. investment ROI. Key metrics:
- Cost per Goal: ${financials.costPerGoal > 0 ? formatCurrency(financials.costPerGoal) : 'N/A'}
- Cost per Standing Point: ${formatCurrency(financials.costPerPoint)}
- Value Rating (G+A per $M): ${financials.valueRating.toFixed(2)}
- Top value players: ${bestValueNames.slice(0, 3).join(', ')}`,

    lineup: `Focus on lineup optimization and CFO perspective on the optimal 11.
- Best value starters: ${bestValueNames.slice(0, 5).join(', ')}
- Value Rating: ${financials.valueRating.toFixed(2)} G+A per $M spent
- Total Payroll: ${formatCurrency(financials.totalPayroll)}`,

    efficiency: `Focus on capital allocation efficiency. Key metrics:
- Overpaid players (est.): ${overpaidNames.slice(0, 2).join(', ') || 'None flagged'}
- Value Rating: ${financials.valueRating.toFixed(2)} G+A per $M
- Senior Budget Used: ${formatCurrency(financials.seniorBudgetUsed)} of ${formatCurrency(financials.seniorBudgetMax)} max
- Cost per point: ${formatCurrency(financials.costPerPoint)}`,
  };

  return `Team: ${teamName} (2024 MLS Season)
${focusPrompts[focusArea]}

Platform: ${platformInstructions[platform]}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, platform, focusArea } = body as {
      teamId: string;
      platform: Platform;
      focusArea: FocusArea;
    };

    if (!teamId || !platform || !focusArea) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId, platform, focusArea' },
        { status: 400 }
      );
    }

    const team = MLS_TEAMS.find(t => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const players = MLS_PLAYERS.filter(p => p.teamId === teamId);
    const financials = calculateTeamFinancials(team, players, MLS_TEAMS, MLS_PLAYERS);
    const bestValue = getBestValuePlayers(players, 5);
    const overpaid = getOverpaidPlayers(players);

    const bestValueNames = bestValue.map(
      p => `${p.name} (${p.stats.goals}G/${p.stats.assists}A, $${(p.budgetCharge / 1000).toFixed(0)}K cap)`
    );
    const overpaidNames = overpaid.map(
      ({ player, overpayCost }) =>
        `${player.name} (est. overpay ${formatCurrency(overpayCost)})`
    );

    const userPrompt = buildPrompt(
      focusArea,
      platform,
      team.name,
      financials,
      bestValueNames,
      overpaidNames
    );

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are the CFO of an MLS team analyzing financial performance. Write sharply analytical social media content using specific dollar figures, ratios, and metrics. Be provocative but data-driven. Never use made-up data. Cite the exact figures provided to you.',
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    const hashtagMatches = content.match(/#\w+/g) || [];
    const hashtags =
      hashtagMatches.length > 0
        ? hashtagMatches
        : ['#MLS', '#MLSSoccer', `#${team.abbreviation}`, '#SportsBusiness', '#SportsFinance'];

    const metrics = [
      `Total Payroll: ${formatCurrency(financials.totalPayroll)}`,
      `Cost/Goal: ${financials.costPerGoal > 0 ? formatCurrency(financials.costPerGoal) : 'N/A'}`,
      `Value Rating: ${financials.valueRating.toFixed(2)} G+A per $M`,
      `Payroll Rank: #${financials.payrollRank} in MLS`,
    ];

    return NextResponse.json({
      post: { platform, content, hashtags, metrics },
      financials,
    });
  } catch (error: any) {
    console.error('Social post generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate social post' },
      { status: 500 }
    );
  }
}
