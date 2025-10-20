"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AgentIntakeForm = dynamic(() => import('@/components/agent/IntakeForm'), {
  ssr: false,
  loading: () => <div className="p-6 text-sm text-zinc-500">Loading…</div>,
});

export default function NewAnalysisPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Analysis</h1>
      </header>

      <Suspense fallback={<div className="p-6 text-sm text-zinc-500">Loading…</div>}>
        <AgentIntakeForm />
      </Suspense>
    </main>
  );
}
