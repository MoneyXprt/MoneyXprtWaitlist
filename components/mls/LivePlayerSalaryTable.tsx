'use client';

import { useState, useMemo } from 'react';
import type { EnrichedPlayer } from '@/lib/mls/types';

interface LivePlayerSalaryTableProps {
  players: EnrichedPlayer[];
  /** Whether players came from ESPN roster (true) or MLSPA salary data only (false) */
  isLiveRoster?: boolean;
}

type SortKey = 'name' | 'position' | 'guaranteedComp' | 'budgetCharge' | 'valueScore' | 'goals' | 'assists';

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return n > 0 ? `$${n}` : '—';
}

const POSITION_COLORS: Record<string, string> = {
  GK:  'bg-yellow-500/20 text-yellow-300',
  CB:  'bg-blue-500/20 text-blue-300',
  LB:  'bg-cyan-500/20 text-cyan-300',
  RB:  'bg-cyan-500/20 text-cyan-300',
  CDM: 'bg-purple-500/20 text-purple-300',
  CM:  'bg-indigo-500/20 text-indigo-300',
  CAM: 'bg-pink-500/20 text-pink-300',
  LW:  'bg-orange-500/20 text-orange-300',
  RW:  'bg-orange-500/20 text-orange-300',
  ST:  'bg-red-500/20 text-red-300',
  LM:  'bg-emerald-500/20 text-emerald-300',
  RM:  'bg-emerald-500/20 text-emerald-300',
  MF:  'bg-white/10 text-white/60',
  D:   'bg-blue-500/20 text-blue-300',
  F:   'bg-red-500/20 text-red-300',
};

export default function LivePlayerSalaryTable({ players, isLiveRoster = false }: LivePlayerSalaryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('guaranteedComp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dp' | 'tam' | 'salary'>('salary');
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    let list = [...players];

    // Apply type filter
    if (typeFilter === 'dp') list = list.filter(p => p.isDesignatedPlayer);
    else if (typeFilter === 'tam') list = list.filter(p => p.isTAM && !p.isDesignatedPlayer);
    else if (typeFilter === 'salary') list = list.filter(p => p.guaranteedComp > 0);

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q));
    }

    return list.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === 'name') { av = a.name; bv = b.name; }
      else if (sortKey === 'position') { av = a.position; bv = b.position; }
      else if (sortKey === 'guaranteedComp') { av = a.guaranteedComp; bv = b.guaranteedComp; }
      else if (sortKey === 'budgetCharge') { av = a.budgetCharge; bv = b.budgetCharge; }
      else if (sortKey === 'valueScore') { av = a.valueScore; bv = b.valueScore; }
      else if (sortKey === 'goals') { av = a.stats.goals; bv = b.stats.goals; }
      else if (sortKey === 'assists') { av = a.stats.assists; bv = b.stats.assists; }

      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [players, sortKey, sortDir, typeFilter, search]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const Th = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors ${
        sortKey === col ? 'text-yellow-400' : 'text-white/50 hover:text-white/80'
      }`}
      onClick={() => toggleSort(col)}
    >
      {label}{sortKey === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
    </th>
  );

  const dpCount = players.filter(p => p.isDesignatedPlayer).length;
  const salaryCount = players.filter(p => p.guaranteedComp > 0).length;
  const totalPayroll = players.filter(p => p.guaranteedComp > 0).reduce((s, p) => s + p.guaranteedComp, 0);

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="text-white/50">
          <span className="text-yellow-400 font-bold">{dpCount}</span> DPs
        </span>
        <span className="text-white/50">
          <span className="text-blue-400 font-bold">{players.filter(p => p.isTAM).length}</span> TAM
        </span>
        <span className="text-white/50">
          <span className="text-emerald-400 font-bold">{salaryCount}</span> with salary data
        </span>
        {totalPayroll > 0 && (
          <span className="text-white/50">
            Total: <span className="text-white font-bold">${(totalPayroll / 1_000_000).toFixed(2)}M</span>
          </span>
        )}
        {isLiveRoster && (
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ESPN Roster
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1">
          {(['salary', 'all', 'dp', 'tam'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === f
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {f === 'salary' ? 'With Salary' : f === 'all' ? 'All' : f.toUpperCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[120px] max-w-[200px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-yellow-400/40"
        />
        <span className="ml-auto text-xs text-white/30">{sorted.length} players</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <Th col="name" label="Player" />
              <Th col="position" label="Pos" />
              <Th col="guaranteedComp" label="Salary" />
              <Th col="budgetCharge" label="Cap Charge" />
              <Th col="goals" label="G" />
              <Th col="assists" label="A" />
              <Th col="valueScore" label="Score" />
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-white/50">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map(p => (
              <tr key={p.espnId} className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="font-medium text-white text-sm">{p.name}</div>
                  {p.age && <div className="text-xs text-white/30">Age {p.age}</div>}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${POSITION_COLORS[p.position] ?? 'bg-white/10 text-white/60'}`}>
                    {p.position}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sm font-mono text-white">
                  {p.guaranteedComp > 0 ? formatMoney(p.guaranteedComp) : <span className="text-white/25">—</span>}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono text-emerald-400">
                  {p.budgetCharge > 0 ? formatMoney(p.budgetCharge) : <span className="text-white/25">—</span>}
                </td>
                <td className="px-3 py-2.5 text-sm text-white/70 text-center">
                  {p.stats.goals}
                </td>
                <td className="px-3 py-2.5 text-sm text-white/70 text-center">
                  {p.stats.assists}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {p.valueScore > 0 ? (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      p.valueScore >= 60 ? 'bg-emerald-500/20 text-emerald-400' :
                      p.valueScore >= 30 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {p.valueScore}
                    </span>
                  ) : <span className="text-white/20 text-xs">—</span>}
                </td>
                <td className="px-3 py-2.5 space-x-1">
                  {p.isDesignatedPlayer && (
                    <span className="text-xs bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded font-semibold">DP</span>
                  )}
                  {p.isTAM && !p.isDesignatedPlayer && (
                    <span className="text-xs bg-blue-400/20 text-blue-300 px-1.5 py-0.5 rounded font-semibold">TAM</span>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-white/30 text-sm">
                  No players found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/30">
        Salary: 2026 MLSPA disclosure (matched by name). Stats: live ESPN roster (may be 0 early season).
        Players without salary match show $0 — on roster but not in MLSPA dataset.
      </p>
    </div>
  );
}
