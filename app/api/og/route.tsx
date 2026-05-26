import { ImageResponse } from "next/og";
import { db } from "~/lib/drizzle";
import { invitations } from "~/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  let groom = "The Couple";
  let bride = "Their Wedding";
  let date: string | null = null;
  let venue: string | null = null;
  let firstPhoto: string | null = null;

  if (slug) {
    try {
      const [inv] = await db
        .select({
          groomName: invitations.groomName,
          brideName: invitations.brideName,
          weddingDate: invitations.weddingDate,
          venue: invitations.venue,
          photos: invitations.photos,
        })
        .from(invitations)
        .where(eq(invitations.slug, slug))
        .limit(1);
      if (inv) {
        groom = inv.groomName;
        bride = inv.brideName;
        date = inv.weddingDate
          ? new Date(inv.weddingDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : null;
        venue = inv.venue ?? null;
        firstPhoto = Array.isArray(inv.photos) && inv.photos.length > 0 ? inv.photos[0] : null;
      }
    } catch {}
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fbf6e8 0%, #f5e8c9 100%)",
          fontFamily: "Georgia, serif",
          padding: 60,
          position: "relative",
        }}
      >
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt=""
            width={240}
            height={240}
            style={{
              borderRadius: 9999,
              objectFit: "cover",
              border: "6px solid #D4A853",
              marginBottom: 32,
            }}
          />
        ) : (
          <div style={{ fontSize: 88, marginBottom: 16 }}>💍</div>
        )}

        <div style={{ fontSize: 26, color: "#8a6d2a", letterSpacing: 4, marginBottom: 12 }}>
          WEDDING INVITATION
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            fontSize: 72,
            color: "#5c4a1a",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          <span>{groom}</span>
          <span style={{ color: "#D4A853", fontSize: 60 }}>&amp;</span>
          <span>{bride}</span>
        </div>

        {date ? (
          <div style={{ marginTop: 32, fontSize: 32, color: "#7a6238" }}>{date}</div>
        ) : null}
        {venue ? (
          <div
            style={{
              marginTop: 12,
              fontSize: 22,
              color: "#9a8868",
              maxWidth: "80%",
              textAlign: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {venue}
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 50,
            fontSize: 18,
            color: "#b8a878",
            letterSpacing: 2,
          }}
        >
          INVITARA
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
