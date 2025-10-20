'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error('Agent/New error:', error); // shows stack in Vercel console
  return (
    <div className="mx-auto max-w-xl rounded-2xl border p-6 text-center">
      <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mt-1">Try again, or go back to the Dashboard.</p>

      {/* TEMP: show the actual message so we see what's breaking */}
      <pre className="mt-3 text-left text-xs max-h-48 overflow-auto bg-zinc-50 p-3 rounded">
        {String(error?.message || error)}
      </pre>

      <div className="mt-4 flex gap-2 justify-center">
        <button className="btn" onClick={() => reset()}>Try Again</button>
        <a className="btn btn-outline" href="/history">Go Home</a>
      </div>
    </div>
  );
}
