"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  sessionQueryOptions,
  myInvitationsQueryOptions,
  rsvpsQueryOptions,
  analyticsQueryOptions,
  eventsQueryOptions,
} from "~/lib/queries";
import { RsvpTable } from "~/components/RsvpTable";
import { ShareModal } from "~/components/ShareModal";
import { AnalyticsChart } from "~/components/AnalyticsChart";
import { AdBanner } from "~/components/AdBanner";

export default function DashboardPage() {
  const router = useRouter();
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: myInvitations = [], isLoading: invLoading } = useQuery(myInvitationsQueryOptions());

  const [selectedInvId, setSelectedInvId] = useState<string | undefined>(undefined);
  const [showShare, setShowShare] = useState(false);

  // Use the first invitation by default once list loads
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

  // Redirect to login if not authenticated
  if (!user && !invLoading) {
    router.push("/auth/login");
    return null;
  }

  const rsvpList = rsvps as any[];
  const attending = rsvpList.filter((r) => r.status === "attending");
  const pending = rsvpList.filter((r) => r.status === "pending");
  const declined = rsvpList.filter((r) => r.status === "declined");
  const totalGuests = attending.reduce((s: number, r: any) => s + (r.guests ?? 1), 0);

  // Build event breakdown from real events + RSVP attendance data
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

  // Build analytics chart format
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
      </div>
    );
  }

  // Empty state — no invitations yet
  if (myInvitations.length === 0) {
    return (
      <div className="flex min-h-screen animate-fade-up flex-col items-center justify-center gap-4 px-6 pt-[68px]">
        <div className="mb-2 text-5xl">💌</div>
        <h1 className="text-center font-display text-3xl font-bold">No Invitations Yet</h1>
        <p className="max-w-sm text-center text-sm opacity-45">
          Create your first wedding invitation to see RSVPs, analytics, and guest management here.
        </p>
        <Link href="/templates" className="btn-gold mt-2 !px-8 !py-3">
          Browse Templates →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-up pt-[68px]">
      <div className="mx-auto max-w-[1320px] px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[3px] text-gold-600/70">
            Dashboard
          </p>
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
            Manage Your Invitation
          </h1>
        </div>

        {/* Invitation selector (shown when user has more than one) */}
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

        {/* Ad for free users */}
        {(!user || user?.showAds) && (
          <AdBanner
            user={user ?? null}
            slot="dashboard_top"
            ad={{
              id: "credit-sale",
              title: "Credit Sale!",
              description: "Get 15 AI generation credits for just ₹249.",
              ctaText: "Buy Credits →",
              ctaLink: "/account",
              gradient: "linear-gradient(135deg,#C73866,#E8668E,#D4A853)",
              icon: "🎁",
            }}
          />
        )}

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button
            className="btn-gold !px-6 !py-2.5 !text-[10px]"
            onClick={() => setShowShare(true)}
          >
            ✨ Share Invite
          </button>
          {activeInvId && (
            <>
              <Link
                href={`/editor?invitation=${activeInvId}`}
                className="btn-gold-outline !px-6 !py-2.5 !text-[10px]"
              >
                Edit Invite
              </Link>
              <Link
                href={`/preview?invitation=${activeInvId}`}
                className="btn-gold-outline !px-6 !py-2.5 !text-[10px]"
              >
                Preview
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { l: "Total RSVPs", v: rsvpList.length, s: "responses", c: "text-gold-700" },
            {
              l: "Attending",
              v: attending.length,
              s: `${totalGuests} guests total`,
              c: "text-emerald-600",
            },
            { l: "Pending", v: pending.length, s: "awaiting response", c: "text-amber-600" },
            { l: "Declined", v: declined.length, s: "won't make it", c: "text-red-500" },
          ].map((s, i) => (
            <div key={i} className="border-gold-200/12 rounded-2xl border bg-white p-5 shadow-card">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[2px] opacity-35">
                {s.l}
              </p>
              <p className={`font-display text-4xl font-bold ${s.c}`}>{s.v}</p>
              <p className="mt-1 text-xs opacity-35">{s.s}</p>
            </div>
          ))}
        </div>

        {/* Analytics Chart */}
        <div className="mb-10">
          <h2 className="mb-5 font-display text-xl font-bold">Analytics</h2>
          {analyticsLoading ? (
            <div className="h-48 animate-pulse rounded-2xl bg-cream-100/60" />
          ) : (
            <AnalyticsChart daily={analyticsChartData.daily} summary={analyticsChartData.summary} />
          )}
        </div>

        {/* Event Breakdown */}
        {eventBreakdown.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-5 font-display text-xl font-bold">Event Breakdown</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {eventBreakdown.map((ev) => (
                <div
                  key={ev.name}
                  className="rounded-xl border border-l-4 border-gold-200/10 bg-white p-4"
                  style={{ borderLeftColor: ev.color }}
                >
                  <div className="mb-2 text-2xl">{ev.icon}</div>
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[1.5px] opacity-40">
                    {ev.name}
                  </p>
                  <p className="font-display text-2xl font-bold" style={{ color: ev.color }}>
                    {ev.guests}
                  </p>
                  <p className="text-[11px] opacity-35">
                    {ev.families} families · {ev.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest Responses Table */}
        <div>
          <h2 className="mb-5 font-display text-xl font-bold">Guest Responses</h2>
          {rsvpLoading ? (
            <div className="h-48 animate-pulse rounded-2xl bg-cream-100/60" />
          ) : rsvpList.length === 0 ? (
            <div className="rounded-2xl border border-gold-200/15 bg-white py-16 text-center">
              <div className="mb-3 text-4xl">📬</div>
              <p className="mb-1 font-display text-lg font-semibold">No RSVPs yet</p>
              <p className="text-sm opacity-40">
                Share your invitation link to start receiving responses.
              </p>
              <button
                className="btn-gold mt-4 !px-6 !py-2.5 !text-[10px]"
                onClick={() => setShowShare(true)}
              >
                Share Now →
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
