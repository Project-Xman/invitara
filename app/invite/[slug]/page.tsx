"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { publicInviteQueryOptions } from "~/lib/queries";
import { InvitationPreview } from "~/components/InvitationPreview";
import { RsvpForm } from "~/components/RsvpForm";

export default function PublicInvitePage({ params }: { params: { slug: string } }) {
  const { data, isLoading, isError } = useQuery(publicInviteQueryOptions(params.slug));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <div className="mb-2 text-6xl">💌</div>
        <h1 className="text-center font-display text-3xl font-bold">Invitation Not Found</h1>
        <p className="max-w-sm text-center text-sm opacity-45">
          This invitation may have been unpublished or the link might be incorrect.
        </p>
        <Link href="/" className="btn-gold mt-2 !px-6 !py-2.5">
          Go to Invitara
        </Link>
      </div>
    );
  }

  const { invitation, events, template } = data;

  const fallbackTemplate = {
    id: "beach",
    gradient: "linear-gradient(135deg,#A67C2E,#D4A853,#FFE49A,#C49A3D)",
    colors: {
      primary: "#A67C2E",
      secondary: "#D4A853",
      bg: "#FDF8F0",
      accent: "#F5E6CC",
      text: "#3A2A10",
      card: "#FFFDF5",
    },
  };

  const activeTmpl = template ?? fallbackTemplate;

  const invData = {
    groomName: invitation.groomName ?? "",
    brideName: invitation.brideName ?? "",
    groomFamily: invitation.groomFamily ?? "",
    brideFamily: invitation.brideFamily ?? "",
    blessingFrom: invitation.blessingFrom ?? "",
    mantra: invitation.mantra ?? "",
    message: invitation.message ?? "",
    hashtag: invitation.hashtag ?? "",
    weddingDate: invitation.weddingDate
      ? new Date(invitation.weddingDate).toISOString().slice(0, 10)
      : "",
    venue: invitation.venue ?? "",
    mapLink: invitation.mapLink ?? "",
    instagramLink: invitation.instagramLink ?? "",
    whatsappNumber: invitation.whatsappNumber ?? "",
  };

  return (
    <div className="min-h-screen" style={{ background: activeTmpl.colors?.bg }}>
      <div className="mx-auto max-w-lg bg-white shadow-gold-xl">
        <InvitationPreview
          invitation={invData}
          events={events as any}
          template={activeTmpl}
          fullWidth
        />
      </div>

      <div className="mx-auto max-w-lg px-6 py-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[3px] text-gold-600/70">
            RSVP
          </p>
          <h2 className="font-display text-2xl font-bold md:text-3xl">Will you join us?</h2>
          <p className="mt-2 text-sm opacity-45">
            Let us know if you&apos;ll be attending the celebrations.
          </p>
        </div>
        <RsvpForm invitationId={invitation.id} events={events as any} />
      </div>

      <div className="py-6 text-center opacity-30">
        <p className="text-xs">
          Made with <span className="font-script text-base text-gold-600">Invitara</span>
        </p>
      </div>
    </div>
  );
}
