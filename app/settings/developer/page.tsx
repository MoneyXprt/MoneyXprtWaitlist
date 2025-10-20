"use client";
import { useState } from 'react';

export default function DeveloperSettings() {
  const [msg, setMsg] = useState('');
  const [out, setOut] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true); setErr(''); setOut('');
    try {
      const res = await fetch('/api/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: msg || 'Quick estimate with defaults.' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setOut(json.answer || '(empty answer)');
    } catch (e: any) {
      setErr(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-2xl font-semibold">Developer · Strategist API Test</h1>
      <textarea
        value={msg}
        onChange={(e)=>setMsg(e.target.value)}
        className="w-full border rounded p-3 min-h-[120px]"
        placeholder="Ask the strategist or paste sample data…"
      />
      <button onClick={run} type="button" disabled={loading}
        className="btn-primary disabled:opacity-60">
        {loading ? 'Running…' : 'Run'}
      </button>
      {err && <div className="text-red-600">Error: {err}</div>}
      {out && <pre className="border rounded p-3 whitespace-pre-wrap bg-white">{out}</pre>}
    </div>
  );
}

