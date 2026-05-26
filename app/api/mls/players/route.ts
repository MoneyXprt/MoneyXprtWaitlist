import { NextRequest, NextResponse } from 'next/server';
import { MLS_PLAYERS } from '@/lib/mls/data';
import { calculatePlayerValueScore } from '@/lib/mls/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    const players = teamId
      ? MLS_PLAYERS.filter(p => p.teamId === teamId)
      : MLS_PLAYERS;

    const playersWithScores = players.map(player => ({
      ...player,
      valueScore: calculatePlayerValueScore(player),
      costPerGoal: player.stats.goals > 0
        ? player.guaranteedComp / player.stats.goals
        : null,
      goalsAndAssists: player.stats.goals + player.stats.assists,
    }));

    return NextResponse.json({ players: playersWithScores });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch players' },
      { status: 500 }
    );
  }
}
