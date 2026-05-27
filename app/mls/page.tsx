'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LiveTeamData, TeamFinancials, EnrichedPlayer, ESPNPlayerStats } from '@/lib/mls/types';
import LiveTeamSelector from '@/components/mls/LiveTeamSelector';
import LiveCFOMetrics from '@/components/mls/LiveCFOMetrics';
import LivePlayerSalaryTable from '@/components/mls/LivePlayerSalaryTable';
import LiveSocialPostGenerator from '@/components/mls/LiveSocialPostGenerator';

// Static team metadata
const TEAM_META: Record<string, { primaryColor: string; slug: string; shortName: string; city: string }> = {
  // Eastern
  '17362': { primaryColor: '#F7B5CD', slug: 'inter-miami',            shortName: 'Inter Miami',    city: 'Fort Lauderdale' },
  '18486': { primaryColor: '#80000A', slug: 'atlanta-united',         shortName: 'Atlanta United', city: 'Atlanta' },
  '18858': { primaryColor: '#003087', slug: 'fc-cincinnati',          shortName: 'FC Cincinnati',  city: 'Cincinnati' },
  '18396': { primaryColor: '#6CACE4', slug: 'nycfc',                  shortName: 'NYCFC',          city: 'New York' },
  '754':   { primaryColor: '#FEDA00', slug: 'columbus-crew',          shortName: 'Columbus Crew',  city: 'Columbus' },
  '399':   { primaryColor: '#D4021D', slug: 'new-york-red-bulls',     shortName: 'NY Red Bulls',   city: 'Harrison, NJ' },
  '18058': { primaryColor: '#071B2C', slug: 'philadelphia-union',     shortName: 'Philadelphia',   city: 'Chester, PA' },
  '22502': { primaryColor: '#ECE83A', slug: 'nashville-sc',           shortName: 'Nashville SC',   city: 'Nashville' },
  '22403': { primaryColor: '#1A85C8', slug: 'charlotte-fc',           shortName: 'Charlotte FC',   city: 'Charlotte' },
  '928':   { primaryColor: '#C63323', slug: 'new-england-revolution', shortName: 'New England',    city: 'Boston' },
  '5526':  { primaryColor: '#B81137', slug: 'toronto-fc',             shortName: 'Toronto FC',     city: 'Toronto' },
  '18887': { primaryColor: '#633492', slug: 'orlando-city',           shortName: 'Orlando City',   city: 'Orlando' },
  '256':   { primaryColor: '#000000', slug: 'dc-united',              shortName: 'DC United',      city: 'Washington DC' },
  '1930':  { primaryColor: '#003DA5', slug: 'cf-montreal',            shortName: 'CF Montréal',    city: 'Montreal' },
  '674':   { primaryColor: '#C63323', slug: 'chicago-fire',           shortName: 'Chicago Fire',   city: 'Chicago' },
  // Western
  '18966': { primaryColor: '#000000', slug: 'lafc',                   shortName: 'LAFC',           city: 'Los Angeles' },
  '396':   { primaryColor: '#00245D', slug: 'la-galaxy',              shortName: 'LA Galaxy',      city: 'Carson, CA' },
  '6808':  { primaryColor: '#004812', slug: 'portland-timbers',       shortName: 'Portland',       city: 'Portland' },
  '22500': { primaryColor: '#00B140', slug: 'austin-fc',              shortName: 'Austin FC',      city: 'Austin' },
  '23213': { primaryColor: '#022169', slug: 'san-diego-fc',           shortName: 'San Diego FC',   city: 'San Diego' },
  '265':   { primaryColor: '#002B5C', slug: 'sporting-kc',            shortName: 'Sporting KC',    city: 'Kansas City' },
  '18979': { primaryColor: '#8CD2F4', slug: 'minnesota-united',       shortName: 'Minnesota Utd',  city: 'Minneapolis' },
  '9726':  { primaryColor: '#5D9741', slug: 'seattle-sounders',       shortName: 'Seattle',        city: 'Seattle' },
  '255':   { primaryColor: '#960A2C', slug: 'colorado-rapids',        shortName: 'Colorado',       city: 'Denver' },
  '11408': { primaryColor: '#FF6B00', slug: 'houston-dynamo',         shortName: 'Houston Dynamo', city: 'Houston' },
  '17209': { primaryColor: '#00245E', slug: 'vancouver-whitecaps',    shortName: 'Vancouver',      city: 'Vancouver' },
  '11120': { primaryColor: '#B30838', slug: 'real-salt-lake',         shortName: 'Real Salt Lake', city: 'Sandy, UT' },
  '6977':  { primaryColor: '#E81F3E', slug: 'fc-dallas',              shortName: 'FC Dallas',      city: 'Frisco, TX' },
  '23197': { primaryColor: '#C8102E', slug: 'st-louis-city',          shortName: 'St. Louis City', city: 'St. Louis' },
  '279':   { primaryColor: '#0D4C8B', slug: 'san-jose-earthquakes',   shortName: 'San Jose',       city: 'San Jose' },
};

