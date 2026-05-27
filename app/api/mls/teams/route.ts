import { NextResponse } from 'next/server';
import { MLS_TEAMS, MLS_PLAYERS } from '@/lib/mls/data';
import { calculateTeamFinancials } from '@/lib/mls/analytics';

export async function GET() {
  try {
    const teamsWithFinancials = MLS_TEAMS.map(team => {
      const players = MLS_PLAYERS.filter(p => p.teamId === team.id);
      const financials = calculateTeamFinancials(team, players, MLS_TEAMS, MLS_PLAYERS);
      return { team, financials };
    });

    return NextResponse.json({ teams: teamsWithFinancials });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
