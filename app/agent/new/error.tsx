'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error('Agent/New error:', error);
  return (
    <div className="mx-auto max-w-lg rounded-2xl border p-6 text-center">
      <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Try again, or go back to the Dashboard.
      </p>
      <div className="mt-4 flex gap-2 justify-center">
        <button className="btn" onClick={() => reset()}>Try Again</button>
        <a className="btn btn-outline" href="/dashboard">Go Home</a>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 max-h-60 overflow-auto text-left text-xs">{String(error.stack ?? error.message)}</pre>
      )}
    </div>
  );
}

