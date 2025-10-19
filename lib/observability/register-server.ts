// Register Node.js-level error handlers for API routes.
// This file is safe to import multiple times; it guards against double registration.

declare global {
  // eslint-disable-next-line no-var
  var __mx_obs_registered: boolean | undefined;
}

if (!global.__mx_obs_registered) {
  global.__mx_obs_registered = true;

  const capture = async (err: unknown) => {
    try {
      // @ts-expect-error optional dependency may be missing in local dev
      const Sentry = await import('@sentry/nextjs');
      try {
        Sentry.captureException(err);
      } catch {}
    } catch {}
  };

  process.on('unhandledRejection', (reason) => {
    void capture(reason);
  });
  process.on('uncaughtException', (err) => {
    void capture(err);
  });
}

