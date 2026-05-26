'use client';

import { motion } from 'framer-motion';
import type { LiveTeamData } from '@/lib/mls/types';

// Static team metadata (colors, cities) keyed by ESPN ID
const TEAM_META: Record<string, {
  primaryColor: string;
  secondaryColor: string;
  city: string;
  slug: string;
  shortName: string;
}> = {
  '17362': { primaryColor: '#F7B5CD', secondaryColor: '#000000', city: 'Fort Lauderdale', slug: 'inter-miami', shortName: 'Inter Miami' },
  '396':   { primaryColor: '#00245D', secondaryColor: '#FFD700', city: 'Carson',         slug: 'la-galaxy',       shortName: 'LA Galaxy' },
  '18966': { primaryColor: '#000000', secondaryColor: '#C39E6D', city: 'Los Angeles',     slug: 'lafc',             shortName: 'LAFC' },
  '9726':  { primaryColor: '#5D9741', secondaryColor: '#003087', city: 'Seattle',         slug: 'seattle-sounders', shortName: 'Seattle' },
  '18486': { primaryColor: '#80000A', secondaryColor: '#A19060', city: 'Atlanta',         slug: 'atlanta-united',   shortName: 'Atlanta Utd' },
  '6808':  { primaryColor: '#004812', secondaryColor: '#EBE72B', city: 'Portland',        slug: 'portland-timbers', shortName: 'Portland' },
  '18858': { primaryColor: '#003087', secondaryColor: '#FE5000', city: 'Cincinnati',      slug: 'fc-cincinnati',    shortName: 'FC Cincinnati' },
  '754':   { primaryColor: '#FEDA00', secondaryColor: '#000000', city: 'Columbus',        slug: 'columbus-crew',    shortName: 'Columbus' },
  '928':   { primaryColor: '#C63323', secondaryColor: '#00245E', city: 'Boston',          slug: 'new-england-revolution', shortName: 'New England' },
  '18396': { primaryColor: '#6CACE4', secondaryColor: '#003DA5', city: 'New York',        slug: 'nycfc',            shortName: 'NYCFC' },
};

interface LiveStandingEntry extends LiveTeamData {
  slug: string;
  totalPayroll: number;
  dpCount: number;
  dpCost: number;
}

interface LiveTeamSelectorProps {
  standings: LiveStandingEntry[];
  selectedTeamId: string | null;
  onSelectTeam: (slug: string) => void;
  lastUpdated?: string;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return n > 0 ? `$${n}` : '—';
}

export default function LiveTeamSelector({ standings, selectedTeamId, onSelectTeam, lastUpdated }: LiveTeamSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Live badge */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Data — ESPN
        </span>
        {lastUpdated && (
          <span className="text-xs text-white/30">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {standings.map(team => {
          const meta = TEAM_META[team.espnId];
          const primaryColor = meta?.primaryColor ?? '#00b86e';
          const isSelected = selectedTeamId === team.slug;

          return (
            <motion.button
              key={team.espnId}
              onClick={() => onSelectTeam(team.slug)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative group w-full text-left rounded-xl p-3 border transition-all duration-200 ${
                isSelected
                  ? 'border-yellow-400 bg-yellow-400/10 shadow-lg'
                  : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
              }`}
            >
              {/* Color accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="pt-1">
                {/* Standing badge + abbreviation */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-white/30">#{team.position || '—'}</span>
                  <span
                    className="text-xs font-black px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {team.abbreviation}
                  </span>
                </div>

                <div className="font-semibold text-white text-xs leading-tight">
                  {meta?.shortName ?? team.name}
                </div>
                <div className="text-xs text-white/40 mt-0.5">{meta?.city ?? ''}</div>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Record</span>
                    <span className="text-white font-medium">
                      {team.wins}-{team.losses}-{team.draws}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Points</span>
                    <span className="text-yellow-400 font-bold">{team.points}</span>
                  </div>
                  {team.totalPayroll > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Payroll</span>
                      <span className="text-emerald-400 font-medium">{formatMoney(team.totalPayroll)}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
