import "./globals.css";
import "./print.css";
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'MoneyXprt — AI Tax & Wealth Strategist',
  description: 'Legally minimize taxes, protect assets, and accelerate wealth building.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-3 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-3 pb-10 pt-4 text-xs text-gray-500">
          This information is for educational purposes only and does not constitute legal, tax, or financial advice.
          Always consult a licensed CPA, tax attorney, or fiduciary before implementation.
        </footer>
      </body>
    </html>
  );
}
