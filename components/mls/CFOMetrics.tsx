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
import { MLSTeam, TeamFinancials } from '@/lib/mls/types';

interface CFOMetricsProps {
  team: MLSTeam;
  financials: TeamFinancials;
  allFinancials: TeamFinancials[];
  allTeams: MLSTeam[];
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

export default function CFOMetrics({ team, financials, allFinancials, allTeams }: CFOMetricsProps) {
  const leagueAvgPayroll =
    allFinancials.reduce((s, f) => s + f.totalPayroll, 0) / allFinancials.length;

  const leagueAvgValueRating =
    allFinancials.reduce((s, f) => s + f.valueRating, 0) / allFinancials.length;

  // Payroll comparison chart data
  const payrollData = allFinancials
    .map(f => ({
      name: allTeams.find(t => t.id === f.teamId)?.abbreviation || f.teamId,
      payroll: Math.round(f.totalPayroll / 1_000_000),
      isSelected: f.teamId === team.id,
    }))
    .sort((a, b) => b.payroll - a.payroll);

  // Value rating comparison
  const valueData = allFinancials
    .map(f => ({
      name: allTeams.find(t => t.id === f.teamId)?.abbreviation || f.teamId,
      value: parseFloat(f.valueRating.toFixed(2)),
      isSelected: f.teamId === team.id,
    }))
    .sort((a, b) => b.value - a.value);

  const costPerGoalFormatted =
    financials.costPerGoal > 0 ? formatMoney(financials.costPerGoal) : 'N/A';

  return (
    <div className="space-y-6">
      {/* Key metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          label="Total Payroll"
          value={formatMoney(financials.totalPayroll)}
          sub={`${financials.totalPayroll > leagueAvgPayroll ? '↑' : '↓'} vs $${(leagueAvgPayroll / 1_000_000).toFixed(1)}M league avg`}
          highlight={financials.totalPayroll > leagueAvgPayroll}
          color={team.primaryColor}
        />
        <MetricCard
          label="Cost per Goal"
          value={costPerGoalFormatted}
          sub={`Based on ${team.goalsFor} team goals`}
        />
        <MetricCard
          label="Cost per Point"
          value={formatMoney(financials.costPerPoint)}
          sub={`${team.standingsPoints} standings points`}
        />
        <MetricCard
          label="Payroll Rank"
          value={`#${financials.payrollRank}`}
          sub="in MLS (1 = highest)"
          highlight={financials.payrollRank <= 3}
        />
        <MetricCard
          label="Value Rating"
          value={`${financials.valueRating.toFixed(2)}`}
          sub={`G+A per $M | League avg: ${leagueAvgValueRating.toFixed(2)}`}
          highlight={financials.valueRating > leagueAvgValueRating}
          color={financials.valueRating > leagueAvgValueRating ? '#4ade80' : '#f87171'}
        />
        <MetricCard
          label="Payroll / Revenue"
          value={`${financials.payrollAsRevenuePct.toFixed(1)}%`}
          sub={`${formatMoney(financials.totalPayroll)} of est. revenue`}
        />
      </div>

      {/* DP breakdown */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
          Designated Player Breakdown
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
              {formatMoney(financials.dpCost - financials.dpCount * 683_750)}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-white/40">
          MLS absorbs salary above $683,750 cap charge for DPs. Teams only pay the cap hit.
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payroll comparison */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Payroll vs. League (in $M)
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payrollData} margin={{ left: -10, right: 4 }}>
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
                {payrollData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isSelected ? team.primaryColor : 'rgba(255,255,255,0.15)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Value rating comparison */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Value Rating (G+A per $M)
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={valueData} margin={{ left: -10, right: 4 }}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1f1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: 'white',
                }}
                formatter={(v: number) => [v.toFixed(2), 'G+A per $M']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {valueData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isSelected ? '#FACA15' : 'rgba(255,255,255,0.15)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TAM info */}
      {financials.tamPlayerCount > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
            TAM Allocation
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
            TAM players count against budget at their cap charge (max $683,750), not full salary.
          </p>
        </div>
      )}
    </div>
  );
}
