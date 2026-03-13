"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, Suspense } from "react";
import {
  templatesQueryOptions,
  sessionQueryOptions,
  invitationQueryOptions,
  eventsQueryOptions,
} from "~/lib/queries";
import { InvitationPreview } from "~/components/InvitationPreview";
import { ShareModal } from "~/components/ShareModal";
import { InlineAd } from "~/components/AdBanner";

function PreviewInner() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitation") ?? undefined;
  const router = useRouter();
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: allTemplates = [] } = useQuery(templatesQueryOptions());

  const { data: invitation, isLoading: invLoading } = useQuery({
    ...invitationQueryOptions(invitationId ?? ""),
    enabled: !!invitationId,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    ...eventsQueryOptions(invitationId ?? ""),
    enabled: !!invitationId,
  });

  const [showShare, setShowShare] = useState(false);

  // Redirect to dashboard if no invitation ID provided
  if (!invitationId) {
    router.push("/dashboard");
    return null;
  }

  const template = (allTemplates as any[]).find((t) => t.id === invitation?.templateId) ??
    (allTemplates as any[])[0] ?? {
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

  const isLoading = invLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[68px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pt-[68px]">
        <div className="text-4xl">404</div>
        <p className="text-cream-800/60">Invitation not found.</p>
        <Link href="/dashboard" className="btn-gold !px-6 !py-2">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Build invitation data shape expected by InvitationPreview
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
    <div className="min-h-screen pt-[68px]" style={{ background: template.colors?.bg }}>
      <div className="mx-auto max-w-lg bg-white shadow-gold-xl">
        <InvitationPreview
          invitation={invData}
          events={events as any}
          template={template}
          fullWidth
        />

        {/* Inline ad for free users */}
        {(!user || user?.showAds) && (
          <div className="px-5 pb-4">
            <InlineAd user={user ?? null} />
          </div>
        )}
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-3">
        <Link
          href={`/editor?invitation=${invitationId}`}
          className="rounded-full border border-gold-200/20 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[1.5px] shadow-gold-lg transition-all hover:-translate-y-0.5"
        >
          ← Editor
        </Link>
        <button onClick={() => setShowShare(true)} className="btn-gold !py-3 shadow-gold-lg">
          ✦ Share Invite
        </button>
      </div>

      {showShare && (
        <ShareModal
          groomName={invitation.groomName ?? ""}
          brideName={invitation.brideName ?? ""}
          slug={invitation.published ? invitation.slug : undefined}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-[68px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
        </div>
      }
    >
      <PreviewInner />
    </Suspense>
  );
}
