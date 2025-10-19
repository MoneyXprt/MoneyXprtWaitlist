"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const nav = [
  { href: '/intake', label: 'Agent' },
  { href: '/history', label: 'History' },
  { href: '/compare', label: 'Compare' },
  { href: '/mx-test', label: 'API Test' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">MoneyXprt</Link>
        <nav className="hidden md:flex items-center gap-2">
          {nav.map(i => (
            <Link key={i.href} href={i.href}>
              <Button variant={pathname === i.href ? 'default' : 'ghost'} size="sm">
                {i.label}
              </Button>
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="md:hidden" variant="outline" size="sm"><Menu size={18} /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="mt-8 flex flex-col gap-2">
              {nav.map(i => (
                <Link key={i.href} href={i.href}><Button variant="ghost" className="w-full justify-start">{i.label}</Button></Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
