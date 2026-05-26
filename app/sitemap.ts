import type { MetadataRoute } from "next";
import { db } from "~/lib/drizzle";
import { templates, invitations } from "~/lib/schema";
import { and, eq } from "drizzle-orm";
import { env } from "~/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.APP_URL.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/templates`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/pricing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/auth/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/auth/register`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  let templateRoutes: MetadataRoute.Sitemap = [];
  let inviteRoutes: MetadataRoute.Sitemap = [];

  try {
    const tmpls = await db
      .select({ id: templates.id })
      .from(templates)
      .where(eq(templates.active, true));
    templateRoutes = tmpls.map((t) => ({
      url: `${base}/templates/${t.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {}

  try {
    const invs = await db
      .select({ slug: invitations.slug, updatedAt: invitations.updatedAt })
      .from(invitations)
      .where(eq(invitations.published, true))
      .limit(5000);
    inviteRoutes = invs.map((i) => ({
      url: `${base}/invite/${i.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: i.updatedAt ?? undefined,
    }));
  } catch {}

  return [...staticRoutes, ...templateRoutes, ...inviteRoutes];
}
