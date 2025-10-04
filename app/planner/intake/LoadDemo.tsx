"use client";
import { useRouter } from "next/navigation";
import { saveSnapshot } from "@/lib/planner/snapshotStore";

export default function LoadDemo() {
  const router = useRouter();

  const demo = {
    settings: { states: ["CA"], year: 2025 },
    profile: { filingStatus: "Single" },
    income: { w2: 300_000, k1: 120_000, se: 0 },
    entities: [{ type: "S-Corp", wages: 180_000 }],
    properties: [{ type: "rental", basis: 450_000 }],
    dependents: 2,
  };

  function handleClick() {
    saveSnapshot(demo);
    // go straight to recs; your page might be /planner/recommendations or /planner/recs
    router.push("/planner/recommendations");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
      aria-label="Load demo snapshot"
      title="Loads a realistic CA high-earner with S-Corp + Rental"
    >
      Load demo data
    </button>
  );
}

