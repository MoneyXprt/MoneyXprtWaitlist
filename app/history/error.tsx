'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border bg-white p-6 max-w-xl">
      <h2 className="text-lg font-semibold mb-2">History had a hiccup</h2>
      <p className="text-sm text-slate-600 mb-4">{error.message || 'Unexpected error'}</p>
      <button onClick={() => reset()} className="px-3 py-2 rounded border">Try again</button>
    </div>
  );
}

