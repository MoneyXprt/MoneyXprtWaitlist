"use client";

import * as React from "react";

async function getSentry() {
  // Dynamically import Sentry if available; noop if not installed
  try {
    const mod = await import("@sentry/nextjs");
    return mod as any;
  } catch {
    return null;
  }
}

export default function ClientErrorListeners() {
  React.useEffect(() => {
    const onError = async (event: ErrorEvent) => {
      const Sentry = await getSentry();
      if (Sentry) Sentry.captureException(event.error || event.message);
    };
    const onRejection = async (event: PromiseRejectionEvent) => {
      const Sentry = await getSentry();
      if (Sentry) Sentry.captureException(event.reason);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
