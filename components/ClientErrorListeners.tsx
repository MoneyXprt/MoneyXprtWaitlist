"use client";

import * as React from "react";

async function getSentry() {
  // Dynamically import Sentry if available; noop if not installed
  try {
    // @ts-expect-error optional dependency may be missing in local dev
    const mod = await import("@sentry/nextjs");
    return mod as any;
  } catch {
    return null;
  }
}

async function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return; // disabled if not configured
  const Sentry = await getSentry();
  if (!Sentry) return;
  const env = process.env.NEXT_PUBLIC_SENTRY_ENV || process.env.NODE_ENV || "development";
  try {
    Sentry.init({ dsn, environment: env, tracesSampleRate: 0.1 });
  } catch {
    // ignore init errors
  }
}

export default function ClientErrorListeners() {
  React.useEffect(() => {
    void initSentry();

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

