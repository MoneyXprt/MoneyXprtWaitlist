export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function LabsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Labs</h1>
      <p className="text-sm text-neutral-600">
        Quick links to new features and developer previews.
      </p>

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-semibold">Tax Strategy Engine (MVP)</h2>
        <p className="text-sm text-neutral-700">
          We added a rule-driven strategy engine with a JSON DSL, calculators, and a small registry.
        </p>
        <div className="flex gap-3 text-sm">
          <Link href="/planner" className="underline text-emerald-700 hover:text-emerald-800">
            Open Planner
          </Link>
          <Link href="/labs/strategy-demo" className="underline text-emerald-700 hover:text-emerald-800">
            Strategy Demo
          </Link>
          <Link href="/api/plan" className="underline text-emerald-700 hover:text-emerald-800">
            API Docs (GET)
          </Link>
        </div>
        <div className="text-xs text-neutral-600">
          Engine files: lib/strategy/* (DSL, engine, registry, calculators). Tests in tests/strategy/*.
        </div>
      </section>
    </div>
  );
}
