"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/intake', label: 'Agent (Intake)' },
  { href: '/history', label: 'History' },
  { href: '/compare', label: 'Compare' },
  { href: '/mx-test', label: 'API Test' }, // optional dev page
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">MoneyXprt</Link>
        <nav className="hidden md:flex items-center gap-4">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2 py-1 rounded ${pathname === l.href ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden px-3 py-2 border rounded" onClick={()=>setOpen(v=>!v)}>
          Menu
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto max-w-6xl px-3 py-2 flex flex-col gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-2 py-2 rounded ${pathname === l.href ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
