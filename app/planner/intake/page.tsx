"use client";
// app/planner/intake/page.tsx
import Wizard from '../Wizard';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { useEffect } from 'react';
import type { PlanInput } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function IntakePage() {
  // Ensure Wizard reads/writes planner store via props override where possible
  const { state, dispatch } = usePlanner();
  // Wizard currently manages its own state; keep it, but prime defaults from store on mount by cloning EMPTY_PLAN in Wizard.
  // No additional wiring needed here yet; future change can lift Wizard's state.
  useEffect(() => {
    // placeholder to show store is available
  }, [state.data]);
  return <Wizard />;
}
