"use client";
import React from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PlannerClient() {
  const sp = useSearchParams();
  useEffect(() => {
    const qs = sp.toString();
    const target = qs ? `/planner/intake?${qs}` : `/planner/intake`;
    // Client-side redirect to keep CSR-only params handling
    window.location.replace(target);
  }, [sp]);
  return <div className="p-6 text-sm text-neutral-500">Loading…</div>;
}

