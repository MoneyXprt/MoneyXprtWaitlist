'use client';

import Link from 'next/link';

/**
 * MoneyXprt — Live product landing (no waitlist).
 * Primary CTA: Get Started → /signup
 * Secondary CTA: Launch the App → /app
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[hsl(0_0%_98%)] text-[hsl(157_48%_15%)]">
      {/* HERO */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div
            className="relative overflow-hidden rounded-3xl px-6 py-16 md:px-12 md:py-24 text-white
                       bg-[radial-gradient(1200px_600px_at_10%_-10%,hsl(45_70%_65%_/_0.15),transparent_60%),radial-gradient(800px_600px_at_90%_20%,hsl(157_48%_25%_/_0.35),transparent_60%),linear-gradient(135deg,hsl(157_48%_20%)_0%,hsl(157_55%_15%)_50%,hsl(157_60%_10%)_100%)]"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* LEFT */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                  AI‑powered financial co‑pilot
                  <span className="block mt-2">
                    for{' '}
                    <span className="bg-[hsl(45_70%_65%)] text-[hsl(157_48%_15%)] px-2 rounded-md">
                      high‑income earners
                    </span>
                  </span>
                </h1>

                <p className="text-white/85 text-lg max-w-xl">
                  Optimize taxes, tighten fees, and grow wealth with verifiable, tamper‑evident
                  plans—delivered in minutes, not weeks.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="rounded-xl px-6 py-3 font-semibold shadow-md text-center
                               bg-[hsl(45_70%_65%)] text-[hsl(157_48%_15%)] hover:brightness-105"
                  >
                    Get Started
                  </Link>

                  <Link
                    href="/app"
                    className="rounded-xl px-6 py-3 text-center border border-white/25
                               text-white/95 hover:bg-white/10"
                  >
                    Launch the App →
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 text-white/75 text-sm pt-2">
                  <span className="inline-flex items-center gap-2">
                    <ShieldIcon /> Bank‑grade security
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <StarsIcon /> 10k+ professionals
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <HashIcon /> SHA‑256 verification
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:pl-6">
                <div className="rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-black/5 p-6 md:p-8">
                  <h3 className="text-lg font-semibold text-[hsl(157_48%_15%)]">What you can do today</h3>
                  <ul className="mt-4 space-y-3 text-[15px] text-neutral-700">
                    <li className="flex gap-3">
                      <Dot /> Upload last year’s return → <em>AI Tax Savings Scan</em>
                    </li>
                    <li className="flex gap-3">
                      <Dot /> Enter W‑2 + real estate → <em>Entity Optimizer</em>
                    </li>
                    <li className="flex gap-3">
                      <Dot /> Upload holdings CSV → <em>Investment Fee Check</em>
                    </li>
                    <li className="flex gap-3">
                      <Dot /> Every report gets a verifiable SHA‑256 hash
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link
                      href="/app"
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2
                                 border border-neutral-200 hover:bg-neutral-50"
                    >
                      Launch the App →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-10 border-b border-[hsl(157_20%_88%)] bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Trusted by professionals from</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 text-neutral-400">
            {['Fortune Co', 'Acme Tax', 'Summit PE', 'Northlake', 'Vertex', 'Beacon'].map((n) => (
              <div
                key={n}
                className="h-10 rounded-lg border border-neutral-200/70 flex items-center justify-center text-sm"
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to act with confidence
            </h2>
            <p className="mt-3 text-neutral-600">
              Powerful planning—without the conflicts. Your data stays yours, your reports are verifiable, and your
              subscription is flat‑fee.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <FeatureCard
              title="AI tax playbooks"
              body="Quarterly, proactive strategies tuned to your income, equity, and state—before deadlines hit."
              icon={<CalendarIcon />}
            />
            <FeatureCard
              title="Entity optimization"
              body="LLC vs S‑Corp vs PLLC? Model take‑home pay, reasonable comp, and payroll taxes instantly."
              icon={<OrgIcon />}
            />
            <FeatureCard
              title="Fee transparency"
              body="Upload a holdings CSV to reveal fund costs, hidden fees, and tax drag across accounts."
              icon={<ChartIcon />}
            />
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-[hsl(157_48%_25%)] font-semibold">Security</p>
            <h3 className="mt-2 text-3xl font-bold">Bank‑grade protection & verifiable integrity</h3>
            <ul className="mt-6 space-y-3 text-neutral-700">
              <li className="flex gap-3">
                <Check /> Encryption in transit & at rest
              </li>
              <li className="flex gap-3">
                <Check /> Row‑level security on all customer data
              </li>
              <li className="flex gap-3">
                <Check /> Reports hashed with SHA‑256
              </li>
              <li className="flex gap-3">
                <Check /> Role‑based access, audit logs, least privilege
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[hsl(157_20%_88%)] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(157_48%_25%)] text-white grid place-items-center">
                <ShieldIcon />
              </div>
              <div>
                <p className="font-semibold">Independently verifiable</p>
                <p className="text-sm text-neutral-600">
                  Each output includes its content hash so you can confirm nothing changed.
                </p>
              </div>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
              <Stat label="Uptime" value="99.95%" />
              <Stat label="Data exports" value="1‑click" />
              <Stat label="PII access" value="Least‑privilege" />
              <Stat label="Support SLA" value="< 24 hrs" />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-[hsl(45_70%_65%)]/20 border border-[hsl(45_70%_65%)]/40 p-8 md:p-10">
            <blockquote className="text-xl md:text-2xl font-semibold leading-relaxed">
              “MoneyXprt flagged an S‑Corp election and retirement combo that saved me **$18k**—in one afternoon. The
              hash‑verified report made it an easy yes.”
            </blockquote>
            <div className="mt-4 text-sm text-neutral-700">— Staff Engineer, SF</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl bg-[hsl(157_48%_15%)] text-white p-8 md:p-10
                          flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Ready to retire hidden fees?</h3>
              <p className="mt-1 text-white/80">Flat $9/month. Cancel anytime. 30‑day money‑back guarantee.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/pricing"
                className="rounded-xl px-5 py-3 bg-white text-[hsl(157_48%_15%)] font-semibold hover:brightness-95"
              >
                See Pricing
              </Link>
              <Link href="/signup" className="rounded-xl px-5 py-3 border border-white/20 hover:bg-white/10">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[hsl(157_20%_88%)] py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
          <p>© {new Date().getFullYear()} MoneyXprt</p>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/security" className="hover:underline">
              Security
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

/* ---------- tiny UI bits ---------- */

function FeatureCard({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-[hsl(157_20%_88%)] p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-lg bg-[hsl(157_48%_25%)] text-white grid place-items-center">
        {icon}
      </div>
      <h4 className="mt-4 font-semibold text-lg">{title}</h4>
      <p className="mt-2 text-sm text-neutral-700">{body}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4 bg-white">
      <div className="text-xs uppercase tracking-widest text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

/* ---------- icons (inline SVGs) ---------- */

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="currentColor" d="M12 2l7 3v6c0 5-3.5 9.2-7 10-3.5-.8-7-5-7-10V5l7-3z" />
    </svg>
  );
}
function StarsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="currentColor" d="M12 2l2.1 6.5H21l-5.4 3.9L16.8 19 12 15.8 7.2 19l1.4-6.6L3 8.5h6.9L12 2z" />
    </svg>
  );
}
function HashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="currentColor" d="M10 3h2L10 21H8L10 3zm6 0h2L16 21h-2L16 3zM3 8h18v2H3V8zm0 6h18v2H3v-2z" />
    </svg>
  );
}
function Dot() {
  return <span aria-hidden className="mt-2 h-2 w-2 rounded-full bg-[hsl(157_48%_25%)] translate-y-1.5" />;
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="currentColor" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm13 8H4v10h16V10z" />
    </svg>
  );
}
function OrgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="currentColor" d="M10 2h4v4h-4V2zM4 10h6v6H4v-6zm10 0h6v6h-6v-6zM4 18h16v4H4v-4z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="currentColor" d="M3 3h2v18H3V3zm8 6h2v12h-2V9zm8-4h2v16h-2V5z" />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[hsl(157_48%_25%)]" aria-hidden="true">
      <path fill="currentColor" d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5L9 16.2z" />
    </svg>
  );
}
