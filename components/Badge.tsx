// components/Badge.tsx
import React from "react";

export function Badge({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
    >
      {children}
    </span>
  );
}

