'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MLSPlayer } from '@/lib/mls/types';
import { getOptimalLineup, calculatePlayerValueScore, getBestValuePlayers, getOverpaidPlayers } from '@/lib/mls/analytics';

interface LineupOptimizerProps {
  players: MLSPlayer[];
  teamColor: string;
}

function formatSalary(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// Formation rows for 4-3-3 (field shown top = attack, bottom = defense)
const FORMATION_ROWS = [
  { label: 'Attack', keys: ['LW', 'ST', 'RW'], slots: ['LW', 'ST', 'RW'] },
  { label: 'Midfield', keys: ['CDM', 'CM1', 'CM2'], slots: ['CDM', 'CM', 'CM'] },
  { label: 'Defense', keys: ['LB', 'CB1', 'CB2', 'RB'], slots: ['LB', 'CB', 'CB', 'RB'] },
  { label: 'Keeper', keys: ['GK'], slots: ['GK'] },
];

const SLOT_ORDER = ['GK', 'RB', 'CB1', 'CB2', 'LB', 'CDM', 'CM1', 'CM2', 'RW', 'ST', 'LW'];

function PlayerNode({
  player,
  teamColor,
  index,
}: {
  player: MLSPlayer;
  teamColor: string;
  index: number;
}) {
  const score = calculatePlayerValueScore(player);
  const borderColor = score >= 70 ? '#4ade80' : score >= 50 ? '#FACA15' : '#f87171';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col items-center gap-1 group"
    >
      {/* Circle node */}
      <div
        className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 shadow-lg"
        style={{
          backgroundColor: teamColor,
          borderColor: borderColor,
          boxShadow: `0 0 12px ${borderColor}40`,
        }}
      >
        <span className="text-center leading-tight">{player.position}</span>
      </div>
      {/* Name */}
      <div className="text-center max-w-[80px]">
        <div className="text-white text-xs font-semibold leading-tight truncate w-full text-center">
          {player.name.split(' ').pop()}
        </div>
        <div className="text-yellow-400 text-xs font-bold">
          {player.stats.goals}G {player.stats.assists}A
        </div>
        <div
          className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: teamColor }}
        >
          {formatSalary(player.budgetCharge)}
        </div>
      </div>
    </motion.div>
  );
}

