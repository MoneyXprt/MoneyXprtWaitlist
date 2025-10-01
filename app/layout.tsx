import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import SimpleAuthWidget from "./components/SimpleAuthWidget";
import type { Metadata } from "next";

// (Optional) If you want guaranteed Inter loading regardless of OS fonts,
// uncomment the next 2 lines and add `className={inter.className}` to <body>
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoneyXprt Beta",
  description:
    "AI-powered financial planning for high‑income earners — tax savings, entity optimization, and fee‑free investing with tamper‑evident reports.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Add `suppressHydrationWarning` only if you later mix themes */}
      <body className="min-h-screen bg-background text-neutral-800 antialiased">
        {/* Skip link for a11y */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded-md bg-foreground px-3 py-2 text-white"
        >
          Skip to content
        </a>

        {/* Compliance / info banner */}
        <div className="w-full bg-amber-100 text-amber-900 text-center text-sm py-2">
          MoneyXprt outputs are for informational purposes. All AI content may
          include [Unverified] estimates.
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="MoneyXprt home"
            >
              <Image
                src="/logo-alt.png"
                alt="MoneyXprt logo"
                width={36}
                height={36}
                className="rounded-full"
                priority
              />
              <span className="text-lg font-semibold tracking-tight text-neutral-900 group-hover:opacity-90">
                MoneyXprt
              </span>
            </Link>

            <nav
              className="hidden sm:flex items-center gap-6"
              aria-label="Primary"
            >
              <Link
                href="/"
                className="text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Home
              </Link>
              <Link
                href="/app"
                className="text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Beta
              </Link>
              <Link
                href="/reports"
                className="text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Reports
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Pricing
              </Link>
              
              <Link
                href="/scan"
                className="text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Tax Scan
              </Link>

              <Link
                href="/tax-efficiency"
                className="text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Tax Planning
              </Link>

              {/* CTA */}
              <Link
                href="/signup"
                className="text-sm rounded-lg px-3 py-2 bg-emerald-700 text-white shadow hover:bg-emerald-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                Get Started
              </Link>
              <Link href="/planner" className="text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5">
                Planner
              </Link>
            </nav>

            {/* Auth widget (keeps your existing logic/buttons) */}
            <div className="ml-4">
              <SimpleAuthWidget />
            </div>
          </div>
        </header>

        {/* Page container */}
        <main id="main" className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white">
          <div className="max-w-6xl mx-auto px-6 py-10 grid gap-6 sm:grid-cols-2 items-center">
            <p className="text-sm text-neutral-600">
              © {new Date().getFullYear()} MoneyXprt. All rights reserved.
            </p>

            <div className="justify-self-start sm:justify-self-end flex items-center gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Terms
              </Link>
              <Link
                href="/security"
                className="text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Security
              </Link>
              <Link
                href="/contact"
                className="text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 py-0.5"
              >
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
