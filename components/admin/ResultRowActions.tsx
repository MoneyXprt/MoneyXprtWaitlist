'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function ResultRowActions({ id, isPublic }: { id: string; isPublic: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  return (
    <div className="flex items-center gap-2">
      {isPublic && (
        <button
          className="px-2 py-1 text-xs border rounded hover:bg-zinc-50"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await fetch(`/api/admin/results/${id}/private`, { method: 'POST' });
            } finally {
              setBusy(false);
              router.refresh();
            }
          }}
        >
          Make Private
        </button>
      )}
      <button
        className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50"
        disabled={busy}
        onClick={async () => {
          if (!confirm('Delete this result?')) return;
          setBusy(true);
          try {
            await fetch(`/api/admin/results/${id}/delete`, { method: 'DELETE' });
          } finally {
            setBusy(false);
            router.refresh();
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}

