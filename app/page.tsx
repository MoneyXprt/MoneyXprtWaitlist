import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="grid gap-8">
      <section className="text-center mt-10 mb-2 animate-fadeUp">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--mx-primary)]">
          Optimize Your Taxes with AI
        </h1>
        <p className="mt-3 text-zinc-600 max-w-xl mx-auto">
          MoneyXprt runs advanced simulations to uncover 3–5 compliant tax strategies personalized to your income, state, and business profile.
        </p>
        <div className="mt-5">
          <Link href="/intake" className="btn-primary px-6 py-3 text-base">Start Your Estimate</Link>
        </div>
      </section>
      <section className="card p-8 animate-fadeUp">
        <h1 className="text-4xl font-semibold mb-3">Keep more. Stress less.</h1>
        <p className="text-slate-600 mb-6 max-w-2xl">
          MoneyXprt estimates your current-year taxes and produces ranked, compliant strategies
          to reduce taxes and accelerate wealth — with clear action steps and references.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/intake"><Button size="lg">Start the Agent</Button></Link>
          <Link href="/history"><Button variant="outline" size="lg">View History</Button></Link>
          <Link href="/compare"><Button variant="outline" size="lg">Compare Scenarios</Button></Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          { t: 'How it works', b: 'Enter your basics. We model this year and rank strategies by impact, complexity, and legal risk.' },
          { t: 'What you get', b: 'Profile snapshot, estimates, top strategies, action plan, references (IRS, trusted books).' },
          { t: 'Compliance-first', b: 'Education only. Coordinate execution with a CPA, tax attorney, or fiduciary.' },
        ].map((x, i) => (
          <Card key={i} className="animate-fadeUp"><CardContent className="p-5">
            <h3 className="font-semibold mb-1">{x.t}</h3>
            <p className="text-sm text-slate-700">{x.b}</p>
          </CardContent></Card>
        ))}
      </section>
    </div>
  );
}
