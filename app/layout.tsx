import './globals.css';
import AuthWidget from '@/components/AuthWidget';

export const metadata = { title: 'MoneyXprt Beta' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">
        <div className="w-full bg-amber-100 text-amber-900 text-center text-sm py-2">
          MoneyXprt outputs are for informational purposes. All AI content may include [Unverified] estimates.
        </div>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">MoneyXprt</h1>
          <AuthWidget />
        </div>
        <div className="max-w-5xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}