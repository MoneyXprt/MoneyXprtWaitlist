'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const join = async () => {
    setMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      let j: any = {};
      try {
        j = await res.json();
      } catch {
        /* swallow JSON parse errors */
      }

      setMsg(j.message || j.error || (res.ok ? 'Thanks for joining!' : 'Something went wrong.'));
      if (res.ok && j?.ok) setEmail('');
    } catch {
      setMsg('Network error. Please try again.');
    }
  };

  return (
    <main className="min-h-[80vh] flex flex-col">
      {/* HERO */}
      <section className="hero-wrap on-hero pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Fire your financial advisor.{` `}
              <span className="highlight text-black">Keep the advice.</span>
            </h1>

            <p className="mt-5 text-lg md:text-xl on-hero-muted max-w-xl">
              MoneyXprt is your AI‑powered planner for tax savings, entity optimization, and fee‑free investing — with
              tamper‑evident reports you can verify.
            </p>

            <div className="mt-7 flex gap-3 max-w-xl">
              <input
                type="email"
                inputMode="email"
                className="border rounded-xl px-4 py-3 flex-1 bg-white/95 text-foreground placeholder:text-neutral-400"
                placeholder="you@work.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={join} className="btn-emerald">
                Join waitlist
              </button>
            </div>

            {msg && <p className="mt-2 text-sm on-hero-muted">{msg}</p>}

            <div className="mt-4 text-sm">
              <Link href="/app" className="underline underline-offset-4 on-hero-muted hover:text-white">
                Try the beta
              </Link>
            </div>
          </div>

          {/* Right-side highlight card */}
          <div className="card-elevated p-6 md:p-7">
            <h3 className="font-semibold text-lg text-foreground">What you can do today</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700 list-disc list-inside">
              <li>
                Upload last year&apos;s return → <em>AI Tax Savings Scan</em>
              </li>
              <li>
                Enter W‑2 + real estate → <em>Entity Optimizer</em>
              </li>
              <li>
                Upload holdings CSV → <em>Investment Fee Check</em>
              </li>
              <li>Every report gets a verifiable SHA‑256 hash</li>
            </ul>
            <Link href="/app" className="mt-4 btn-outline-dark inline-flex">
              Open Beta Tools
            </Link>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          <div className="card-elevated p-5">
            <h4 className="font-semibold">Proactive, not reactive</h4>
            <p className="mt-2 text-sm text-neutral-700">
              Quarterly AI playbooks flag savings before tax season.
            </p>
          </div>
          <div className="card-elevated p-5">
            <h4 className="font-semibold">Aligned incentives</h4>
            <p className="mt-2 text-sm text-neutral-700">
              Flat subscription — no AUM fees, no commissions.
            </p>
          </div>
          <div className="card-elevated p-5">
            <h4 className="font-semibold">Verifiable integrity</h4>
            <p className="mt-2 text-sm text-neutral-700">
              Every plan is hashed; on‑chain anchoring coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-neutral-600">
          <span>© {new Date().getFullYear()} MoneyXprt</span>
          <nav className="flex items-center gap-4">
            <Link href="/app" className="underline">
              Beta
            </Link>
            <Link href="/reports" className="underline">
              Reports
            </Link>
            <Link href="/privacy" className="underline">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
