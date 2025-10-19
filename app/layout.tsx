import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'MoneyXprt', description: 'AI Tax & Wealth Strategist' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-zinc-50">
      <body className="h-full">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-xl bg-black text-white grid place-items-center font-bold">MX</div>
              <Link href="/" className="font-semibold tracking-tight">MoneyXprt</Link>
              <nav className="hidden md:flex items-center gap-6 ml-8 text-sm text-zinc-600">
                <Link href="/intake" className="hover:text-black">Agent</Link>
                <Link href="/history" className="hover:text-black">History</Link>
                <Link href="/compare" className="hover:text-black">Compare</Link>
                <Link href="/mx-test" className="hover:text-black">API Test</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/intake"
                className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-100"
              >
                New analysis
              </Link>
            </div>
          </div>
        </header>

        {/* Page container */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>

        {/* Footer */}
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-zinc-500">
            Educational only — not legal, tax, or financial advice. Consult licensed professionals.
          </div>
        </footer>
      </body>
    </html>
  );
}
