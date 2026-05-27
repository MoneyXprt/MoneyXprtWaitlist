'use client';

import { motion } from 'framer-motion';
import { MLSTeam } from '@/lib/mls/types';
import { TeamFinancials } from '@/lib/mls/types';

interface TeamWithFinancials {
  team: MLSTeam;
  financials: TeamFinancials;
}

interface TeamSelectorProps {
  teams: TeamWithFinancials[];
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function TeamSelector({ teams, selectedTeamId, onSelectTeam }: TeamSelectorProps) {
  const eastern = teams.filter(t => t.team.conference === 'Eastern');
  const western = teams.filter(t => t.team.conference === 'Western');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-yellow-400 mb-3">
          Eastern Conference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {eastern.map(({ team, financials }) => (
            <TeamCard
              key={team.id}
              team={team}
              financials={financials}
              isSelected={selectedTeamId === team.id}
              onSelect={() => onSelectTeam(team.id)}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-yellow-400 mb-3">
          Western Conference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {western.map(({ team, financials }) => (
            <TeamCard
              key={team.id}
              team={team}
              financials={financials}
              isSelected={selectedTeamId === team.id}
              onSelect={() => onSelectTeam(team.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamCard({
  team,
  financials,
  isSelected,
  onSelect,
}: {
  team: MLSTeam;
  financials: TeamFinancials;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative group w-full text-left rounded-xl p-4 border transition-all duration-200 ${
        isSelected
          ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/10'
          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
      }`}
      style={
        isSelected
          ? { boxShadow: `0 0 0 2px ${team.primaryColor}40, 0 4px 20px ${team.primaryColor}20` }
          : {}
      }
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: team.primaryColor }}
      />

      <div className="pt-1">
        {/* Abbreviation badge */}
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-black mb-2 text-white"
          style={{ backgroundColor: team.primaryColor }}
        >
          {team.abbreviation.slice(0, 2)}
        </div>

        <div className="font-semibold text-white text-sm leading-tight">
          {team.shortName}
        </div>
        <div className="text-xs text-white/50 mt-0.5">{team.city}</div>

        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Payroll</span>
            <span className="text-white font-medium">{formatMoney(financials.totalPayroll)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Record</span>
            <span className="text-white font-medium">
              {team.wins}W-{team.losses}L-{team.draws}D
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Points</span>
            <span className="text-yellow-400 font-bold">{team.standingsPoints} pts</span>
          </div>
        </div>

        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-center">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: team.primaryColor }}
          >
            {isSelected ? 'Selected' : 'Select for Analysis'}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
