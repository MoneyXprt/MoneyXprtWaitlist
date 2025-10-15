"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
export default function ScenariosClient() {
  const sp = useSearchParams();
  const view = sp.get("view") ?? undefined;
  return <div id="scenarios-client" />;
}
