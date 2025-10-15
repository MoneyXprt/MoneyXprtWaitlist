"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
export default function HistoryClient() {
  const sp = useSearchParams();
  const snapshot = sp.get("snapshot") ?? undefined;
  return <div id="history-client" />;
}
