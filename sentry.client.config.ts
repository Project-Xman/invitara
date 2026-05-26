export {};

async function initSentryClient() {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  try {
    const Sentry: any = await import("@sentry/nextjs" as any).catch(() => null);
    if (!Sentry) return;
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch {}
}
void initSentryClient();
