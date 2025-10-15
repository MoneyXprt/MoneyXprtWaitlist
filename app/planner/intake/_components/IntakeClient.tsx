"use client";
// app/planner/intake/_components/IntakeClient.tsx
import { Suspense, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Wizard from '../../Wizard';
import { usePlannerStore } from '@/lib/store/planner';
import { buildDemoSnapshot } from '@/lib/strategy/ui/snapshots';
import LoadDemo from '../LoadDemo';
import type { SearchParamsObject } from '../../_components/WithSearchParams';

function DemoLoader({ params }: { params: SearchParamsObject }) {
  const setAll = usePlannerStore((s) => s.setAll);
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return;
    const demo = params['demo'];
    if (demo) {
      const data = buildDemoSnapshot(demo);
      if (data) setAll(data);
      once.current = true;
    }
  }, [params, setAll]);
  return null;
}

export default function IntakeClient({ params }: { params: SearchParamsObject }) {
  const data = usePlannerStore((s) => s.data);
  const updatePath = usePlannerStore((s) => s.updatePath);
  const router = useRouter();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <LoadDemo />
      </div>
      {/* Step 1 — minimal profile fields wired to store */}
      <div className="rounded border p-4 mb-3">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <label className="grid gap-1">
            <span className="font-medium">Filing status</span>
            <select
              value={data.filingStatus}
              onChange={(e) => updatePath('filingStatus', e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="single">Single</option>
              <option value="married_joint">MFJ</option>
              <option value="married_separate">MFS</option>
              <option value="head">HOH</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="font-medium">Domicile state</span>
            <input
              type="text"
              value={data.state}
              onChange={(e) => updatePath('state', e.target.value)}
              placeholder="e.g., CA"
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => router.push('/planner/recommendations')}
            className="rounded bg-emerald-700 text-white px-3 py-2 text-sm"
          >
            Continue
          </button>
        </div>
      </div>
      <Suspense fallback={null}>
        <DemoLoader params={params} />
      </Suspense>
      <Wizard />
    </div>
  );
}

