"use client";
import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-white/60 p-8 md:p-12">
      {/* animated tech background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -inset-[40%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_60%)] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(16,185,129,0.08),rgba(59,130,246,0.08))]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(16,185,129,0.04),rgba(0,0,0,0)_30%,rgba(59,130,246,0.05),rgba(0,0,0,0)_70%)] animate-[spin_16s_linear_infinite]" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Live strategy engine (MVP)
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          AI-powered <span className="text-emerald-600">tax strategy</span> for high-income earners
        </h1>
        <p className="mt-4 text-pretty text-gray-600">
          Stop hunting calculators. Get actionable strategies (QBI, PTET, cost seg, Augusta, employ kids, and more) with a
          scenario plan and exportable playbook.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/planner/intake"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Get Started - open Planner Intake"
          >
            Get Started →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border px-5 py-2.5 hover:bg-gray-50"
            aria-label="See Pricing"
          >
            See Pricing
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 items-center gap-4 text-xs text-gray-500 md:text-sm">
          <div className="flex items-center justify-center gap-2">
            <span className="i-lock" /> Bank-grade security
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="i-star" /> 10k+ professionals
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="i-hash" /> Verifiable reports
          </div>
        </div>
      </div>
    </section>
  );
}

