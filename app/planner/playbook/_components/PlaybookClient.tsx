"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
export default function PlaybookClient() {
  const sp = useSearchParams();
  const version = sp.get("version") ?? undefined;
  return <div id="playbook-client" />;
}
