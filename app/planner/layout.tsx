// app/planner/layout.tsx
import Link from 'next/link';

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-4 text-sm">
        <Link href="/planner/intake" className="underline text-emerald-700 hover:text-emerald-800">
          Intake
        </Link>
        <Link href="/planner/recommendations" className="underline text-emerald-700 hover:text-emerald-800">
          Recommendations
        </Link>
        <Link href="/planner/scenario" className="underline text-emerald-700 hover:text-emerald-800">
          Scenario
        </Link>
        <Link href="/planner/playbook" className="underline text-emerald-700 hover:text-emerald-800">
          Playbook
        </Link>
      </nav>
      {children}
    </div>
  );
}

