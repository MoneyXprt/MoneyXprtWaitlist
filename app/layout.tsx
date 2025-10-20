import './globals.css';
import Link from 'next/link';
import ClientErrorListeners from '@/components/ClientErrorListeners';

export const metadata = { title: 'MoneyXprt', description: 'AI Tax & Wealth Strategist' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-zinc-50">
      <body className="h-full">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[var(--mx-primary)] text-white grid place-items-center font-bold text-sm tracking-tighter">
                MX
              </div>
              <Link href="/" className="font-semibold text-lg tracking-tight text-[var(--mx-primary)]">
                MoneyXprt
              </Link>
              <nav className="hidden md:flex items-center gap-6 ml-8 text-sm text-zinc-600">
                <Link href="/" className="hover:text-[var(--mx-primary)]">Dashboard</Link>
                <Link href="/agent/new" className="hover:text-[var(--mx-primary)]">New Analysis</Link>
                <Link href="/history" className="hover:text-[var(--mx-primary)]">History</Link>
                <Link href="/compare" className="hover:text-[var(--mx-primary)]">Compare</Link>
                <Link href="/settings" className="hover:text-[var(--mx-primary)]">Settings</Link>
              </nav>
            </div>

            {/* Right: CTA */}
            <div className="flex items-center gap-2">
              <a href="/agent/new" className="btn">New Analysis</a>
            </div>
          </div>
        </header>

        {/* Page container with optional sidebar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* Optional Left Sidebar for dashboard feel */}
            <aside className="hidden lg:flex flex-col w-56 border-r bg-white py-6 px-4 rounded-xl">
              <h2 className="font-semibold text-lg mb-6">MoneyXprt</h2>
              <nav className="flex flex-col gap-2 text-sm text-zinc-600">
                <Link href="/" className="hover:text-[var(--mx-primary)]">🏠 Dashboard</Link>
                <Link href="/agent/new" className="hover:text-[var(--mx-primary)]">🧠 New Analysis</Link>
                <Link href="/history" className="hover:text-[var(--mx-primary)]">📜 History</Link>
                <Link href="/compare" className="hover:text-[var(--mx-primary)]">📈 Compare</Link>
                <Link href="/settings" className="hover:text-[var(--mx-primary)]">⚙️ Settings</Link>
              </nav>
            </aside>
            <main className="flex-1">{children}</main>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-zinc-500 flex justify-between">
            <span>© {new Date().getFullYear()} MoneyXprt, Inc.</span>
            <span>Educational only — not legal or tax advice.</span>
          </div>
        </footer>
      </body>
      {/* Client-side error listeners + optional Sentry init */}
      <ClientErrorListeners />
    </html>
  );
}
