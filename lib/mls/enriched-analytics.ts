/**
 * Analytics functions for EnrichedPlayer + LiveTeamData (ESPN + MLSPA).
 * Kept separate from analytics.ts to avoid linter conflicts.
 */
import type { EnrichedPlayer, LiveTeamData, TeamFinancials } from './types';

const SENIOR_BUDGET_MAX_2025 = 5_255_000;

/**
 * Calculate TeamFinancials from live LiveTeamData + EnrichedPlayer roster.
 */
export function calculateTeamFinancialsFromLive(
  teamData: LiveTeamData,
  players: EnrichedPlayer[],
  estimatedRevenue = 60_000_000,
  allTeamPayrolls?: { teamId: string; payroll: number }[]
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
    .reduce((sum, p) => sum + Math.min(p.budgetCharge, SENIOR_BUDGET_MAX_2025), 0);

  const totalGoals = players.reduce((sum, p) => sum + p.stats.goals, 0);
  const totalAssists = players.reduce((sum, p) => sum + p.stats.assists, 0);

  const costPerGoal = totalGoals > 0 ? totalPayroll / totalGoals : 0;
  const costPerPoint = teamData.points > 0 ? totalPayroll / teamData.points : 0;
  const costPerAssist = totalAssists > 0 ? totalPayroll / totalAssists : 0;
  const payrollAsRevenuePct = estimatedRevenue > 0 ? (totalPayroll / estimatedRevenue) * 100 : 0;
  const valueRating = totalPayroll > 0 ? (totalGoals + totalAssists) / (totalPayroll / 1_000_000) : 0;

  let payrollRank = 1;
  if (allTeamPayrolls) {
    const sorted = [...allTeamPayrolls].sort((a, b) => b.payroll - a.payroll);
    const idx = sorted.findIndex(t => t.teamId === teamData.espnId);
    payrollRank = idx >= 0 ? idx + 1 : sorted.length + 1;
  }

  return {
    teamId: teamData.espnId,
    totalPayroll,
    dpCount,
    dpCost,
    tamPlayerCount,
    tamCost,
    seniorBudgetUsed,
    seniorBudgetMax: SENIOR_BUDGET_MAX_2025,
    payrollRank,
    costPerGoal,
    costPerPoint,
    costPerAssist,
    payrollAsRevenuePct,
    valueRating,
  };
}

export function calculateEnrichedPlayerValueScore(player: EnrichedPlayer): number {
  const { stats, budgetCharge } = player;
  const chargeInM = budgetCharge / 1_000_000;
  if (chargeInM === 0) return 0;

  const goalScore = Math.min((stats.goals / chargeInM) * 5, 25);
  const assistScore = Math.min((stats.assists / chargeInM) * 4, 20);
  const effScore = Math.min(((stats.goals * 3 + stats.assists * 2) / chargeInM) * 2, 55);

  return Math.round(goalScore + assistScore + effScore);
}

export function getBestValueEnrichedPlayers(players: EnrichedPlayer[], topN = 10): EnrichedPlayer[] {
  return players
    .filter(p => p.budgetCharge > 0)
    .map(p => ({
      player: p,
      ratio: (p.stats.goals + p.stats.assists) / (p.guaranteedComp / 1_000_000),
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, topN)
    .map(x => x.player);
}

const ENRICHED_FORMATION_433 = [
  { key: 'GK',  positions: ['GK'] },
  { key: 'RB',  positions: ['RB', 'D'] },
  { key: 'CB1', positions: ['CB', 'D'] },
  { key: 'CB2', positions: ['CB', 'D'] },
  { key: 'LB',  positions: ['LB', 'D'] },
  { key: 'CDM', positions: ['CDM', 'DM', 'M'] },
  { key: 'CM1', positions: ['CM', 'M'] },
  { key: 'CM2', positions: ['CM', 'CAM', 'M'] },
  { key: 'RW',  positions: ['RW', 'RM', 'MF', 'F'] },
  { key: 'ST',  positions: ['ST', 'F', 'FW'] },
  { key: 'LW',  positions: ['LW', 'LM', 'MF', 'F'] },
];

export function getOptimalEnrichedLineup(players: EnrichedPlayer[]): EnrichedPlayer[] {
  const selected: EnrichedPlayer[] = [];
  const usedIds = new Set<string>();
  const posUpper = (p: EnrichedPlayer) => p.position.toUpperCase();

  for (const slot of ENRICHED_FORMATION_433) {
    const candidates = players
      .filter(p => slot.positions.some(pos => posUpper(p).includes(pos)) && !usedIds.has(p.espnId))
      .sort((a, b) => b.valueScore - a.valueScore);

    if (candidates.length > 0) {
      selected.push(candidates[0]);
      usedIds.add(candidates[0].espnId);
    }
  }
  return selected;
}

export function getOverpaidEnrichedPlayers(
  players: EnrichedPlayer[]
): { player: EnrichedPlayer; overpayCost: number }[] {
  return players
    .filter(p => p.budgetCharge > 0)
    .map(p => {
      const valueScore = calculateEnrichedPlayerValueScore(p);
      const expectedSalary = p.stats.goals * 200_000 + p.stats.assists * 150_000;
      const overpayCost = Math.max(0, p.guaranteedComp - expectedSalary);
      return { player: p, valueScore, overpayCost };
    })
    .filter(x => x.valueScore < 50 && x.overpayCost > 500_000)
    .sort((a, b) => b.overpayCost - a.overpayCost)
    .map(x => ({ player: x.player, overpayCost: x.overpayCost }));
}
