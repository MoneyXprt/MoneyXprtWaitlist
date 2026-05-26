'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MLSTeam } from '@/lib/mls/types';

interface SocialPostGeneratorProps {
  team: MLSTeam;
}

type Platform = 'twitter' | 'linkedin' | 'instagram';
type FocusArea = 'salary' | 'performance' | 'lineup' | 'efficiency';

const PLATFORMS: { id: Platform; label: string; icon: string; charLimit?: number }[] = [
  { id: 'twitter', label: 'Twitter / X', icon: '𝕏', charLimit: 280 },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'instagram', label: 'Instagram', icon: '▲' },
];

const FOCUS_AREAS: { id: FocusArea; label: string; description: string }[] = [
  { id: 'salary', label: 'Salary Analysis', description: 'Payroll structure & DP allocation' },
  { id: 'performance', label: 'Player Performance', description: 'ROI per dollar invested' },
  { id: 'lineup', label: 'Lineup Efficiency', description: 'Optimal 11 from CFO perspective' },
  { id: 'efficiency', label: 'Team Value', description: 'Capital efficiency & overpay analysis' },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  instagram: '#E1306C',
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

export default function SocialPostGenerator({ team }: SocialPostGeneratorProps) {
  const [platform, setPlatform] = useState<Platform>('twitter');
  const [focusArea, setFocusArea] = useState<FocusArea>('performance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    content: string;
    hashtags: string[];
    metrics: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function generatePost() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/mls/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.id, platform, focusArea }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate post');
      }

      const data = await res.json();
      setResult(data.post);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    const full = result.content + '\n\n' + result.hashtags.join(' ');
    copyToClipboard(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Platform selector */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">
          Platform
        </label>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                platform === p.id
                  ? 'border-transparent text-white'
                  : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white/80'
              }`}
              style={
                platform === p.id
                  ? { backgroundColor: PLATFORM_COLORS[p.id], borderColor: PLATFORM_COLORS[p.id] }
                  : {}
              }
            >
              <span className="mr-1.5 font-mono">{p.icon}</span>
              {p.label}
              {p.charLimit && (
                <span className="ml-1.5 text-xs opacity-70">{p.charLimit} chars</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Focus area selector */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">
          Focus Area
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FOCUS_AREAS.map(f => (
            <button
              key={f.id}
              onClick={() => setFocusArea(f.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                focusArea === f.id
                  ? 'border-yellow-400/50 bg-yellow-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/25'
              }`}
            >
              <div
                className={`text-sm font-semibold ${
                  focusArea === f.id ? 'text-yellow-400' : 'text-white/80'
                }`}
              >
                {f.label}
              </div>
              <div className="text-xs text-white/40 mt-0.5">{f.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generatePost}
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading
            ? 'rgba(255,255,255,0.1)'
            : `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor || '#1B5E4C'})`,
          color: 'white',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating CFO Analysis...
          </span>
        ) : (
          `Generate ${FOCUS_AREAS.find(f => f.id === focusArea)?.label} Post`
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Generated post */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Mock social card */}
            <div
              className="rounded-2xl border p-5 space-y-3"
              style={{
                borderColor: `${PLATFORM_COLORS[platform]}40`,
                background: `linear-gradient(135deg, ${PLATFORM_COLORS[platform]}10, transparent)`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ backgroundColor: team.primaryColor }}
                >
                  {team.abbreviation.slice(0, 2)}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{team.name} CFO Office</div>
                  <div
                    className="text-xs"
                    style={{ color: PLATFORM_COLORS[platform] }}
                  >
                    {PLATFORMS.find(p => p.id === platform)?.label}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                {result.content}
              </p>

              {/* Hashtags */}
              {result.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.slice(0, 8).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${PLATFORM_COLORS[platform]}20`,
                        color: PLATFORM_COLORS[platform],
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Key metrics cited */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-2">
                Key Metrics Referenced
              </div>
              <div className="flex flex-wrap gap-2">
                {result.metrics.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-lg font-mono"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl border border-white/15 text-white/70 text-sm font-medium hover:border-white/30 hover:text-white transition-all"
            >
              {copied ? '✓ Copied to clipboard!' : 'Copy Post'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
