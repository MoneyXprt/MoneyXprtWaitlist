'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MLS_TEAMS, MLS_PLAYERS } from '@/lib/mls/data';
import { compareTeamsByEfficiency } from '@/lib/mls/analytics';
import { TeamFinancials } from '@/lib/mls/types';
import TeamSelector from '@/components/mls/TeamSelector';
import CFOMetrics from '@/components/mls/CFOMetrics';
import PlayerSalaryTable from '@/components/mls/PlayerSalaryTable';
import LineupOptimizer from '@/components/mls/LineupOptimizer';
import SocialPostGenerator from '@/components/mls/SocialPostGenerator';

type Tab = 'overview' | 'players' | 'lineup' | 'social';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'CFO Overview' },
  { id: 'players', label: 'Player Salaries' },
  { id: 'lineup', label: 'Lineup Optimizer' },
  { id: 'social', label: 'Social Posts' },
];

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function MLSPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Pre-calculate all financials
  const allFinancials: TeamFinancials[] = useMemo(
    () => compareTeamsByEfficiency(MLS_TEAMS, MLS_PLAYERS),
    []
  );

  const teamsWithFinancials = useMemo(
    () =>
      MLS_TEAMS.map(team => ({
        team,
        financials: allFinancials.find(f => f.teamId === team.id)!,
      })),
    [allFinancials]
  );

  const selectedTeam = useMemo(
    () => MLS_TEAMS.find(t => t.id === selectedTeamId) ?? null,
    [selectedTeamId]
  );

  const selectedFinancials = useMemo(
    () => allFinancials.find(f => f.teamId === selectedTeamId) ?? null,
    [allFinancials, selectedTeamId]
  );

  const selectedPlayers = useMemo(
    () => (selectedTeamId ? MLS_PLAYERS.filter(p => p.teamId === selectedTeamId) : []),
    [selectedTeamId]
  );

  function handleSelectTeam(id: string) {
    if (selectedTeamId === id) return;
    setSelectedTeamId(id);
    setActiveTab('overview');
  }

  // League-wide stats for the hero section
  const leagueStats = useMemo(() => {
    const totalPayroll = allFinancials.reduce((s, f) => s + f.totalPayroll, 0);
    const totalDPs = allFinancials.reduce((s, f) => s + f.dpCount, 0);
    const avgValueRating =
      allFinancials.reduce((s, f) => s + f.valueRating, 0) / allFinancials.length;
    return { totalPayroll, totalDPs, avgValueRating };
  }, [allFinancials]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a1a14 0%, #0d2018 40%, #0a1a14 100%)' }}>
      {/* Back nav */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <a
            href="/"
            className="text-white/50 hover:text-white/80 text-sm transition-colors flex items-center gap-1.5"
          >
            ← MoneyXprt
          </a>
          <span className="text-white/20">/</span>
          <span className="text-yellow-400 text-sm font-semibold">MLS CFO Analytics</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
            2024 MLS Season · 8 Teams · 100+ Players
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            MLS{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(90deg, #FACA15, #1B5E4C)',
              }}
            >
              CFO Analytics
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Data-driven insights from the front office perspective. Analyze team payroll efficiency,
            player value scores, optimal lineups, and generate AI-powered financial social content.
          </p>

          {/* League-wide stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">
                {formatMoney(leagueStats.totalPayroll)}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Combined Payroll (8 teams)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">{leagueStats.totalDPs}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Designated Players
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">
                {leagueStats.avgValueRating.toFixed(2)}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Avg Value Rating (G+A/$M)
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team selector */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">
            Select a Team to Analyze
          </h2>
          <TeamSelector
            teams={teamsWithFinancials}
            selectedTeamId={selectedTeamId}
            onSelectTeam={handleSelectTeam}
          />
        </section>

        {/* Dashboard */}
        <AnimatePresence>
          {selectedTeam && selectedFinancials && (
            <motion.section
              key={selectedTeamId}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >
              {/* Team header */}
              <div
                className="rounded-2xl p-6 mb-6 border border-white/10 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${selectedTeam.primaryColor}30, transparent 60%)`,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: selectedTeam.primaryColor }}
                />
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
                      style={{ backgroundColor: selectedTeam.primaryColor }}
                    >
                      {selectedTeam.abbreviation.slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{selectedTeam.name}</h2>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                          {selectedTeam.conference} Conference
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                          {selectedTeam.city}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                          Founded {selectedTeam.foundedYear}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <div className="text-center">
                      <div className="text-2xl font-black text-yellow-400">
                        {selectedTeam.standingsPoints}
                      </div>
                      <div className="text-xs text-white/50">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {selectedTeam.wins}W-{selectedTeam.losses}L-{selectedTeam.draws}D
                      </div>
                      <div className="text-xs text-white/50">Record</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {selectedTeam.goalsFor}-{selectedTeam.goalsAgainst}
                      </div>
                      <div className="text-xs text-white/50">GF-GA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        #{selectedFinancials.payrollRank}
                      </div>
                      <div className="text-xs text-white/50">Payroll Rank</div>
                    </div>
                  </div>
                </div>
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
                    style={
                      activeTab === tab.id
                        ? { backgroundColor: selectedTeam.primaryColor }
                        : {}
                    }
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
                  {activeTab === 'overview' && (
                    <CFOMetrics
                      team={selectedTeam}
                      financials={selectedFinancials}
                      allFinancials={allFinancials}
                      allTeams={MLS_TEAMS}
                    />
                  )}

                  {activeTab === 'players' && (
                    <PlayerSalaryTable players={selectedPlayers} />
                  )}

                  {activeTab === 'lineup' && (
                    <LineupOptimizer
                      players={selectedPlayers}
                      teamColor={selectedTeam.primaryColor}
                    />
                  )}

                  {activeTab === 'social' && (
                    <div className="max-w-2xl">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white">AI Social Post Generator</h3>
                        <p className="text-sm text-white/50 mt-1">
                          Generate data-driven social media content from a CFO perspective using
                          real 2024 MLS financial data.
                        </p>
                      </div>
                      <SocialPostGenerator team={selectedTeam} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!selectedTeamId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-white/30"
          >
            <div className="text-6xl mb-4">⚽</div>
            <p className="text-lg">Select a team above to view CFO analytics</p>
          </motion.div>
        )}

        {/* Footer note */}
        <div className="border-t border-white/5 pt-6 text-center text-xs text-white/20">
          All financial data is estimated/approximate based on publicly available MLS salary
          disclosures. This tool is for analytical purposes only.
        </div>
      </div>
    </div>
  );
}
