"use client";

import { useState } from 'react';
import { sbBrowser } from '@/lib/supabase';
import ScoreCard from './_components/ScoreCard';
import { callStrategist } from '@/lib/callStrategist'

export default function AppTools() {
  const supabase = sbBrowser();

  const [taxPdf, setTaxPdf] = useState<File | null>(null);
  const [entityForm, setEntityForm] = useState({ w2: '', re_units: '', side_income: '' });
  const [holdingsCsv, setHoldingsCsv] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [userMessage, setUserMessage] = useState<string>('')
  const [mxLoading, setMxLoading] = useState(false)
  const [mxAnswer, setMxAnswer] = useState<string>('')
  const [mxError, setMxError] = useState<string>('')

  async function authHeader() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { 'x-supabase-auth': token } : {};
  }

  async function runTaxScan() {
    if (!taxPdf) return;
    setBusy(true); setMsg('');
    const fd = new FormData(); fd.append('file', taxPdf);
    const headers = await authHeader();
    const res = await fetch('/api/tax-scan', { method: 'POST', body: fd, headers: headers as any });
    const out = await res.json(); setMsg(out.message || JSON.stringify(out));
    setBusy(false);
  }

  async function runEntityOpt() {
    setBusy(true); setMsg('');
    const headers = { 'Content-Type':'application/json', ...(await authHeader()) as any };
    const res = await fetch('/api/entity-opt', { method: 'POST', headers, body: JSON.stringify(entityForm) });
    const out = await res.json(); setMsg(out.message || JSON.stringify(out));
    setBusy(false);
  }

  async function runFeeCheck() {
    if (!holdingsCsv) return;
    setBusy(true); setMsg('');
    const fd = new FormData(); fd.append('file', holdingsCsv);
    const headers = await authHeader();
    const res = await fetch('/api/fee-check', { method: 'POST', body: fd, headers: headers as any });
    const out = await res.json(); setMsg(out.message || JSON.stringify(out));
    setBusy(false);
  }

  return (
    <main className="space-y-10 p-6">
      <h1 className="text-3xl font-semibold">MoneyXprt — Beta Tools</h1>

      <ScoreCard />

      <section className="bg-white shadow p-4 rounded-xl">
        <h2 className="text-xl font-semibold">1) Tax Savings Scan (PDF)</h2>
        <input type="file" accept="application/pdf" onChange={e => setTaxPdf(e.target.files?.[0] ?? null)} />
        <button className="mt-3 rounded px-4 py-2 bg-black text-white" onClick={runTaxScan} disabled={busy || !taxPdf}>
          Run Scan
        </button>
      </section>

      <section className="bg-white shadow p-4 rounded-xl">
        <h2 className="text-xl font-semibold">2) Entity Optimizer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border p-2 rounded" placeholder="W-2 income ($)" value={entityForm.w2}
            onChange={e => setEntityForm(s => ({...s, w2: e.target.value}))}/>
          <input className="border p-2 rounded" placeholder="Rental units (#)" value={entityForm.re_units}
            onChange={e => setEntityForm(s => ({...s, re_units: e.target.value}))}/>
          <input className="border p-2 rounded" placeholder="Side income ($)" value={entityForm.side_income}
            onChange={e => setEntityForm(s => ({...s, side_income: e.target.value}))}/>
        </div>
        <button className="mt-3 rounded px-4 py-2 bg-black text-white" onClick={runEntityOpt} disabled={busy}>
          Recommend Entity Setup
        </button>
      </section>

      <section className="bg-white shadow p-4 rounded-xl">
        <h2 className="text-xl font-semibold">3) Investment Fee Check (CSV)</h2>
        <p className="text-sm text-neutral-600">CSV columns: Ticker, Shares, Price, ExpenseRatio (optional)</p>
        <input type="file" accept=".csv,text/csv" onChange={e => setHoldingsCsv(e.target.files?.[0] ?? null)} />
        <button className="mt-3 rounded px-4 py-2 bg-black text-white" onClick={runFeeCheck} disabled={busy || !holdingsCsv}>
          Analyze Fees
        </button>
      </section>

      {!!msg && (
        <section className="bg-white shadow p-4 rounded-xl">
          <h2 className="text-xl font-semibold">Result</h2>
          <pre className="whitespace-pre-wrap text-sm">{msg}</pre>
        </section>
      )}

      <section className="bg-white shadow p-4 rounded-xl">
        <h2 className="text-xl font-semibold">4) MoneyXprt Strategist (test)</h2>
        <textarea
          className="mt-2 w-full border rounded p-3 text-sm"
          rows={4}
          placeholder="Ask a plain-English question for MoneyXprt…"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            className="rounded px-4 py-2 bg-emerald-600 text-white disabled:opacity-50"
            onClick={async () => {
              setMxLoading(true); setMxError(''); setMxAnswer('')
              const res = await callStrategist({ userMessage })
              if (!res.ok) setMxError(res.error || 'Failed')
              else setMxAnswer(res.answer || '')
              setMxLoading(false)
            }}
            disabled={mxLoading || !userMessage.trim()}
          >
            {mxLoading ? 'Running…' : 'Run MoneyXprt'}
          </button>
          {mxError && <span className="text-sm text-red-600">{mxError}</span>}
        </div>
        {mxAnswer && (
          <div className="mt-3 border rounded p-3 bg-neutral-50 text-sm whitespace-pre-wrap">{mxAnswer}</div>
        )}
      </section>
    </main>
  );
}
