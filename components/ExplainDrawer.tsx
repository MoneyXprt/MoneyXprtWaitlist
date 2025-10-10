// components/ExplainDrawer.tsx
"use client";
import * as React from "react";

type ExplainProps = {
  open: boolean;
  onClose: () => void;
  payload?: { code: string; name: string; savingsEst?: number; states?: string[] };
};

export default function ExplainDrawer({ open, onClose, payload }: ExplainProps) {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!open || !payload) return;
    setLoading(true);
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [open, payload]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <aside className="ml-auto h-full w-full max-w-md bg-white p-4 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Explain</h3>
          <button onClick={onClose} className="text-sm underline">Close</button>
        </div>
        {loading && <p className="text-sm text-gray-500">Thinking…</p>}
        {!loading && data && (
          <div className="space-y-4">
            <h4 className="text-base font-semibold">{data.title}</h4>
            {data.estSavingsCopy && <p className="text-sm">{data.estSavingsCopy}</p>}
            <section>
              <h5 className="text-sm font-semibold">Why this works</h5>
              <p className="text-sm text-gray-700">{data.plainWhy}</p>
            </section>
            <section>
              <h5 className="text-sm font-semibold">Key assumptions</h5>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {data.assumptions?.map((a: string, i: number) => <li key={i}>{a}</li>)}
              </ul>
            </section>
            <section>
              <h5 className="text-sm font-semibold">Docs you’ll need</h5>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {data.docs?.map((d: string, i: number) => <li key={i}>{d}</li>)}
              </ul>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}

