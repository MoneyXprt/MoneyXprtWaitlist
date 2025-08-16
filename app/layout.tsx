import './globals.css';
import SimpleAuthWidget from '../components/SimpleAuthWidget';

export const metadata = { title: 'MoneyXprt Beta' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">
        <div className="w-full bg-amber-100 text-amber-900 text-center text-sm py-2">
          MoneyXprt outputs are for informational purposes. All AI content may include [Unverified] estimates.
        </div>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">MoneyXprt</h1>
            <nav className="flex gap-4">
              <a href="/" className="text-sm text-neutral-600 hover:text-neutral-900">Home</a>
              <a href="/app" className="text-sm text-neutral-600 hover:text-neutral-900">Beta</a>
              <a href="/reports" className="text-sm text-neutral-600 hover:text-neutral-900">Reports</a>
              <a href="/signup" className="text-sm text-neutral-600 hover:text-neutral-900">Sign Up</a>
            </nav>
          </div>
          <SimpleAuthWidget />
        </div>
        <div className="max-w-5xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}