export default function LineupOptimizer({ players, teamColor }: LineupOptimizerProps) {
  const lineup = useMemo(() => getOptimalLineup(players), [players]);
  const bestValue = useMemo(() => getBestValuePlayers(players, 3), [players]);
  const overpaid = useMemo(() => getOverpaidPlayers(players), [players]);

  // Map slot keys to players from lineup
  // lineup order: GK, RB, CB1, CB2, LB, CDM, CM1, CM2, RW, ST, LW (per SLOT_ORDER)
  const slotMap: Record<string, MLSPlayer | null> = {};
  SLOT_ORDER.forEach((key, i) => {
    slotMap[key] = lineup[i] || null;
  });

  const totalLineupSalary = lineup.reduce((s, p) => s + p.guaranteedComp, 0);
  const totalLineupCapCharge = lineup.reduce((s, p) => s + p.budgetCharge, 0);
  const totalGA = lineup.reduce((s, p) => s + p.stats.goals + p.stats.assists, 0);

  // Build display rows
  const displayRows: Array<{ label: string; players: (MLSPlayer | null)[] }> = [
    {
      label: 'Attack',
      players: [slotMap['LW'], slotMap['ST'], slotMap['RW']].filter(Boolean) as MLSPlayer[],
    },
    {
      label: 'Midfield',
      players: [slotMap['CDM'], slotMap['CM1'], slotMap['CM2']].filter(Boolean) as MLSPlayer[],
    },
    {
      label: 'Defense',
      players: [slotMap['LB'], slotMap['CB1'], slotMap['CB2'], slotMap['RB']].filter(Boolean) as MLSPlayer[],
    },
    {
      label: 'Keeper',
      players: [slotMap['GK']].filter(Boolean) as MLSPlayer[],
    },
  ];

  let nodeIndex = 0;

  return (
    <div className="space-y-6">
      {/* Soccer field */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        {/* Field background */}
        <div
          className="relative w-full"
          style={{
            background: 'linear-gradient(to bottom, #1a4a2e 0%, #1f5c35 30%, #1a4a2e 50%, #1f5c35 70%, #1a4a2e 100%)',
            minHeight: 420,
          }}
        >
          {/* Field markings */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/20" />
            {/* Center line */}
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white/20" />
            {/* Penalty area top */}
            <div className="absolute top-4 left-1/4 right-1/4 h-16 border border-white/15 border-t-0" style={{ top: 8 }} />
            {/* Penalty area bottom */}
            <div className="absolute bottom-4 left-1/4 right-1/4 h-16 border border-white/15 border-b-0" />
          </div>

          {/* Player rows */}
          <div className="relative z-10 flex flex-col justify-between h-full py-6 gap-2">
            {displayRows.map((row, ri) => (
              <div key={row.label} className="flex items-center justify-around px-4">
                {row.players.map(player => {
                  if (!player) return null;
                  const idx = nodeIndex++;
                  return (
                    <PlayerNode
                      key={player.id}
                      player={player}
                      teamColor={teamColor}
                      index={idx}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CFO Lineup Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xs text-white/50 uppercase tracking-wider">Lineup Salary</div>
          <div className="text-xl font-black text-white mt-1">{formatSalary(totalLineupSalary)}</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xs text-white/50 uppercase tracking-wider">Cap Charge</div>
          <div className="text-xl font-black text-yellow-400 mt-1">{formatSalary(totalLineupCapCharge)}</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xs text-white/50 uppercase tracking-wider">Combined G+A</div>
          <div className="text-xl font-black text-green-400 mt-1">{totalGA}</div>
        </div>
      </div>

      {/* CFO Recommendation */}
      <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
        <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">
          CFO Recommendation
        </h4>
        <p className="text-sm text-white/80 leading-relaxed mb-3">
          This optimal 11 is selected by maximizing performance output per dollar of cap charge.
          The lineup scores players using a composite formula:{' '}
          <span className="font-mono text-yellow-400 text-xs">
            (Goals×3 + Assists×2 + KeyPasses×0.5 + Tackles×0.3) / Cap_Charge_$M
          </span>
        </p>

        {bestValue.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Top Value Picks</div>
            <div className="space-y-1">
              {bestValue.slice(0, 3).map(p => (
                <div key={p.id} className="flex justify-between text-xs">
                  <span className="text-white">
                    {p.name} ({p.position})
                  </span>
                  <span className="text-green-400 font-semibold">
                    {p.stats.goals}G/{p.stats.assists}A at {formatSalary(p.budgetCharge)} cap charge
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {overpaid.length > 0 && (
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">
              Capital Efficiency Concerns
            </div>
            <div className="space-y-1">
              {overpaid.slice(0, 2).map(({ player, overpayCost }) => (
                <div key={player.id} className="flex justify-between text-xs">
                  <span className="text-white/70">{player.name}</span>
                  <span className="text-red-400 font-semibold">
                    Est. overpay: {formatSalary(overpayCost)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lineup detail table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px]">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left text-xs text-white/50 uppercase tracking-wider">Player</th>
              <th className="px-3 py-2 text-left text-xs text-white/50 uppercase tracking-wider">Pos</th>
              <th className="px-3 py-2 text-right text-xs text-white/50 uppercase tracking-wider">Salary</th>
              <th className="px-3 py-2 text-right text-xs text-white/50 uppercase tracking-wider">Cap</th>
              <th className="px-3 py-2 text-center text-xs text-white/50 uppercase tracking-wider">G+A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lineup.map(player => (
              <tr key={player.id} className="hover:bg-white/5">
                <td className="px-3 py-2 text-white text-sm font-medium">{player.name}</td>
                <td className="px-3 py-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                    {player.position}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-white/80 text-sm font-mono">
                  {formatSalary(player.guaranteedComp)}
                </td>
                <td className="px-3 py-2 text-right text-yellow-400 text-sm font-mono">
                  {formatSalary(player.budgetCharge)}
                </td>
                <td className="px-3 py-2 text-center text-green-400 font-bold text-sm">
                  {player.stats.goals + player.stats.assists}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
