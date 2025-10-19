import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="grid gap-8">
      <section className="card p-8">
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
          <Card key={i}><CardContent className="p-5">
            <h3 className="font-semibold mb-1">{x.t}</h3>
            <p className="text-sm text-slate-700">{x.b}</p>
          </CardContent></Card>
        ))}
      </section>
    </div>
  );
}
