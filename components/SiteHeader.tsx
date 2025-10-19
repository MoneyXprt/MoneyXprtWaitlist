import Link from 'next/link'

const links: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/intake', label: 'Intake' },
  { href: '/scenarios', label: 'History' },
  { href: '/compare', label: 'Compare' },
  { href: '/app', label: 'Tools' },
]

export default function SiteHeader() {
  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          MoneyXprt
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-700">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-black">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

