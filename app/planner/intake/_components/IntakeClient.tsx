"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
export default function IntakeClient() {
  const sp = useSearchParams();
  const step = sp.get("step") ?? undefined;
  return <div id="intake-client" />;
}