type StandingEntry = LiveTeamData & {
  slug: string;
  totalPayroll: number;
  dpCount: number;
  dpCost: number;
};

type Tab = 'overview' | 'players' | 'social';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'CFO Overview' },
  { id: 'players',  label: 'Player Salaries' },
  { id: 'social',   label: 'Social Posts' },
];

const EMPTY_STATS: ESPNPlayerStats = { goals: 0, assists: 0, gamesPlayed: 0, minutesPlayed: 0, shots: 0, shotsOnTarget: 0, passAccuracy: 0 };

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function MLSPage() {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Per-team data loaded on demand
  const [teamData, setTeamData] = useState<{ team: LiveTeamData; financials: TeamFinancials } | null>(null);
  const [rosterPlayers, setRosterPlayers] = useState<EnrichedPlayer[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);

  // Load live standings on mount
  useEffect(() => {
    let cancelled = false;
    setStandingsLoading(true);
    fetch('/api/mls/standings')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.standings) {
          // Assign position numbers
          const sorted = [...data.standings].sort((a: StandingEntry, b: StandingEntry) => b.points - a.points);
          sorted.forEach((s: StandingEntry, i: number) => { s.position = i + 1; });
          setStandings(sorted);
          setLastUpdated(data.lastUpdated);
        } else {
          setStandingsError(data.error ?? 'Failed to load standings');
        }
      })
      .catch(e => { if (!cancelled) setStandingsError(e.message); })
      .finally(() => { if (!cancelled) setStandingsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Load team + roster when slug changes
  const loadTeamData = useCallback(async (slug: string) => {
    setTeamLoading(true);
    setTeamData(null);
    setRosterPlayers([]);

    try {
      const [teamRes, rosterRes] = await Promise.all([
        fetch(`/api/mls/team/${slug}`),
        fetch(`/api/mls/roster/${slug}`),
      ]);

      if (teamRes.ok) {
        const t = await teamRes.json();
        setTeamData({ team: t.team, financials: t.financials });
      }

      if (rosterRes.ok) {
        const r = await rosterRes.json();
        setRosterPlayers(r.players ?? []);
      }
    } catch (_e) {
      // silently fallback
    } finally {
      setTeamLoading(false);
    }
  }, []);

  function handleSelectTeam(slug: string) {
    if (selectedSlug === slug) return;
    setSelectedSlug(slug);
    setActiveTab('overview');
    loadTeamData(slug);
  }

  const selectedStanding = useMemo(
    () => standings.find(s => s.slug === selectedSlug) ?? null,
    [standings, selectedSlug]
  );

  const selectedEspnId = useMemo(
    () => selectedStanding?.espnId ?? null,
    [selectedStanding]
  );

  const primaryColor = selectedEspnId ? (TEAM_META[selectedEspnId]?.primaryColor ?? '#00b86e') : '#00b86e';

  // Build payroll comparison for charts
  const allPayrollsForChart = useMemo(() =>
    standings.map(s => ({
      name: s.name,
      abbreviation: s.abbreviation,
      payroll: s.totalPayroll,
      isSelected: s.slug === selectedSlug,
    })),
    [standings, selectedSlug]
  );

  // Fallback players from salary data embedded in standings
  const fallbackPlayers: EnrichedPlayer[] = useMemo(() => {
    if (!selectedStanding) return [];
    // Build from standings' totalPayroll context - limited info
    return [];
  }, [selectedStanding]);

  const displayPlayers = rosterPlayers.length > 0 ? rosterPlayers : fallbackPlayers;

  // League stats from standings
  const leagueStats = useMemo(() => {
    const totalPayroll = standings.reduce((s, t) => s + t.totalPayroll, 0);
    const totalDPs = standings.reduce((s, t) => s + t.dpCount, 0);
    return { totalPayroll, totalDPs };
  }, [standings]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a1a14 0%, #0d2018 40%, #0a1a14 100%)' }}>
      {/* Nav */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-white/50 hover:text-white/80 text-sm transition-colors">
            ← MoneyXprt
          </a>
          <span className="text-white/20">/</span>
          <span className="text-yellow-400 text-sm font-semibold">MLS CFO Analytics</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Data — Updated every 5 min
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live ESPN Data · 2026 MLSPA Salaries · All 30 MLS Clubs
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            MLS{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #FACA15, #1B5E4C)' }}>
              CFO Analytics
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Real-time MLS standings from ESPN merged with 2026 MLSPA salary disclosures.
            Analyze payroll efficiency, player value, and generate AI-powered financial content.
          </p>

          {!standingsLoading && leagueStats.totalPayroll > 0 && (
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-400">{fmt(leagueStats.totalPayroll)}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">Combined Payroll (All 30 MLS Clubs)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-400">{leagueStats.totalDPs}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">Designated Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-400">{standings.length}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">Teams Tracked</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Standings / Team Selector */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
              Select a Team to Analyze
            </h2>
          </div>

          {standingsLoading && (
            <div className="flex items-center justify-center py-12 gap-3 text-white/40">
              <span className="w-5 h-5 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
              Loading live ESPN standings...
            </div>
          )}

          {standingsError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
              Failed to load live standings: {standingsError}
            </div>
          )}

          {!standingsLoading && standings.length > 0 && (
            <LiveTeamSelector
              standings={standings}
              selectedTeamId={selectedSlug}
              onSelectTeam={handleSelectTeam}
              lastUpdated={lastUpdated}
            />
          )}
        </section>

        {/* Dashboard */}
        <AnimatePresence>
          {selectedSlug && (
            <motion.section
              key={selectedSlug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >
              {/* Team header */}
              <div
                className="rounded-2xl p-6 mb-6 border border-white/10 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${primaryColor}30, transparent 60%)` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: primaryColor }} />
                {teamLoading ? (
                  <div className="flex items-center gap-3 text-white/40">
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Loading live team data...
                  </div>
                ) : teamData ? (
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {teamData.team.abbreviation.slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">{teamData.team.name}</h2>
                        <div className="flex gap-2 mt-1 flex-wrap items-center">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            {selectedStanding?.conference || 'MLS'} · ESPN Live
                          </span>
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Standings
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <div className="text-center">
                        <div className="text-2xl font-black text-yellow-400">{teamData.team.points}</div>
                        <div className="text-xs text-white/50">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">
                          {teamData.team.wins}W-{teamData.team.losses}L-{teamData.team.draws}D
                        </div>
                        <div className="text-xs text-white/50">Record</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">
                          {teamData.team.goalsFor}-{teamData.team.goalsAgainst}
                        </div>
                        <div className="text-xs text-white/50">GF-GA</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">#{teamData.financials.payrollRank}</div>
                        <div className="text-xs text-white/50">Payroll Rank</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/40 text-sm">Select a team to see live data</div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: primaryColor } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'overview' && teamData && (
                    <LiveCFOMetrics
                      team={teamData.team}
                      financials={teamData.financials}
                      allPayrolls={allPayrollsForChart}
                      primaryColor={primaryColor}
                    />
                  )}

                  {activeTab === 'players' && (
                    <div>
                      {teamLoading ? (
                        <div className="flex items-center gap-3 text-white/40 py-8 justify-center">
                          <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Loading roster from ESPN...
                        </div>
                      ) : (
                        <LivePlayerSalaryTable
                          players={displayPlayers}
                          isLiveRoster={rosterPlayers.length > 0}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === 'social' && teamData && (
                    <div className="max-w-2xl">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white">AI Social Post Generator</h3>
                        <p className="text-sm text-white/50 mt-1">
                          Generate data-driven content using live ESPN standings + 2026 MLSPA salaries.
                        </p>
                      </div>
                      <LiveSocialPostGenerator
                        team={teamData.team}
                        primaryColor={primaryColor}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!selectedSlug && !standingsLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-white/30"
          >
            <div className="text-6xl mb-4">⚽</div>
            <p className="text-lg">Select a team above to view live CFO analytics</p>
            <p className="text-sm mt-2 text-white/20">
              Data sources: ESPN public API (live) + 2026 MLSPA salary disclosures
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="border-t border-white/5 pt-6 text-center text-xs text-white/20">
          Standings: ESPN public API, cached 5 min &bull; Salaries: 2026 MLSPA disclosure (approximate) &bull;
          For analytical purposes only.
        </div>
      </div>
    </div>
  );
}
