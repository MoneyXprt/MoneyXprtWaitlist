import Link from "next/link";
import { Brain, ShieldCheck, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="card p-8 md:p-12 animate-fadeUp">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 mb-3">
              <Sparkles className="h-4 w-4 text-[var(--mx-accent)]" />
              AI Tax & Wealth Strategist
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--mx-primary)]">
              Keep more. Build faster.
            </h1>
            <p className="mt-3 text-zinc-600 max-w-prose">
              MoneyXprt estimates your current-year taxes and produces ranked, compliant strategies
              tailored to your income, state, and entity structure—complete with action steps and references.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/intake" className="btn-primary px-6 py-3 text-base">Start the Agent</Link>
              <Link href="/history" className="rounded-xl border border-[var(--mx-border)] px-6 py-3 text-sm hover:bg-zinc-50">
                View History
              </Link>
              <Link href="/compare" className="rounded-xl border border-[var(--mx-border)] px-6 py-3 text-sm hover:bg-zinc-50">
                Compare Scenarios
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
              <CheckCircle2 className="h-4 w-4 text-[var(--mx-accent)]" />
              Educational only — coordinate execution with a CPA, tax attorney, or fiduciary.
            </div>
          </div>

          {/* Right: visual summary / trust */}
          <div className="rounded-2xl border border-[var(--mx-border)] bg-white p-6 md:p-8">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-50 p-4 text-center">
                <p className="text-xs text-zinc-500">Est. Tax</p>
                <p className="text-2xl font-semibold text-[var(--mx-primary)]">$42,380</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 text-center">
                <p className="text-xs text-zinc-500">Savings (proj.)</p>
                <p className="text-2xl font-semibold text-[var(--mx-accent)]">$6,850</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 text-center">
                <p className="text-xs text-zinc-500">Eff. Rate</p>
                <p className="text-2xl font-semibold text-[var(--mx-primary)]">21.3%</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-[var(--mx-accent)] mt-0.5" />
                <div>
                  <div className="font-medium">ROI-ranked strategies</div>
                  <p className="text-sm text-zinc-600">Sorted by impact, complexity, and legal risk.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[var(--mx-accent)] mt-0.5" />
                <div>
                  <div className="font-medium">Compliance-first</div>
                  <p className="text-sm text-zinc-600">Built on IRS guidance & best-practice references.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[var(--mx-border)] bg-zinc-50 p-4">
              <div className="text-sm text-zinc-600">
                “The recommendations explained the <span className="font-medium">why</span>, gave the forms/elections and
                the audit notes. I walked into my CPA meeting prepared.”
              </div>
              <div className="mt-2 text-xs text-zinc-500">— MoneyXprt beta user</div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PILLARS */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            icon: <Brain className="h-5 w-5 text-[var(--mx-accent)]" />,
            title: "Personalized Modeling",
            body: "We map your income types, state, and entities to strategies that actually fit—no generic checklists."
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-[var(--mx-accent)]" />,
            title: "Ranked by ROI",
            body: "Each strategy is scored for Suitability, Tax Impact, Complexity, and Legal Risk so you know where to start."
          },
          {
            icon: <ShieldCheck className="h-5 w-5 text-[var(--mx-accent)]" />,
            title: "Compliance Notes",
            body: "Explicit forms/elections, documentation, timing, and red-flag triggers to discuss with your CPA/attorney."
          },
        ].map((c, i) => (
          <div key={i} className="card p-5 animate-fadeUp">
            <div className="flex items-center gap-2 mb-2">{c.icon}<h3 className="font-semibold">{c.title}</h3></div>
            <p className="text-sm text-zinc-600">{c.body}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="card p-6 md:p-8 animate-fadeUp">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-zinc-50 p-5">
            <div className="text-xs font-medium text-zinc-500">Step 1</div>
            <div className="font-semibold mt-1">Tell us your basics</div>
            <p className="text-sm text-zinc-600 mt-1">Filing status, state, W-2/business income, mortgage/SALT, giving.</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-5">
            <div className="text-xs font-medium text-zinc-500">Step 2</div>
            <div className="font-semibold mt-1">Get your estimate & strategies</div>
            <p className="text-sm text-zinc-600 mt-1">We assume the current tax year and cite relevant IRS pubs and books.</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-5">
            <div className="text-xs font-medium text-zinc-500">Step 3</div>
            <div className="font-semibold mt-1">Execute with confidence</div>
            <p className="text-sm text-zinc-600 mt-1">Coordinate with your CPA/attorney. We provide the checklist.</p>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/intake" className="btn-primary">Run a new analysis</Link>
        </div>
      </section>

      {/* FAQ (simple, no deps) */}
      <section className="card p-6 md:p-8 animate-fadeUp">
        <h2 className="text-2xl font-semibold">Common questions</h2>
        <div className="mt-4 space-y-3">
          <details className="rounded-xl border border-[var(--mx-border)] p-4 bg-white">
            <summary className="cursor-pointer font-medium">Is this legal advice?</summary>
            <p className="mt-2 text-sm text-zinc-600">
              No—MoneyXprt is educational. We recommend coordinating with a licensed CPA, tax attorney, or fiduciary before implementation.
            </p>
          </details>
          <details className="rounded-xl border border-[var(--mx-border)] p-4 bg-white">
            <summary className="cursor-pointer font-medium">Which tax year does it use?</summary>
            <p className="mt-2 text-sm text-zinc-600">
              We assume the current tax year unless you specify otherwise, and we verify limits when browsing is enabled.
            </p>
          </details>
          <details className="rounded-xl border border-[var(--mx-border)] p-4 bg-white">
            <summary className="cursor-pointer font-medium">Can it cite sources?</summary>
            <p className="mt-2 text-sm text-zinc-600">
              Yes—our recommendations include IRS sections/publications and respected books so you and your advisor can review quickly.
            </p>
          </details>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="card p-6 md:p-8 text-center animate-fadeUp">
        <h2 className="text-2xl font-semibold">Ready to see what you could keep?</h2>
        <p className="mt-2 text-zinc-600">Run your first analysis in minutes—no account required.</p>
        <div className="mt-5">
          <Link href="/intake" className="btn-primary px-6 py-3 text-base">Start the Agent</Link>
        </div>
      </section>
    </div>
  );
}
