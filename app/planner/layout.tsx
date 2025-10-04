"use client";
// app/planner/layout.tsx
import Link from 'next/link';
import { PlannerProvider } from '@/lib/strategy/ui/plannerStore';
import { usePathname } from 'next/navigation';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';

function SubNav() {
  const path = usePathname();
  const { state, dispatch } = usePlanner();
  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={
        'px-2 py-1 rounded ' +
        (path === href ? 'bg-emerald-700 text-white' : 'underline text-emerald-700 hover:text-emerald-800')
      }
      aria-current={path === href ? 'page' : undefined}
    >
      {label}
    </Link>
  );
  return (
    <div className="flex items-center justify-between gap-4">
      <nav className="flex flex-wrap gap-2 text-sm">
        {link('/planner/intake', 'Intake')}
        {link('/planner/recommendations', 'Recommendations')}
        {link('/planner/scenario', 'Scenario')}
        {link('/planner/playbook', 'Playbook')}
      </nav>
      <label className="text-sm flex items-center gap-2">
        <input
          type="checkbox"
          checked={state.includeHighRisk}
          onChange={(e) => dispatch({ type: 'toggleHighRisk', value: e.target.checked })}
        />
        High-Risk
      </label>
    </div>
  );
}

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlannerProvider>
      <div className="space-y-6">
        <SubNav />
        {children}
      </div>
    </PlannerProvider>
  );
}
