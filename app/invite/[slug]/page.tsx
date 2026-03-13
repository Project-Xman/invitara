import type { Metadata } from "next";
import { getInvitationBySlug } from "~/lib/actions";
import { InviteClient, InviteNotFound } from "./InviteClient";
import { env } from "~/lib/env";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await getInvitationBySlug({ slug });
    if (!data) return { title: "Invitation Not Found — Invitara" };

    const { invitation } = data;
    const names = [invitation.groomName, invitation.brideName].filter(Boolean).join(" & ");
    const title = names ? `${names}'s Wedding Invitation` : "Wedding Invitation";
    const description =
      invitation.message ??
      (invitation.venue
        ? `Join us for the celebration at ${invitation.venue}`
        : "You're cordially invited to our wedding celebration!");
    const appUrl = env.APP_URL || "https://invitara.app";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${appUrl}/invite/${slug}`,
        siteName: "Invitara",
        type: "website",
        images: [{ url: `${appUrl}/api/og?slug=${slug}`, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${appUrl}/api/og?slug=${slug}`],
      },
    };
  } catch {
    return { title: "Wedding Invitation — Invitara" };
  }
}

export default async function PublicInvitePage({ params }: Props) {
  const { slug } = await params;
  try {
    const data = await getInvitationBySlug({ slug });
    if (!data) return <InviteNotFound />;
    const { invitation, events, template } = data;
    return (
      <InviteClient
        invitation={invitation as any}
        events={events as any}
        template={template as any}
      />
    );
  } catch {
    return <InviteNotFound />;
  }
}
