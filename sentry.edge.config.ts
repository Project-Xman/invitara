export {};

async function initSentryEdge() {
  try {
    const Sentry: any = await import("@sentry/nextjs" as any).catch(() => null);
    if (!Sentry || !process.env.SENTRY_DSN) return;
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
  } catch {}
}
void initSentryEdge();
