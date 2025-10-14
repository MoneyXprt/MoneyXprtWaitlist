"use client";
// app/planner/layout.tsx
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePlannerStore } from '@/lib/store/planner';

function SubNav() {
  const path = usePathname();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId') ?? '';
  const includeHighRisk = usePlannerStore((s) => s.includeHighRisk);
  const toggleHighRisk = usePlannerStore((s) => s.toggleHighRisk);
  const [showAck, setShowAck] = useState(false);
  const onToggle = (checked: boolean) => {
    if (checked) {
      const hasAck = document.cookie.split('; ').some((c) => c.startsWith('planner_high_risk_ack='));
      if (!hasAck) {
        setShowAck(true);
        return;
      }
    }
    toggleHighRisk(checked);
  };
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
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="px-3 py-1 rounded bg-emerald-700 text-white text-sm disabled:opacity-50"
          onClick={() => {
            if (!planId) {
              alert('Provide a planId in the URL (?planId=...) to export the PDF.');
              return;
            }
            try {
              // Optional: quick user feedback
              // eslint-disable-next-line no-console
              console.info('Preparing PDF…');
              window.open(`/api/playbook/export?planId=${planId}`, '_blank');
            } catch {}
          }}
          disabled={!planId}
          aria-disabled={!planId}
          title={planId ? 'Export Playbook PDF' : 'Add ?planId=... to enable export'}
        >
          Export Playbook PDF
        </button>
        <label className="text-sm flex items-center gap-2">
        <input type="checkbox" checked={includeHighRisk} onChange={(e) => onToggle(e.target.checked)} />
        High-Risk
        </label>
      </div>
      {showAck && (
        <div role="dialog" aria-modal className="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div className="max-w-md w-full rounded bg-white p-4 space-y-3">
            <h2 className="font-semibold">Enable High-Risk strategies?</h2>
            <p className="text-sm text-neutral-700">
              High-Risk strategies carry elevated audit and legal risk. This is not tax or legal advice. Proceed?
            </p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => setShowAck(false)}>Cancel</button>
              <button
                className="px-3 py-1 rounded bg-emerald-700 text-white"
                onClick={() => {
                  const expires = new Date();
                  expires.setFullYear(expires.getFullYear() + 1);
                  document.cookie = `planner_high_risk_ack=1; path=/; expires=${expires.toUTCString()}`;
                  setShowAck(false);
                  toggleHighRisk(true);
                }}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SubNav />
      <div role="note" className="bg-amber-50 border-b text-amber-900 text-sm">
        <div className="container mx-auto p-3">
          This Planner provides educational insights only and is not legal or tax advice. Consult a qualified CPA/attorney before implementing strategies.
        </div>
      </div>
      {children}
    </div>
  );
}
