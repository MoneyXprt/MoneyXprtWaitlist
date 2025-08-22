import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import SimpleAuthWidget from "../components/SimpleAuthWidget";

export const metadata = { title: "MoneyXprt Beta" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {/* Compliance / info banner */}
        <div className="w-full bg-amber-100 text-amber-900 text-center text-sm py-2">
          MoneyXprt outputs are for informational purposes. All AI content may include [Unverified] estimates.
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" aria-label="MoneyXprt home">
              <Image
                src="/logo.png"
                alt="MoneyXprt logo"
                width={36}
                height={36}
                className="rounded-full"
                priority
              />
              <span className="text-lg font-bold tracking-tight">MoneyXprt</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-6">
              <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
                Home
              </Link>
              <Link href="/app" className="text-sm text-neutral-600 hover:text-neutral-900">
                Beta
              </Link>
              <Link href="/reports" className="text-sm text-neutral-600 hover:text-neutral-900">
                Reports
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                Pricing
              </Link>
              <Link
                href="/signup"
                className="text-sm rounded-lg px-3 py-1.5 bg-foreground text-white hover:opacity-90"
              >
                Sign Up
              </Link>
            </nav>

            {/* Auth widget (keeps your existing logic/buttons) */}
            <div className="ml-4">
              <SimpleAuthWidget />
            </div>
          </div>
        </header>

        {/* Page container */}
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>

        {/* Footer */}
        <footer className="border-t">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
            <p>© {new Date().getFullYear()} MoneyXprt</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-neutral-900">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-neutral-900">
                Terms
              </Link>
              <Link href="/security" className="hover:text-neutral-900">
                Security
              </Link>
              <Link href="/contact" className="hover:text-neutral-900">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
