import React from "react";
import Hero from "@/components/home/Hero";
import LiveEstimator from "@/components/home/LiveEstimator";
import FeatureGrid from "@/components/home/FeatureGrid";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      <Hero />

      <LiveEstimator />

      <FeatureGrid />

      <section className="rounded-2xl border bg-white/60 p-6 md:p-8">
        <div className="mb-3 text-sm font-medium text-gray-800">What you can do today</div>
        <ul className="grid gap-3 md:grid-cols-2">
          <li className="rounded-lg border bg-white/70 p-4">
            <div className="font-medium">Planner</div>
            <p className="text-sm text-gray-600">Walk through Intake → Recommendations → Scenario → Playbook.</p>
            <div className="mt-3">
              <Link className="text-emerald-700 underline" href="/planner/intake">
                Launch Planner →
              </Link>
            </div>
          </li>
          <li className="rounded-lg border bg-white/70 p-4">
            <div className="font-medium">Labs</div>
            <p className="text-sm text-gray-600">See the Tax Strategy Engine MVP and API docs.</p>
            <div className="mt-3">
              <Link className="text-emerald-700 underline" href="/labs">
                Explore Labs →
              </Link>
            </div>
          </li>
        </ul>
      </section>
    </main>
  );
}

