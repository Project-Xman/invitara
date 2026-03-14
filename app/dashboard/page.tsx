"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  sessionQueryOptions,
  myInvitationsQueryOptions,
  rsvpsQueryOptions,
  analyticsQueryOptions,
  eventsQueryOptions,
  useDeleteInvitation,
  useUnpublishInvitation,
} from "~/lib/queries";
import dynamic from "next/dynamic";
import { RsvpTable } from "~/components/RsvpTable";
import { ShareModal } from "~/components/ShareModal";
import { AdBanner } from "~/components/AdBanner";
import {
  Share2,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Inbox,
  Send,
  BarChart3,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const AnalyticsChart = dynamic(
  () => import("~/components/AnalyticsChart").then((m) => ({ default: m.AnalyticsChart })),
  { ssr: false }
);

export default function DashboardPage() {
  const router = useRouter();
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: myInvitations = [], isLoading: invLoading } = useQuery(myInvitationsQueryOptions());

  const [selectedInvId, setSelectedInvId] = useState<string | undefined>(undefined);
  const [showShare, setShowShare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const deleteInv = useDeleteInvitation();
  const unpublishInv = useUnpublishInvitation();

  const activeInvId = selectedInvId ?? (myInvitations[0] as any)?.id;
  const activeInv =
    (myInvitations as any[]).find((i) => i.id === activeInvId) ?? (myInvitations as any[])[0];

  const { data: rsvps = [], isLoading: rsvpLoading } = useQuery({
    ...rsvpsQueryOptions(activeInvId ?? ""),
    enabled: !!activeInvId,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    ...analyticsQueryOptions(activeInvId ?? ""),
    enabled: !!activeInvId,
  });

  const { data: events = [] } = useQuery({
    ...eventsQueryOptions(activeInvId ?? ""),
    enabled: !!activeInvId,
  });

  useEffect(() => {
    if (!user && !invLoading) {
      router.push("/auth/login");
    }
  }, [user, invLoading, router]);

  if (!user && !invLoading) {
    return null;
  }

  const rsvpList = rsvps as any[];
  const attending = rsvpList.filter((r) => r.status === "attending");
  const pending = rsvpList.filter((r) => r.status === "pending");
  const declined = rsvpList.filter((r) => r.status === "declined");
  const totalGuests = attending.reduce((s: number, r: any) => s + (r.guests ?? 1), 0);

  const eventBreakdown = (events as any[]).map((ev) => {
    const attendingRsvps = rsvpList.filter(
      (r) =>
        r.status === "attending" &&
        Array.isArray(r.eventsAttending) &&
        r.eventsAttending.includes(ev.name)
    );
    return {
      name: ev.name,
      icon: ev.icon,
      color: ev.color,
      date: ev.date,
      guests: attendingRsvps.reduce((s: number, r: any) => s + (r.guests ?? 1), 0),
      families: attendingRsvps.length,
    };
  });

  const analyticsChartData = analyticsData
    ? {
        summary: analyticsData.summary as Record<string, number>,
        daily: (analyticsData.daily as any[]).map((d: any) => ({
          date: new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          views: d.views,
        })),
      }
    : { summary: {} as Record<string, number>, daily: [] };

  if (invLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[68px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (myInvitations.length === 0) {
    return (
      <div className="flex min-h-screen animate-fade-up flex-col items-center justify-center gap-4 px-6 pt-[68px]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Inbox className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-center font-display text-3xl font-bold">No Invitations Yet</h1>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Create your first wedding invitation to see RSVPs, analytics, and guest management here.
        </p>
        <Link href="/templates" className="btn-gold mt-2 !px-8 !py-3">
          Browse Templates
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-up pt-[68px]">
      <div className="mx-auto max-w-[1320px] px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="section-label mb-2">Dashboard</p>
          <h1 className="mb-2 section-heading !text-3xl md:!text-4xl">
            Manage Your Invitation
          </h1>
        </div>

        {/* Invitation selector */}
        {(myInvitations as any[]).length > 1 && (
          <div className="mb-6 flex justify-center">
            <select
              value={activeInvId ?? ""}
              onChange={(e) => setSelectedInvId(e.target.value)}
              className="input-gold max-w-xs text-sm"
            >
              {(myInvitations as any[]).map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.groomName} & {inv.brideName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ad */}
        {(!user || user?.showAds) && (
          <AdBanner
            user={user ?? null}
            slot="dashboard_top"
            ad={{
              id: "credit-sale",
              title: "Credit Sale!",
              description: "Get 15 AI generation credits for just \u20B9249.",
              ctaText: "Buy Credits",
              ctaLink: "/account",
              gradient: "linear-gradient(135deg,#C73866,#E8668E,#D4A853)",
              icon: "",
            }}
          />
        )}

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button
            className="btn-gold !px-6 !py-2.5 !text-[10px]"
            onClick={() => setShowShare(true)}
          >
            <Share2 className="h-3.5 w-3.5" /> Share Invite
          </button>
          {activeInvId && (
            <>
              <Link
                href={`/editor?invitation=${activeInvId}`}
                className="btn-gold-outline !px-6 !py-2.5 !text-[10px]"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
              <Link
                href={`/preview?invitation=${activeInvId}`}
                className="btn-gold-outline !px-6 !py-2.5 !text-[10px]"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </Link>
              {activeInv?.published && (
                <button
                  className="btn-gold-outline !px-6 !py-2.5 !text-[10px]"
                  onClick={() => unpublishInv.mutate(activeInvId)}
                  disabled={unpublishInv.isPending}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  {unpublishInv.isPending ? "Unpublishing..." : "Unpublish"}
                </button>
              )}
              <button
                className="flex items-center gap-2 rounded-full border border-destructive/30 bg-card px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[1px] text-destructive transition-colors hover:bg-destructive/10"
                onClick={() => setConfirmDelete(activeInvId)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
        </div>

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mb-2 text-center font-display text-xl font-bold">Delete Invitation?</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                This will permanently delete the invitation and all its events, RSVPs, and
                analytics. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 py-2.5 text-[10px] font-bold uppercase tracking-[1px] text-destructive hover:bg-destructive/20"
                  onClick={() => {
                    deleteInv.mutate(confirmDelete, {
                      onSuccess: () => {
                        setConfirmDelete(null);
                        setSelectedInvId(undefined);
                      },
                    });
                  }}
                  disabled={deleteInv.isPending}
                >
                  {deleteInv.isPending ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 className="h-3.5 w-3.5" /> Yes, Delete</>
                  )}
                </button>
                <button
                  className="flex-1 rounded-full border border-border bg-accent py-2.5 text-[10px] font-bold uppercase tracking-[1px]"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { l: "Total RSVPs", v: rsvpList.length, s: "responses", icon: <Users className="h-5 w-5" />, c: "text-primary" },
            { l: "Attending", v: attending.length, s: `${totalGuests} guests total`, icon: <CheckCircle2 className="h-5 w-5" />, c: "text-emerald-600" },
            { l: "Pending", v: pending.length, s: "awaiting response", icon: <Clock className="h-5 w-5" />, c: "text-amber-600" },
            { l: "Declined", v: declined.length, s: "won't make it", icon: <XCircle className="h-5 w-5" />, c: "text-red-500" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                  {s.l}
                </p>
                <div className={`${s.c} opacity-40`}>{s.icon}</div>
              </div>
              <p className={`font-display text-4xl font-bold ${s.c}`}>{s.v}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.s}</p>
            </div>
          ))}
        </div>

        {/* Analytics */}
        <div className="mb-10">
          <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold">
            <BarChart3 className="h-5 w-5 text-primary" /> Analytics
          </h2>
          {analyticsLoading ? (
            <div className="h-48 animate-pulse rounded-2xl bg-accent" />
          ) : (
            <AnalyticsChart daily={analyticsChartData.daily} summary={analyticsChartData.summary} />
          )}
        </div>

        {/* Event Breakdown */}
        {eventBreakdown.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold">
              <Calendar className="h-5 w-5 text-primary" /> Event Breakdown
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {eventBreakdown.map((ev) => (
                <div
                  key={ev.name}
                  className="rounded-xl border border-l-4 border-border bg-card p-4"
                  style={{ borderLeftColor: ev.color }}
                >
                  <div className="mb-2 text-2xl">{ev.icon}</div>
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                    {ev.name}
                  </p>
                  <p className="font-display text-2xl font-bold" style={{ color: ev.color }}>
                    {ev.guests}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {ev.families} families {'\u00B7'} {ev.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest Responses */}
        <div>
          <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold">
            <Users className="h-5 w-5 text-primary" /> Guest Responses
          </h2>
          {rsvpLoading ? (
            <div className="h-48 animate-pulse rounded-2xl bg-accent" />
          ) : rsvpList.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Inbox className="h-7 w-7 text-primary" />
              </div>
              <p className="mb-1 font-display text-lg font-semibold">No RSVPs yet</p>
              <p className="text-sm text-muted-foreground">
                Share your invitation link to start receiving responses.
              </p>
              <button
                className="btn-gold mt-4 !px-6 !py-2.5 !text-[10px]"
                onClick={() => setShowShare(true)}
              >
                <Send className="h-3.5 w-3.5" /> Share Now
              </button>
            </div>
          ) : (
            <RsvpTable data={rsvpList} />
          )}
        </div>
      </div>

      {showShare && activeInv && (
        <ShareModal
          groomName={activeInv.groomName}
          brideName={activeInv.brideName}
          slug={activeInv.published ? activeInv.slug : undefined}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
