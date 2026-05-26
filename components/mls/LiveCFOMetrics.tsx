'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { LiveTeamData, TeamFinancials } from '@/lib/mls/types';

interface LiveCFOMetricsProps {
  team: LiveTeamData;
  financials: TeamFinancials;
  /** All team payrolls for league comparison (slug -> payroll) */
  allPayrolls?: { name: string; abbreviation: string; payroll: number; isSelected: boolean }[];
  primaryColor?: string;
}

function formatMoney(n: number, decimals = 1): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(decimals)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function MetricCard({
  label,
  value,
  sub,
  highlight = false,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border ${
        highlight ? 'border-yellow-400/40 bg-yellow-400/5' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{label}</div>
      <div
        className="text-2xl font-black"
        style={{ color: color || (highlight ? '#FACA15' : 'white') }}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
    </motion.div>
  );
}

export default function LiveCFOMetrics({ team, financials, allPayrolls, primaryColor = '#00b86e' }: LiveCFOMetricsProps) {
  const costPerPointFormatted = financials.costPerPoint > 0 ? formatMoney(financials.costPerPoint) : 'N/A';
  const costPerGoalFormatted = financials.costPerGoal > 0 ? formatMoney(financials.costPerGoal) : 'N/A';

  const payrollChartData = allPayrolls
    ? [...allPayrolls].sort((a, b) => b.payroll - a.payroll).map(t => ({
        name: t.abbreviation,
        payroll: Math.round(t.payroll / 1_000_000),
        isSelected: t.isSelected,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Live standings bar */}
      <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live ESPN Standings
        </span>
        <span className="text-white font-bold">{team.name}</span>
        <span className="text-white/60 text-sm">
          {team.wins}W-{team.losses}L-{team.draws}D &bull; {team.points} pts
        </span>
        <span className="text-white/40 text-xs ml-auto">
          {team.goalsFor}GF / {team.goalsAgainst}GA
        </span>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          label="Total Payroll"
          value={formatMoney(financials.totalPayroll)}
          sub="2025 MLSPA Disclosure"
          color={primaryColor}
        />
        <MetricCard
          label="Cost per Point"
          value={costPerPointFormatted}
          sub={`${team.points} standings pts · live`}
        />
        <MetricCard
          label="Cost per Goal"
          value={costPerGoalFormatted}
          sub={`${team.goalsFor} goals scored`}
        />
        <MetricCard
          label="Payroll Rank"
          value={`#${financials.payrollRank}`}
          sub="in MLS (1 = highest)"
          highlight={financials.payrollRank <= 3}
        />
        <MetricCard
          label="Value Rating"
          value={financials.valueRating.toFixed(2)}
          sub="G+A per $M (early season — will grow)"
          highlight={financials.valueRating > 2}
          color={financials.valueRating > 2 ? '#4ade80' : '#f87171'}
        />
        <MetricCard
          label="Payroll / Revenue"
          value={`${financials.payrollAsRevenuePct.toFixed(1)}%`}
          sub="of estimated 2025 revenue"
        />
      </div>

      {/* DP Breakdown */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
          Designated Player Breakdown — 2025
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-white/50 mb-1">DP Count</div>
            <div className="text-3xl font-black text-yellow-400">{financials.dpCount}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Actual DP Cost</div>
            <div className="text-xl font-bold text-white">{formatMoney(financials.dpCost)}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">DP Cap Charge</div>
            <div className="text-xl font-bold text-green-400">
              {formatMoney(financials.dpCount * 683_750)}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">League Subsidy</div>
            <div className="text-xl font-bold text-emerald-400">
              {formatMoney(Math.max(0, financials.dpCost - financials.dpCount * 683_750))}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-white/40">
          MLS absorbs salary above $683,750 cap charge for DPs. Teams only pay the cap hit.
        </div>
      </div>

      {/* Payroll comparison chart */}
      {payrollChartData.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Payroll vs. Featured MLS Clubs (in $M)
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payrollChartData} margin={{ left: -10, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1f1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: 'white',
                }}
                formatter={(v: number) => [`$${v}M`, 'Payroll']}
              />
              <Bar dataKey="payroll" radius={[4, 4, 0, 0]}>
                {payrollChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isSelected ? primaryColor : 'rgba(255,255,255,0.15)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TAM info */}
      {financials.tamPlayerCount > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
            TAM Allocation — 2025
          </h4>
          <div className="flex gap-6">
            <div>
              <div className="text-xs text-white/50">TAM Players</div>
              <div className="text-2xl font-bold text-white">{financials.tamPlayerCount}</div>
            </div>
            <div>
              <div className="text-xs text-white/50">Total TAM Spend</div>
              <div className="text-2xl font-bold text-white">{formatMoney(financials.tamCost)}</div>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-2">
            TAM players count against the budget at cap charge (max $683,750), not full salary.
          </p>
        </div>
      )}
    </div>
  );
}
