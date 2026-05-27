'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LiveTeamData } from '@/lib/mls/types';

// Static team metadata (colors, cities) keyed by ESPN ID
const TEAM_META: Record<string, {
  primaryColor: string;
  secondaryColor: string;
  city: string;
  slug: string;
  shortName: string;
  conference: 'Eastern' | 'Western';
}> = {
  // Eastern
  '17362': { primaryColor: '#F7B5CD', secondaryColor: '#000000', city: 'Fort Lauderdale', slug: 'inter-miami',            shortName: 'Inter Miami',    conference: 'Eastern' },
  '18486': { primaryColor: '#80000A', secondaryColor: '#A19060', city: 'Atlanta',         slug: 'atlanta-united',         shortName: 'Atlanta Utd',    conference: 'Eastern' },
  '18858': { primaryColor: '#003087', secondaryColor: '#FE5000', city: 'Cincinnati',      slug: 'fc-cincinnati',          shortName: 'FC Cincinnati',  conference: 'Eastern' },
  '18396': { primaryColor: '#6CACE4', secondaryColor: '#003DA5', city: 'New York',        slug: 'nycfc',                  shortName: 'NYCFC',          conference: 'Eastern' },
  '754':   { primaryColor: '#FEDA00', secondaryColor: '#000000', city: 'Columbus',        slug: 'columbus-crew',          shortName: 'Columbus',       conference: 'Eastern' },
  '399':   { primaryColor: '#D4021D', secondaryColor: '#FFCB05', city: 'Harrison, NJ',   slug: 'new-york-red-bulls',     shortName: 'NY Red Bulls',   conference: 'Eastern' },
  '18058': { primaryColor: '#071B2C', secondaryColor: '#B19B69', city: 'Chester, PA',    slug: 'philadelphia-union',     shortName: 'Philadelphia',   conference: 'Eastern' },
  '22502': { primaryColor: '#ECE83A', secondaryColor: '#1F1646', city: 'Nashville',      slug: 'nashville-sc',           shortName: 'Nashville SC',   conference: 'Eastern' },
  '22403': { primaryColor: '#1A85C8', secondaryColor: '#C8A84B', city: 'Charlotte',      slug: 'charlotte-fc',           shortName: 'Charlotte FC',   conference: 'Eastern' },
  '928':   { primaryColor: '#C63323', secondaryColor: '#00245E', city: 'Boston',         slug: 'new-england-revolution', shortName: 'New England',    conference: 'Eastern' },
  '5526':  { primaryColor: '#B81137', secondaryColor: '#FFFFFF', city: 'Toronto',        slug: 'toronto-fc',             shortName: 'Toronto FC',     conference: 'Eastern' },
  '18887': { primaryColor: '#633492', secondaryColor: '#FDE192', city: 'Orlando',        slug: 'orlando-city',           shortName: 'Orlando City',   conference: 'Eastern' },
  '256':   { primaryColor: '#000000', secondaryColor: '#EF3E42', city: 'Washington DC',  slug: 'dc-united',              shortName: 'DC United',      conference: 'Eastern' },
  '1930':  { primaryColor: '#003DA5', secondaryColor: '#FFFFFF', city: 'Montreal',       slug: 'cf-montreal',            shortName: 'CF Montréal',    conference: 'Eastern' },
  '674':   { primaryColor: '#C63323', secondaryColor: '#FFFFFF', city: 'Chicago',        slug: 'chicago-fire',           shortName: 'Chicago Fire',   conference: 'Eastern' },
  // Western
  '18966': { primaryColor: '#000000', secondaryColor: '#C39E6D', city: 'Los Angeles',    slug: 'lafc',                   shortName: 'LAFC',           conference: 'Western' },
  '396':   { primaryColor: '#00245D', secondaryColor: '#FFD700', city: 'Carson, CA',     slug: 'la-galaxy',              shortName: 'LA Galaxy',      conference: 'Western' },
  '6808':  { primaryColor: '#004812', secondaryColor: '#EBE72B', city: 'Portland',       slug: 'portland-timbers',       shortName: 'Portland',       conference: 'Western' },
  '22500': { primaryColor: '#00B140', secondaryColor: '#000000', city: 'Austin',         slug: 'austin-fc',              shortName: 'Austin FC',      conference: 'Western' },
  '23213': { primaryColor: '#022169', secondaryColor: '#E31837', city: 'San Diego',      slug: 'san-diego-fc',           shortName: 'San Diego FC',   conference: 'Western' },
  '265':   { primaryColor: '#002B5C', secondaryColor: '#93B3D8', city: 'Kansas City',   slug: 'sporting-kc',            shortName: 'Sporting KC',    conference: 'Western' },
  '18979': { primaryColor: '#8CD2F4', secondaryColor: '#231F20', city: 'Minneapolis',   slug: 'minnesota-united',       shortName: 'Minnesota Utd',  conference: 'Western' },
  '9726':  { primaryColor: '#5D9741', secondaryColor: '#003087', city: 'Seattle',        slug: 'seattle-sounders',       shortName: 'Seattle',        conference: 'Western' },
  '255':   { primaryColor: '#960A2C', secondaryColor: '#96CDFF', city: 'Denver',         slug: 'colorado-rapids',        shortName: 'Colorado',       conference: 'Western' },
  '11408': { primaryColor: '#FF6B00', secondaryColor: '#00853E', city: 'Houston',        slug: 'houston-dynamo',         shortName: 'Houston Dynamo', conference: 'Western' },
  '17209': { primaryColor: '#00245E', secondaryColor: '#9DC2EA', city: 'Vancouver',      slug: 'vancouver-whitecaps',    shortName: 'Vancouver',      conference: 'Western' },
  '11120': { primaryColor: '#B30838', secondaryColor: '#013474', city: 'Sandy, UT',      slug: 'real-salt-lake',         shortName: 'Real Salt Lake', conference: 'Western' },
  '6977':  { primaryColor: '#E81F3E', secondaryColor: '#0B2240', city: 'Frisco, TX',    slug: 'fc-dallas',              shortName: 'FC Dallas',      conference: 'Western' },
  '23197': { primaryColor: '#C8102E', secondaryColor: '#003087', city: 'St. Louis',      slug: 'st-louis-city',          shortName: 'St. Louis City', conference: 'Western' },
  '279':   { primaryColor: '#0D4C8B', secondaryColor: '#FFFFFF', city: 'San Jose',       slug: 'san-jose-earthquakes',   shortName: 'San Jose',       conference: 'Western' },
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
  const [conferenceFilter, setConferenceFilter] = useState<'All' | 'Eastern' | 'Western'>('All');

  const filtered = standings.filter(team => {
    if (conferenceFilter === 'All') return true;
    return TEAM_META[team.espnId]?.conference === conferenceFilter;
  });

  return (
    <div className="space-y-4">
      {/* Live badge + conference filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Data — ESPN
        </span>
        {lastUpdated && (
          <span className="text-xs text-white/30">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        <div className="ml-auto flex gap-1">
          {(['All', 'Eastern', 'Western'] as const).map(c => (
            <button
              key={c}
              onClick={() => setConferenceFilter(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                conferenceFilter === c
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {filtered.map(team => {
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
