import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/nav/SiteHeader";

// (Optional) If you want guaranteed Inter loading regardless of OS fonts,
// uncomment the next 2 lines and add `className={inter.className}` to <body>
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoneyXprt — AI Tax Strategy for High Earners",
  description:
    "Advanced tax strategies (QBI, PTET, cost seg, Augusta, etc.) with a scenario builder and exportable playbook.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* global info banner (kept) */}
        <div className="w-full bg-amber-50 text-center text-xs text-amber-900">
          <div className="mx-auto max-w-6xl px-3 py-2">
            MoneyXprt outputs are for informational purposes. All AI content may include [Unverified] estimates.
          </div>
        </div>

        <SiteHeader />

        <main>{children}</main>

        <footer className="mt-16 border-t bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-2 px-4 py-8 text-sm text-gray-500 md:grid-cols-3">
            <div>© {new Date().getFullYear()} MoneyXprt. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-gray-700">Privacy</a>
              <a href="/terms" className="hover:text-gray-700">Terms</a>
              <a href="/security" className="hover:text-gray-700">Security</a>
              <a href="/contact" className="hover:text-gray-700">Contact</a>
            </div>
            <div className="md:text-right">
              <a href="/labs" className="hover:text-gray-700">Labs → Tax Strategy Engine (MVP)</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
