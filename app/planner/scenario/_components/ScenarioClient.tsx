"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
export default function ScenarioClient() {
  const sp = useSearchParams();
  const scenarioId = sp.get("id") ?? undefined;
  return <div id="scenario-client" />;
}

