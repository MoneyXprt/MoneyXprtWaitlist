'use client';
import { useState } from 'react';
import { callStrategist } from '@/lib/callStrategist';

export default function MXTest() {
  const [msg, setMsg] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true); setOut('');
    try {
      const r = await callStrategist({ userMessage: msg || 'Quick estimate with defaults.' });
      setOut((r as any).answer || '');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-2xl font-semibold">Strategist API Test</h1>
      <textarea value={msg} onChange={(e)=>setMsg(e.target.value)}
        className="w-full border rounded p-3 min-h-[120px]"
        placeholder="Ask the strategist or paste sample data…" />
      <button onClick={run} disabled={loading} className="px-4 py-2 rounded bg-black text-white">
        {loading ? 'Running…' : 'Run'}
      </button>
      {out && <pre className="border rounded p-3 whitespace-pre-wrap bg-white">{out}</pre>}
    </div>
  );
}

