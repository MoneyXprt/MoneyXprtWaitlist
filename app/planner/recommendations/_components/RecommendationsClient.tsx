"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
export default function RecommendationsClient() {
  const sp = useSearchParams();
  const sort = sp.get("sort") ?? undefined;
  return <div id="recommendations-client" />;
}
