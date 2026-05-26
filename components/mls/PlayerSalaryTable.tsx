'use client';

import { useState, useMemo } from 'react';
import { MLSPlayer } from '@/lib/mls/types';
import { calculatePlayerValueScore } from '@/lib/mls/analytics';

interface PlayerSalaryTableProps {
  players: MLSPlayer[];
}

type SortKey =
  | 'name'
  | 'position'
  | 'guaranteedComp'
  | 'budgetCharge'
  | 'goals'
  | 'assists'
  | 'ga'
  | 'valueScore'
  | 'costPerGoal';

function formatMoney(n: number | null): string {
  if (n === null || !isFinite(n) || n === 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (score >= 50) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  return 'bg-red-500/10 text-red-400 border-red-500/20';
}

function rowHighlight(score: number): string {
  if (score >= 70) return 'border-l-2 border-l-green-500/40';
  if (score >= 50) return 'border-l-2 border-l-yellow-500/40';
  return 'border-l-2 border-l-red-500/30';
}

const POSITION_COLORS: Record<string, string> = {
  GK: 'bg-yellow-500/20 text-yellow-300',
  CB: 'bg-blue-500/20 text-blue-300',
  LB: 'bg-cyan-500/20 text-cyan-300',
  RB: 'bg-cyan-500/20 text-cyan-300',
  CDM: 'bg-purple-500/20 text-purple-300',
  CM: 'bg-indigo-500/20 text-indigo-300',
  CAM: 'bg-pink-500/20 text-pink-300',
  LW: 'bg-orange-500/20 text-orange-300',
  RW: 'bg-orange-500/20 text-orange-300',
  ST: 'bg-red-500/20 text-red-300',
  LM: 'bg-emerald-500/20 text-emerald-300',
  RM: 'bg-emerald-500/20 text-emerald-300',
};

export default function PlayerSalaryTable({ players }: PlayerSalaryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('guaranteedComp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('');

  const enriched = useMemo(() => {
    return players.map(p => ({
      ...p,
      valueScore: calculatePlayerValueScore(p),
      ga: p.stats.goals + p.stats.assists,
      costPerGoal: p.stats.goals > 0 ? p.guaranteedComp / p.stats.goals : null,
    }));
  }, [players]);

  const sorted = useMemo(() => {
    const filtered = enriched.filter(
      p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.position.toLowerCase().includes(filter.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortKey) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'position':
          aVal = a.position;
          bVal = b.position;
          break;
        case 'guaranteedComp':
          aVal = a.guaranteedComp;
          bVal = b.guaranteedComp;
          break;
        case 'budgetCharge':
          aVal = a.budgetCharge;
          bVal = b.budgetCharge;
          break;
        case 'goals':
          aVal = a.stats.goals;
          bVal = b.stats.goals;
          break;
        case 'assists':
          aVal = a.stats.assists;
          bVal = b.stats.assists;
          break;
        case 'ga':
          aVal = a.ga;
          bVal = b.ga;
          break;
        case 'valueScore':
          aVal = a.valueScore;
          bVal = b.valueScore;
          break;
        case 'costPerGoal':
          aVal = a.costPerGoal ?? Infinity;
          bVal = b.costPerGoal ?? Infinity;
          break;
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [enriched, sortKey, sortDir, filter]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortableHeader({ col, label }: { col: SortKey; label: string }) {
    const active = sortKey === col;
    return (
      <th
        className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors ${
          active ? 'text-yellow-400' : 'text-white/50 hover:text-white/80'
        }`}
        onClick={() => handleSort(col)}
      >
        {label} {active ? (sortDir === 'desc' ? '↓' : '↑') : ''}
      </th>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
          <span className="text-white/50">High Value (Score ≥70)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/50" />
          <span className="text-white/50">Mid Value (50–69)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
          <span className="text-white/50">Low Value (&lt;50)</span>
        </span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Filter by name or position..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full max-w-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-yellow-400/50"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[800px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <SortableHeader col="name" label="Player" />
              <SortableHeader col="position" label="Pos" />
              <SortableHeader col="guaranteedComp" label="Salary" />
              <SortableHeader col="budgetCharge" label="Cap Charge" />
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap">
                Type
              </th>
              <SortableHeader col="goals" label="G" />
              <SortableHeader col="assists" label="A" />
              <SortableHeader col="ga" label="G+A" />
              <SortableHeader col="valueScore" label="Score" />
              <SortableHeader col="costPerGoal" label="$/Goal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map(player => (
              <tr
                key={player.id}
                className={`hover:bg-white/5 transition-colors ${rowHighlight(player.valueScore)}`}
              >
                <td className="px-3 py-2.5">
                  <div className="font-medium text-white text-sm">{player.name}</div>
                  <div className="text-xs text-white/40">{player.nationality} · Age {player.age}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      POSITION_COLORS[player.position] || 'bg-white/10 text-white/70'
                    }`}
                  >
                    {player.position}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-white text-sm font-mono">
                  {formatMoney(player.guaranteedComp)}
                </td>
                <td className="px-3 py-2.5 text-white/70 text-sm font-mono">
                  {formatMoney(player.budgetCharge)}
                </td>
                <td className="px-3 py-2.5">
                  {player.isDesignatedPlayer ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                      DP
                    </span>
                  ) : player.isTAM ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      TAM
                    </span>
                  ) : (
                    <span className="text-xs text-white/30">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center text-white font-bold text-sm">
                  {player.stats.goals}
                </td>
                <td className="px-3 py-2.5 text-center text-white/80 text-sm">
                  {player.stats.assists}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="font-bold text-yellow-400 text-sm">{player.ga}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor(
                      player.valueScore
                    )}`}
                  >
                    {player.valueScore}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-white/60 text-sm font-mono">
                  {formatMoney(player.costPerGoal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-white/30">
        Showing {sorted.length} of {players.length} players · Click column headers to sort
      </div>
    </div>
  );
}
