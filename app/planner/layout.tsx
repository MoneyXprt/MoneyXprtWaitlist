export const dynamic = "force-dynamic"
import React, { Suspense } from 'react'
import Link from "next/link"
import PageShell from '@/components/ui/PageShell'
import Toolbar from '@/components/ui/Toolbar'
import HelpDrawer from '@/components/ui/HelpDrawer'
import LoadingBlock from '@/components/ui/LoadingBlock'
import ContextBarClient from './_components/ContextBarClient'

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  const tabs = [
    { href: "/planner", label: "Intake" },
    { href: "/planner/recommendations", label: "Recommendations" },
    { href: "/planner/scenario", label: "Scenario" },
    { href: "/planner/playbook", label: "Playbook" },
    { href: "/planner/history", label: "History" },
  ]
  return (
    <div className="w-full">
      {/* Top tabs */}
      <div className="border-b bg-background">
        <PageShell>
          <Toolbar
            aria-label="Planner navigation"
            left={
              <nav aria-label="Planner tabs" className="flex flex-wrap items-center gap-4 text-sm">
                {tabs.map(t => (
                  <Link key={t.href} href={t.href} className="text-neutral-700 hover:text-black focus-visible:ring-2 ring-emerald-600 rounded-sm">
                    {t.label}
                  </Link>
                ))}
              </nav>
            }
            right={<HelpDrawer label="Learn why" title="Why this is educational only">
              MoneyXprt provides educational information to help you have better conversations with your tax professional. We are not a tax or legal advisor, and nothing here is tax, legal, or financial advice.
            </HelpDrawer>}
          />
        </PageShell>
      </div>

      {/* Disclaimer bar below tabs */}
      <div className="border-b bg-amber-50 text-amber-900">
        <PageShell>
          <div className="py-2 text-sm flex items-center justify-between gap-3">
            <div>Educational only, not tax or legal advice.</div>
            <HelpDrawer label="Learn why" title="Why this disclaimer?">
              This planner suggests ideas you can explore with a qualified CPA or attorney. Your situation is unique; use this for education only.
            </HelpDrawer>
          </div>
        </PageShell>
      </div>

      {/* Sticky context bar */}
      <div className="sticky top-0 z-30 border-b bg-white/80 dark:bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <PageShell>
          <ContextBarClient />
        </PageShell>
      </div>

      {/* Page content wrapped in Suspense */}
      <PageShell>
        <Suspense fallback={<LoadingBlock className="h-24 rounded-2xl" radius="2xl" />}> 
          {children}
        </Suspense>
      </PageShell>
    </div>
  )
}
