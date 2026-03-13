import { cleanExpiredSessions } from "~/lib/auth";
import { env } from "~/lib/env";

/**
 * Cron cleanup endpoint — call daily via an external scheduler (cron-job.org, Vercel cron, etc.)
 * Requires the Authorization header: `Bearer <CRON_SECRET>`
 *
 * Example cron-job.org setup:
 *   URL: https://yourdomain.com/api/cron/cleanup
 *   Method: POST
 *   Header: Authorization: Bearer <CRON_SECRET>
 *   Schedule: daily at 03:00 UTC
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const secret = env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await cleanExpiredSessions();
  return Response.json({ ok: true, deletedSessions: deleted });
}
