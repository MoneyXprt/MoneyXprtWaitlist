"use client";
// app/planner/intake/page.tsx
import Wizard from '../Wizard';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { buildDemoSnapshot } from '@/lib/strategy/ui/plannerStore';
import { useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
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
  const { state } = usePlanner();
  return (
    <div className="space-y-2">
      <div className="text-right text-sm">
        <Link href="/planner/intake?demo=ca300k1rental" className="underline text-emerald-700">
          Load demo
        </Link>
      </div>
      <Suspense fallback={null}>
        <DemoLoader />
      </Suspense>
      <Wizard />
    </div>
  );
}
