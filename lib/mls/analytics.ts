import { MLSPlayer, MLSTeam, TeamFinancials } from './types';

const SENIOR_BUDGET_MAX = 5_255_000; // 2024 MLS Senior Budget

// ─── Team Financials ────────────────────────────────────────────────────────

export function calculateTeamFinancials(
  team: MLSTeam,
  players: MLSPlayer[],
  allTeams?: MLSTeam[],
  allPlayers?: MLSPlayer[]
): TeamFinancials {
  const totalPayroll = players.reduce((sum, p) => sum + p.guaranteedComp, 0);

  const dpPlayers = players.filter(p => p.isDesignatedPlayer);
  const dpCount = dpPlayers.length;
  const dpCost = dpPlayers.reduce((sum, p) => sum + p.guaranteedComp, 0);

  const tamPlayers = players.filter(p => p.isTAM && !p.isDesignatedPlayer);
  const tamPlayerCount = tamPlayers.length;
  const tamCost = tamPlayers.reduce((sum, p) => sum + p.guaranteedComp, 0);

  const seniorBudgetUsed = players
    .filter(p => !p.isDesignatedPlayer && !p.isTAM)
    .reduce((sum, p) => sum + Math.min(p.budgetCharge, SENIOR_BUDGET_MAX), 0);

  const totalGoals = players.reduce((sum, p) => sum + p.stats.goals, 0);
  const totalAssists = players.reduce((sum, p) => sum + p.stats.assists, 0);

  const costPerGoal = totalGoals > 0 ? totalPayroll / totalGoals : 0;
  const costPerPoint = team.standingsPoints > 0 ? totalPayroll / team.standingsPoints : 0;
  const costPerAssist = totalAssists > 0 ? totalPayroll / totalAssists : 0;
  const payrollAsRevenuePct =
    team.estimatedRevenue > 0 ? (totalPayroll / team.estimatedRevenue) * 100 : 0;
  const valueRating =
    totalPayroll > 0 ? (totalGoals + totalAssists) / (totalPayroll / 1_000_000) : 0;

  let payrollRank = 1;
  if (allTeams && allPlayers) {
    const teamPayrolls = allTeams.map(t => ({
      teamId: t.id,
      payroll: allPlayers
        .filter(p => p.teamId === t.id)
        .reduce((sum, p) => sum + p.guaranteedComp, 0),
    }));
    teamPayrolls.sort((a, b) => b.payroll - a.payroll);
    payrollRank = teamPayrolls.findIndex(t => t.teamId === team.id) + 1;
  }

  return {
    teamId: team.id,
    totalPayroll,
    dpCount,
    dpCost,
    tamPlayerCount,
    tamCost,
    seniorBudgetUsed,
    seniorBudgetMax: SENIOR_BUDGET_MAX,
    payrollRank,
    costPerGoal,
    costPerPoint,
    costPerAssist,
    payrollAsRevenuePct,
    valueRating,
  };
}

// ─── Player Value Score ──────────────────────────────────────────────────────

export function calculatePlayerValueScore(player: MLSPlayer): number {
  const { stats, budgetCharge } = player;
  const chargeInM = budgetCharge / 1_000_000;
  if (chargeInM === 0) return 0;

  const goalScore = Math.min((stats.goals / chargeInM) * 5, 25);
  const assistScore = Math.min((stats.assists / chargeInM) * 4, 20);
  const defScore = Math.min(((stats.tackles + stats.interceptions) / chargeInM) * 0.3, 15);
  const composite = stats.goals * 3 + stats.assists * 2 + stats.keyPasses * 0.5;
  const effScore = Math.min((composite / chargeInM) * 2, 40);

  return Math.round(goalScore + assistScore + defScore + effScore);
}

// ─── Best Value Players ──────────────────────────────────────────────────────

