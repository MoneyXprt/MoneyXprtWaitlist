"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const isActive = path === href;
  const className =
    'text-sm rounded-md px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ' +
    (isActive ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900');
  return (
    <Link href={href} aria-current={isActive ? 'page' : undefined} className={className}>
      {children}
    </Link>
  );
}

export default function TopNav() {
  const showPlanner = process.env.NEXT_PUBLIC_ENABLE_PLANNER === undefined || process.env.NEXT_PUBLIC_ENABLE_PLANNER === 'true';
  return (
    <nav className="hidden sm:flex items-center gap-6" aria-label="Primary">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/app">Beta</NavLink>
      <NavLink href="/reports">Reports</NavLink>
      <NavLink href="/pricing">Pricing</NavLink>
      {showPlanner ? <NavLink href="/planner/intake">Planner</NavLink> : null}
      <NavLink href="/labs">Labs</NavLink>
      <NavLink href="/login">Sign in</NavLink>
    </nav>
  );
}

