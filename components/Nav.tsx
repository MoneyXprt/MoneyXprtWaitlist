"use client";
import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/agent/new', label: 'New Analysis' },
  { href: '/history', label: 'History' },
  { href: '/compare', label: 'Compare' },
  { href: '/settings', label: 'Settings' },
]

export default function Nav({ usage }: { usage?: string }) {
  const pathname = usePathname()
  return (
    <nav className="hidden md:flex items-center gap-6 ml-8 text-sm text-zinc-600">
      {links.map((l) => {
        const active = pathname === l.href
        return (
          <Link key={l.href} href={l.href} className={active ? 'text-[var(--mx-primary)] font-medium' : 'hover:text-[var(--mx-primary)]'}>
            {l.label}
          </Link>
        )
      })}
      {usage && (
        <span className="text-xs rounded-full border px-2 py-1 ml-2">{usage}</span>
      )}
    </nav>
  )
}

