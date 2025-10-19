import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border bg-white p-6">
        <h1 className="text-3xl font-semibold mb-2">MoneyXprt — AI Tax & Wealth Strategist</h1>
        <p className="text-gray-600 mb-4">
          Get a current-year tax estimate and a ranked set of compliant strategies to keep more of what you earn.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/intake" className="px-4 py-2 rounded bg-black text-white">Start the Agent</Link>
          <Link href="/history" className="px-4 py-2 rounded border">View History</Link>
          <Link href="/compare" className="px-4 py-2 rounded border">Compare Scenarios</Link>
          <Link href="/mx-test" className="px-4 py-2 rounded border">API Test</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'How it works', body: 'Fill a quick intake, we estimate your taxes, then recommend compliant strategies ranked by impact, complexity, and risk.' },
          { title: 'What you get', body: 'Profile Snapshot • Tax Estimate • Top Strategies • Action Plan • References (IRS + books) • Compliance notes.' },
          { title: 'Stay compliant', body: 'Education-only. We always recommend coordinating with a CPA/tax attorney/fiduciary before implementation.' },
        ].map((c, i) => (
          <div key={i} className="rounded-2xl border bg-white p-5">
            <h2 className="font-semibold mb-1">{c.title}</h2>
            <p className="text-sm text-gray-700">{c.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-semibold mb-2">Quick links</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><Link href="/intake" className="underline">Run a new scenario</Link></li>
          <li><Link href="/history" className="underline">See recent scenarios</Link></li>
          <li><Link href="/compare" className="underline">Compare two scenarios</Link></li>
        </ul>
      </section>
    </div>
  );
}
