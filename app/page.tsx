import Link from "next/link";

export default async function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Estimate tax. Rank strategies. Execute with your CPA.</h1>
          <p className="text-sm text-muted-foreground">AI Tax & Wealth Strategist for high earners.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/agent/new" className="btn">New Analysis</Link>
          <Link href="/history" className="btn btn-outline">View History</Link>
        </div>
      </header>

      {/* KPI row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Est. Tax", value: "$42,380" },
          { label: "Savings (proj.)", value: "$6,850" },
          { label: "Eff. Rate", value: "21.3%" },
        ].map((k)=>(
          <div key={k.label} className="rounded-2xl border p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </section>

      {/* Action + recent */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border p-6 lg:col-span-2 space-y-3">
          <h2 className="text-lg font-medium">Start a new analysis</h2>
          <p className="text-sm text-muted-foreground">
            Estimate current-year taxes and get ranked, compliant strategies with action steps.
          </p>
          <Link href="/agent/new" className="btn w-fit">Start the Agent</Link>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="text-sm font-medium mb-3">Recent runs</h3>
          <p className="text-xs text-muted-foreground">No runs yet — <Link href="/agent/new" className="underline">create your first analysis</Link>.</p>
        </div>
      </section>
    </div>
  );
}
