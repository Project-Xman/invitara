/**
 * Next.js instrumentation hook. Runs once on server boot.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    try {
      // @ts-ignore — config has side-effects only
      await import("./sentry.server.config");
    } catch (err) {
      console.warn("[instrumentation] Sentry server init failed:", err);
    }
  }
  if (process.env.NEXT_RUNTIME === "edge" && process.env.SENTRY_DSN) {
    try {
      // @ts-ignore — config has side-effects only
      await import("./sentry.edge.config");
    } catch (err) {
      console.warn("[instrumentation] Sentry edge init failed:", err);
    }
  }
}
