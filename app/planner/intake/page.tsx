"use client";
// app/planner/intake/page.tsx
import Wizard from '../Wizard';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { useRouter } from 'next/navigation';
import { buildDemoSnapshot } from '@/lib/strategy/ui/plannerStore';
import { useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import LoadDemo from './LoadDemo';
import { useSearchParams } from 'next/navigation';


function DemoLoader() {
  const { dispatch } = usePlanner();
  const params = useSearchParams();
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return;
    const demo = params.get('demo');
    if (demo) {
      const data = buildDemoSnapshot(demo);
      if (data) dispatch({ type: 'setAll', payload: data });
      once.current = true;
    }
  }, [params, dispatch]);
  return null;
}

export default function IntakePage() {
  const { state, dispatch } = usePlanner();
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
              value={state.data.filingStatus}
              onChange={(e) => dispatch({ type: 'updatePath', path: 'filingStatus', value: e.target.value })}
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
              value={state.data.state}
              onChange={(e) => dispatch({ type: 'updatePath', path: 'state', value: e.target.value })}
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
        <DemoLoader />
      </Suspense>
      <Wizard />
    </div>
  );
}
