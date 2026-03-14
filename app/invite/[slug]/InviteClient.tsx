"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { InvitationPreview } from "~/components/InvitationPreview";
import { RsvpForm } from "~/components/RsvpForm";
import { adQueryOptions } from "~/lib/queries";
import { ArrowRight, Sparkles } from "lucide-react";

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
  showAds?: boolean;
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
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-center font-display text-3xl font-bold">Invitation Not Found</h1>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        This invitation may have been unpublished or the link might be incorrect.
      </p>
      <Link href="/" className="btn-gold mt-2 !px-6 !py-2.5">
        Go to Invitara
      </Link>
    </div>
  );
}

export function InviteClient({ invitation, events, template, showAds = true }: InviteClientProps) {
  const activeTmpl = template ?? FALLBACK_TEMPLATE;
  const tc = activeTmpl.colors;

  // Only fetch ads if the invitation owner is on a free/ad-showing plan
  const { data: adData } = useQuery({
    ...adQueryOptions("preview_footer"),
    enabled: showAds,
  });

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
    <div className="min-h-screen" style={{ background: tc.bg }}>
      {/* Background music player */}
      {invData.musicUrl && (
        <audio src={invData.musicUrl} autoPlay loop className="hidden" />
      )}

      {/* Invitation template */}
      <div className="w-full">
        <InvitationPreview
          invitation={invData}
          events={events}
          template={activeTmpl}
          fullWidth
        />
      </div>

      {/* RSVP Section — styled to match template */}
      <div
        className="py-16 md:py-24"
        style={{ background: tc.accent }}
      >
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-8 text-center">
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-[3px]"
              style={{ color: tc.primary, opacity: 0.7 }}
            >
              RSVP
            </p>
            <h2
              className="font-display text-2xl font-bold md:text-3xl"
              style={{ color: tc.text }}
            >
              Will you join us?
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: tc.text, opacity: 0.5 }}
            >
              Let us know if you&apos;ll be attending the celebrations.
            </p>
          </div>
          <div
            className="rounded-2xl border p-6 shadow-lg md:p-8"
            style={{
              background: tc.card,
              borderColor: `${tc.primary}15`,
            }}
          >
            <RsvpForm invitationId={invitation.id} events={events} />
          </div>
        </div>
      </div>

      {/* Ad Banner — only shown if invitation owner is on free plan */}
      {showAds && adData && (
        <div
          className="py-10 md:py-14"
          style={{ background: tc.bg }}
        >
          <div className="mx-auto max-w-2xl px-6">
            <div
              className="relative overflow-hidden rounded-2xl p-6 md:p-8"
              style={{ background: adData.gradient }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)",
                }}
              />
              <div className="relative flex flex-col items-center gap-4 text-center text-white md:flex-row md:text-left">
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-semibold uppercase tracking-[2px] opacity-40">
                    Sponsored
                  </p>
                  <h4 className="mb-1 text-base font-semibold md:text-lg">
                    {adData.title}
                  </h4>
                  <p className="text-xs leading-relaxed opacity-70 md:text-sm">
                    {adData.description}
                  </p>
                </div>
                <Link
                  href={adData.ctaLink}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-5 py-2.5 text-xs font-semibold tracking-wide backdrop-blur-sm transition-all hover:bg-white/30"
                >
                  {adData.ctaText} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer — template-themed */}
      <div
        className="py-8 text-center"
        style={{ background: tc.bg }}
      >
        <p
          className="text-xs"
          style={{ color: tc.text, opacity: 0.25 }}
        >
          Made with{" "}
          <Link
            href="/"
            className="font-script text-base transition-opacity hover:opacity-60"
            style={{ color: tc.primary }}
          >
            Invitara
          </Link>
        </p>
      </div>
    </div>
  );
}
