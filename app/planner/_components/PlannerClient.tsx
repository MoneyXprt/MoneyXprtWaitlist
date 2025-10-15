"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
export default function PlannerClient() {
  const sp = useSearchParams();
  // pull what you need, pass to your existing client UI
  const planId = sp.get("planId") ?? undefined;
  return <div id="planner-client" />;
}
