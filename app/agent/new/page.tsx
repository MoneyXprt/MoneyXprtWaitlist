"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AgentIntakeForm = dynamic(() => import('@/components/agent/IntakeForm'), {
  ssr: false,
  loading: () => <div className="p-6">Loading…</div>,
});

export default function NewAnalysisPage() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">New Analysis</h1>
      <Suspense fallback={<div className="p-6">Loading…</div>}> 
        <AgentIntakeForm />
      </Suspense>
    </main>
  );
}
