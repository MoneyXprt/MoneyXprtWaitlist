"use client";
import React from "react";

export type HistoryClientProps = {
  initialPlanId?: string;
};

export default function HistoryClient({ initialPlanId }: HistoryClientProps) {
  // TODO: wire into existing UI logic (fetch history for the plan, preselect snapshot, etc.)
  // This stub ensures typing is correct; keep the DOM stable for now.
  return (
    <div data-testid="history-client-root">
      {/* placeholder to keep structure stable */}
    </div>
  );
}
