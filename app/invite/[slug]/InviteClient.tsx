"use client";

import Link from "next/link";
import { InvitationPreview } from "~/components/InvitationPreview";
import { RsvpForm } from "~/components/RsvpForm";

interface Template {
  id: string;
  gradient: string;
  colors: {
    primary: string;
    secondary: string;
    bg: string;
    accent: string;
    text: string;
    card: string;
    [key: string]: string;
  };
}

interface InviteClientProps {
  invitation: {
    id: string;
    groomName: string | null;
    brideName: string | null;
    groomFamily: string | null;
    brideFamily: string | null;
    blessingFrom: string | null;
    mantra: string | null;
    message: string | null;
    hashtag: string | null;
    weddingDate: Date | null;
    venue: string | null;
    mapLink: string | null;
    instagramLink: string | null;
    whatsappNumber: string | null;
    photos: string[] | null;
    musicUrl: string | null;
  };
  events: any[];
  template: Template | null;
}

const FALLBACK_TEMPLATE: Template = {
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

export function InviteNotFound() {
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

export function InviteClient({ invitation, events, template }: InviteClientProps) {
  const activeTmpl = template ?? FALLBACK_TEMPLATE;

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
    photos: invitation.photos ?? [],
    musicUrl: invitation.musicUrl ?? "",
  };

  return (
    <div className="min-h-screen" style={{ background: activeTmpl.colors?.bg }}>
      {/* Background music player */}
      {invData.musicUrl && (
        <audio src={invData.musicUrl} autoPlay loop className="hidden" />
      )}

      <div className="mx-auto w-full">
        <InvitationPreview
          invitation={invData}
          events={events}
          template={activeTmpl}
          fullWidth
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[3px] text-gold-600/70">
            RSVP
          </p>
          <h2 className="font-display text-2xl font-bold md:text-3xl">Will you join us?</h2>
          <p className="mt-2 text-sm opacity-45">
            Let us know if you&apos;ll be attending the celebrations.
          </p>
        </div>
        <RsvpForm invitationId={invitation.id} events={events} />
      </div>

      <div className="py-6 text-center opacity-30">
        <p className="text-xs">
          Made with <span className="font-script text-base text-gold-600">Invitara</span>
        </p>
      </div>
    </div>
  );
}
