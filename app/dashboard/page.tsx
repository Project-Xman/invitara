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
  adQueryOptions,
  useDeleteInvitation,
  useUnpublishInvitation,
} from "~/lib/queries";
import dynamic from "next/dynamic";
import { RsvpTable } from "~/components/RsvpTable";
import { ShareModal } from "~/components/ShareModal";
import { AdBanner } from "~/components/AdBanner";
import { SectionEyebrow } from "~/components/marketing/SectionEyebrow";
import { Hairline } from "~/components/marketing/Hairline";
import { Spotlight } from "~/components/marketing/Spotlight";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Inbox,
  Loader2,
  Pencil,
  Send,
  Share2,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { ResponsiveContainer, Area, AreaChart } from "recharts";

const AnalyticsChart = dynamic(
  () => import("~/components/AnalyticsChart").then((m) => ({ default: m.AnalyticsChart })),
  { ssr: false }
);

type RsvpFilter = "all" | "attending" | "pending" | "declined";

function Sparkline({ data }: { data: { date: string; views: number }[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="absolute inset-x-6 bottom-4 h-12 opacity-70">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.84 0.10 88)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="oklch(0.84 0.10 88)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="views"
            stroke="oklch(0.84 0.10 88)"
            strokeWidth={1.5}
            fill="url(#sparkGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: myInvitations = [], isLoading: invLoading } = useQuery(myInvitationsQueryOptions());

  const [selectedInvId, setSelectedInvId] = useState<string | undefined>(undefined);
  const [showShare, setShowShare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>("all");

  const { data: dashboardAd } = useQuery(adQueryOptions("dashboard_top"));
  const deleteInv = useDeleteInvitation();
  const unpublishInv = useUnpublishInvitation();

  type Invitation = {
    id: string;
    groomName: string;
    brideName: string;
    slug?: string;
    published?: boolean;
  };
  const invList = myInvitations as Invitation[];
  const activeInvId = selectedInvId ?? invList[0]?.id;
  const activeInv = invList.find((i) => i.id === activeInvId) ?? invList[0];

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

  if (!user && !invLoading) return null;

  type Rsvp = {
    status: "attending" | "pending" | "declined";
    guests?: number;
    eventsAttending?: string[];
    [key: string]: unknown;
  };
  const rsvpList = rsvps as Rsvp[];
  const attending = rsvpList.filter((r) => r.status === "attending");
  const pending = rsvpList.filter((r) => r.status === "pending");
  const declined = rsvpList.filter((r) => r.status === "declined");
  const totalGuests = attending.reduce((s, r) => s + (r.guests ?? 1), 0);

  type EventItem = { name: string; icon?: string; color?: string; date?: string };
  const eventBreakdown = (events as EventItem[]).map((ev) => {
    const attendingRsvps = rsvpList.filter(
      (r) =>
        r.status === "attending" &&
        Array.isArray(r.eventsAttending) &&
        r.eventsAttending.includes(ev.name)
    );
    return {
      name: ev.name,
      icon: ev.icon,
      date: ev.date,
      guests: attendingRsvps.reduce((s, r) => s + (r.guests ?? 1), 0),
      families: attendingRsvps.length,
    };
  });

  const analyticsChartData = analyticsData
    ? {
        summary: analyticsData.summary as Record<string, number>,
        daily: (analyticsData.daily as Array<{ date: string; views: number }>).map((d) => ({
          date: new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          views: d.views,
        })),
      }
    : { summary: {} as Record<string, number>, daily: [] as { date: string; views: number }[] };

  const filteredRsvps =
    rsvpFilter === "all"
      ? rsvpList
      : rsvpList.filter((r) => r.status === rsvpFilter);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  if (invLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[76px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (invList.length === 0) {
    return (
      <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-6 px-6 pt-[76px]">
        <Spotlight origin="top" intensity={0.10} />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 text-primary">
            <Inbox className="h-7 w-7" />
          </div>
          <SectionEyebrow number="00" label="Dashboard" />
          <h1 className="section-headline">No invitations yet.</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first invitation to see RSVPs, analytics, and guest management here.
          </p>
          <Link href="/templates" className="btn-primary">
            Browse the Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[76px]">
      <div className="mx-auto max-w-[1320px] px-6 py-12 lg:px-8">
        {/* ── Editorial header ─────────────────────────── */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionEyebrow number="00" label="Dashboard" className="mb-4" />
            <h1 className="section-headline">
              {greeting},{" "}
              <span className="italic text-shimmer">
                {user?.name?.split(" ")[0] ?? "friend"}.
              </span>
            </h1>
          </div>

          {invList.length > 1 && activeInv && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="card-premium inline-flex items-center gap-3 px-5 py-3 text-left transition-colors hover:border-primary/40">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                      Active invitation
                    </div>
                    <div className="font-display italic text-lg font-light">
                      {activeInv.groomName} & {activeInv.brideName}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Switch invitation
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {invList.map((inv) => (
                  <DropdownMenuItem
                    key={inv.id}
                    onSelect={() => setSelectedInvId(inv.id)}
                    className="font-display italic text-base"
                  >
                    {inv.groomName} & {inv.brideName}
                    {inv.id === activeInvId && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-10 hairline" />

        {/* ── Ad ───────────────────────────────────────── */}
        {(!user || user?.showAds) && dashboardAd && (
          <div className="mt-10">
            <AdBanner user={user ?? null} slot="dashboard_top" ad={dashboardAd} />
          </div>
        )}

        {/* ── Quick actions ───────────────────────────── */}
        <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
          {activeInvId && (
            <>
              <Link
                href={`/preview?invitation=${activeInvId}`}
                className="btn-ghost !px-4 !py-2"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </Link>
              <Link
                href={`/editor?invitation=${activeInvId}`}
                className="btn-ghost !px-4 !py-2"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
              {activeInv?.published && (
                <button
                  className="btn-ghost !px-4 !py-2"
                  onClick={() => unpublishInv.mutate(activeInvId)}
                  disabled={unpublishInv.isPending}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  {unpublishInv.isPending ? "Unpublishing" : "Unpublish"}
                </button>
              )}
              <button
                className="btn-ghost !px-4 !py-2 border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(activeInvId)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
          <button className="btn-primary !px-5 !py-2" onClick={() => setShowShare(true)}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>

        {/* ── Stats bento ──────────────────────────────── */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-6">
          {/* Large: Total RSVPs */}
          <div className="card-premium relative col-span-2 row-span-2 min-h-[200px] overflow-hidden p-6 md:col-span-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Total RSVPs
                </p>
                <p className="mt-3 font-display text-7xl font-light text-foreground">
                  {rsvpList.length}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">responses received</p>
              </div>
              <Users className="h-5 w-5 text-primary/60" />
            </div>
            <Sparkline data={analyticsChartData.daily} />
          </div>

          {/* Large: Attending */}
          <div className="card-premium relative col-span-2 row-span-2 min-h-[200px] overflow-hidden p-6 md:col-span-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Attending
                </p>
                <p className="mt-3 font-display text-7xl font-light text-primary">
                  {attending.length}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{totalGuests} guests total</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary/60" />
            </div>
            <Sparkline data={analyticsChartData.daily} />
          </div>

          {/* Small: Pending */}
          <div className="card-premium col-span-1 p-5 md:col-span-2">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Pending
              </p>
              <Clock className="h-4 w-4 text-amber-500/70" />
            </div>
            <p className="mt-3 font-display text-4xl font-light">{pending.length}</p>
          </div>

          {/* Small: Declined */}
          <div className="card-premium col-span-1 p-5 md:col-span-2">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Declined
              </p>
              <XCircle className="h-4 w-4 text-destructive/70" />
            </div>
            <p className="mt-3 font-display text-4xl font-light">{declined.length}</p>
          </div>

          {/* Small: Guests total */}
          <div className="card-premium col-span-1 p-5 md:col-span-2">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Guests
              </p>
              <Users className="h-4 w-4 text-primary/60" />
            </div>
            <p className="mt-3 font-display text-4xl font-light">{totalGuests}</p>
          </div>
        </div>

        {/* ── Analytics ────────────────────────────────── */}
        <div className="mt-14">
          <SectionEyebrow number="01" label="Analytics" className="mb-5" />
          <div className="card-premium p-6">
            {analyticsLoading ? (
              <div className="h-48 animate-pulse rounded-2xl bg-muted/40" />
            ) : (
              <AnalyticsChart
                daily={analyticsChartData.daily}
                summary={analyticsChartData.summary}
              />
            )}
          </div>
        </div>

        {/* ── Event Breakdown ──────────────────────────── */}
        {eventBreakdown.length > 0 && (
          <div className="mt-14">
            <SectionEyebrow number="02" label="Event Breakdown" className="mb-5" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {eventBreakdown.map((ev) => (
                <div
                  key={ev.name}
                  className="card-premium relative p-5"
                  style={{ borderLeft: "2px solid oklch(var(--primary) / 0.5)" }}
                >
                  {ev.icon && <div className="mb-2 text-2xl">{ev.icon}</div>}
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                    {ev.name}
                  </p>
                  <p className="mt-2 font-display text-3xl font-light text-primary">
                    {ev.guests}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {ev.families} families · {ev.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Guest Responses ─────────────────────────── */}
        <div className="mt-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionEyebrow number="03" label="Guest Responses" />
            {rsvpList.length > 0 && (
              <Tabs value={rsvpFilter} onValueChange={(v) => setRsvpFilter(v as RsvpFilter)}>
                <TabsList>
                  <TabsTrigger value="all">All ({rsvpList.length})</TabsTrigger>
                  <TabsTrigger value="attending">Attending ({attending.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                  <TabsTrigger value="declined">Declined ({declined.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="mt-5">
            {rsvpLoading ? (
              <div className="h-48 animate-pulse rounded-2xl bg-muted/40" />
            ) : rsvpList.length === 0 ? (
              <div className="card-premium py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 text-primary">
                  <Inbox className="h-6 w-6" />
                </div>
                <p className="font-display italic text-2xl font-light">No RSVPs yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share your invitation link to start receiving responses.
                </p>
                <button className="btn-primary mt-6" onClick={() => setShowShare(true)}>
                  <Send className="h-3.5 w-3.5" /> Share Now
                </button>
              </div>
            ) : (
              <div className="card-premium overflow-hidden p-2">
                <RsvpTable data={filteredRsvps as unknown as Parameters<typeof RsvpTable>[0]["data"]} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Share modal ───────────────────────────────── */}
      {showShare && activeInv && (
        <ShareModal
          groomName={activeInv.groomName}
          brideName={activeInv.brideName}
          slug={activeInv.published ? activeInv.slug : undefined}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* ── Delete confirm dialog ────────────────────── */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center font-display text-2xl font-light italic">
              Delete invitation?
            </DialogTitle>
            <DialogDescription className="text-center">
              This permanently deletes the invitation, events, RSVPs, and analytics. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:flex-row sm:justify-center">
            <button
              className="btn-ghost flex-1 justify-center"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </button>
            <button
              className="btn-primary flex-1 justify-center border-destructive bg-destructive text-destructive-foreground"
              disabled={deleteInv.isPending}
              onClick={() => {
                if (!confirmDelete) return;
                deleteInv.mutate(confirmDelete, {
                  onSuccess: () => {
                    setConfirmDelete(null);
                    setSelectedInvId(undefined);
                  },
                });
              }}
            >
              {deleteInv.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" /> Yes, delete
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
