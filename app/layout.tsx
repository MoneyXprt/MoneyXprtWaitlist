import "./globals.css";
import "./print.css";
import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', style: ['normal'] });

export const metadata: Metadata = {
  title: 'MoneyXprt — AI Tax & Wealth Strategist',
  description: 'Legally minimize taxes, protect assets, and accelerate wealth building.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-gray-50 text-slate-900 antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-slate-500">
          Educational only — not legal, tax, or financial advice. Consult licensed professionals.
        </footer>
      </body>
    </html>
  );
}
