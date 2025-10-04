"use client";
import { useEffect, useState } from "react";
import { loadSnapshot } from "@/lib/planner/snapshotStore";

export default function RecommendationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const snap = loadSnapshot();
    fetch("/api/plan/recommend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ snapshot: snap ?? {} }),
    })
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  // ...render your existing list using `items`
  return <div>{loading ? "Loading…" : /* your list here */ null}</div>;
}