export function getBestValuePlayers(players: MLSPlayer[], topN = 10): MLSPlayer[] {
  return players
    .filter(p => p.budgetCharge > 0)
    .map(p => ({
      player: p,
      valueRatio: (p.stats.goals + p.stats.assists) / (p.guaranteedComp / 1_000_000),
    }))
    .sort((a, b) => b.valueRatio - a.valueRatio)
    .slice(0, topN)
    .map(x => x.player);
}

// ─── Optimal Lineup (4-3-3) ──────────────────────────────────────────────────

type FormationSlot = {
  key: string;
  positions: MLSPlayer['position'][];
};

const FORMATION_433: FormationSlot[] = [
  { key: 'GK',  positions: ['GK'] },
  { key: 'RB',  positions: ['RB'] },
  { key: 'CB1', positions: ['CB'] },
  { key: 'CB2', positions: ['CB'] },
  { key: 'LB',  positions: ['LB'] },
  { key: 'CDM', positions: ['CDM'] },
  { key: 'CM1', positions: ['CM'] },
  { key: 'CM2', positions: ['CM', 'CAM'] },
  { key: 'RW',  positions: ['RW', 'RM'] },
  { key: 'ST',  positions: ['ST'] },
  { key: 'LW',  positions: ['LW', 'LM'] },
];

function playerEfficiencyScore(player: MLSPlayer): number {
  const chargeInM = player.budgetCharge / 1_000_000;
  if (chargeInM === 0) return 0;
  const composite =
    player.stats.goals * 3 +
    player.stats.assists * 2 +
    player.stats.keyPasses * 0.5 +
    player.stats.tackles * 0.3;
  return composite / chargeInM;
}

export function getOptimalLineup(players: MLSPlayer[], _formation = '4-3-3'): MLSPlayer[] {
  const selected: MLSPlayer[] = [];
  const usedIds = new Set<string>();

  for (const slot of FORMATION_433) {
    const candidates = players
      .filter(p => slot.positions.includes(p.position) && !usedIds.has(p.id))
      .sort((a, b) => playerEfficiencyScore(b) - playerEfficiencyScore(a));

    if (candidates.length > 0) {
      selected.push(candidates[0]);
      usedIds.add(candidates[0].id);
    }
  }

  return selected;
}

// ─── Overpaid Players ────────────────────────────────────────────────────────

export function getOverpaidPlayers(
  players: MLSPlayer[]
): { player: MLSPlayer; overpayCost: number }[] {
  return players
    .filter(p => p.budgetCharge > 0)
    .map(p => {
      const valueScore = calculatePlayerValueScore(p);
      const expectedSalary =
        p.stats.goals * 200_000 +
        p.stats.assists * 150_000 +
        p.stats.keyPasses * 5_000 +
        p.stats.tackles * 3_000;
      const overpayCost = Math.max(0, p.guaranteedComp - expectedSalary);
      return { player: p, valueScore, overpayCost };
    })
    .filter(x => x.valueScore < 50 && x.overpayCost > 500_000)
    .sort((a, b) => b.overpayCost - a.overpayCost)
    .map(x => ({ player: x.player, overpayCost: x.overpayCost }));
}

// ─── Underpaid Gems ──────────────────────────────────────────────────────────

export function getUnderpaidGems(players: MLSPlayer[]): MLSPlayer[] {
  return players
    .filter(p => {
      const score = calculatePlayerValueScore(p);
      return score >= 70 && p.guaranteedComp < 1_000_000 && p.stats.goals + p.stats.assists >= 5;
    })
    .sort((a, b) => calculatePlayerValueScore(b) - calculatePlayerValueScore(a));
}

// ─── Compare Teams By Efficiency ─────────────────────────────────────────────

export function compareTeamsByEfficiency(
  teams: MLSTeam[],
  allPlayers: MLSPlayer[]
): TeamFinancials[] {
  return teams.map(team => {
    const players = allPlayers.filter(p => p.teamId === team.id);
    return calculateTeamFinancials(team, players, teams, allPlayers);
  });
}
