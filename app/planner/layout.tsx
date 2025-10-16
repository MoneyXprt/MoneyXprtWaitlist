export const dynamic = "force-dynamic"
import Link from "next/link"

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
      <div className="flex gap-4 border-b px-4 py-2 text-sm">
        {tabs.map(t => (
          <Link key={t.href} href={t.href} className="text-neutral-700 hover:text-black">
            {t.label}
          </Link>
        ))}
      </div>
      <div className="min-h-[40vh]">{children}</div>
    </div>
  )
}
