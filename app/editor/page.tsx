"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, Suspense } from "react";
import {
  templatesQueryOptions,
  sessionQueryOptions,
  invitationQueryOptions,
  eventsQueryOptions,
  useSaveInvitation,
  useAddEvent,
  useRemoveEvent,
  usePublishInvitation,
} from "~/lib/queries";
import { CoupleForm, EventsForm, DetailsForm } from "~/components/EditorForm";
import { InvitationPreview } from "~/components/InvitationPreview";
import { TemplateSwitcher } from "~/components/VirtualTemplateGrid";
import { AIDesignGenerator } from "~/components/AIDesignGenerator";
import { ShareModal } from "~/components/ShareModal";
import { AdBanner } from "~/components/AdBanner";

const TABS = ["couple", "events", "details", "style", "ai"] as const;

type InvData = {
  groomName: string;
  brideName: string;
  groomFamily: string;
  brideFamily: string;
  blessingFrom: string;
  mantra: string;
  message: string;
  hashtag: string;
  weddingDate: string;
  venue: string;
  mapLink: string;
  instagramLink: string;
  whatsappNumber: string;
};

const EMPTY_INV: InvData = {
  groomName: "",
  brideName: "",
  groomFamily: "",
  brideFamily: "",
  blessingFrom: "",
  mantra: "",
  message: "",
  hashtag: "",
  weddingDate: "",
  venue: "",
  mapLink: "",
  instagramLink: "",
  whatsappNumber: "",
};

type LocalEvent = {
  id: number;
  name: string;
  date: string;
  venue: string;
  time: string;
  icon: string;
  color: string;
};

function EditorInner() {
  const searchParams = useSearchParams();
  const tmplIdParam = searchParams.get("template") ?? undefined;
  const invitationIdParam = searchParams.get("invitation") ?? undefined;
  const router = useRouter();

  const { data: allTemplates = [] } = useQuery(templatesQueryOptions());
  const { data: user } = useQuery(sessionQueryOptions());

  // Load existing invitation when ?invitation= param is present
  const { data: existingInv, isLoading: invLoading } = useQuery({
    ...invitationQueryOptions(invitationIdParam ?? ""),
    enabled: !!invitationIdParam,
  });

  const [invitationId, setInvitationId] = useState<string | undefined>(invitationIdParam);
  const [invSlug, setInvSlug] = useState<string | undefined>(undefined);

  // Load DB events scoped to the invitation
  const { data: dbEvents = [] } = useQuery({
    ...eventsQueryOptions(invitationId ?? ""),
    enabled: !!invitationId,
  });

  const saveInv = useSaveInvitation();
  const addEvent = useAddEvent();
  const removeEvent = useRemoveEvent();
  const publish = usePublishInvitation();

  const [tab, setTab] = useState<(typeof TABS)[number]>("couple");
  const [showShare, setShowShare] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // AI overrides applied on top of the active template
  const [aiOverrides, setAiOverrides] = useState<{
    gradient?: string;
    colors?: Record<string, string>;
  } | null>(null);

  // Active template selection
  const [selectedTmpl, setSelectedTmpl] = useState(
    invitationIdParam
      ? (existingInv?.templateId ?? tmplIdParam ?? "beach")
      : (tmplIdParam ?? "beach")
  );
  const baseTmpl = (allTemplates as any[]).find((t) => t.id === selectedTmpl) ??
    (allTemplates as any[])[0] ?? {
      id: "beach",
      name: "",
      description: "",
      emoji: "",
      gradient: "linear-gradient(135deg,#A67C2E,#D4A853)",
      colors: {
        primary: "#A67C2E",
        secondary: "#D4A853",
        bg: "#FDF8F0",
        accent: "#F5E6CC",
        text: "#3A2A10",
        card: "#FFFDF5",
      },
    };

  // Merge AI overrides into template for the live preview
  const activeTmpl = aiOverrides
    ? {
        ...baseTmpl,
        gradient: aiOverrides.gradient ?? baseTmpl.gradient,
        colors: { ...baseTmpl.colors, ...(aiOverrides.colors ?? {}) },
      }
    : baseTmpl;

  // Form data — starts empty, gets seeded from DB when an existing invitation loads
  const [inv, setInv] = useState<InvData>(EMPTY_INV);

  // Buffered events for new (not-yet-saved) invitations
  const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);

  // Seed form when existing invitation loads
  useEffect(() => {
    if (existingInv) {
      setInv({
        groomName: existingInv.groomName ?? "",
        brideName: existingInv.brideName ?? "",
        groomFamily: existingInv.groomFamily ?? "",
        brideFamily: existingInv.brideFamily ?? "",
        blessingFrom: existingInv.blessingFrom ?? "",
        mantra: existingInv.mantra ?? "",
        message: existingInv.message ?? "",
        hashtag: existingInv.hashtag ?? "",
        weddingDate: existingInv.weddingDate
          ? new Date(existingInv.weddingDate).toISOString().slice(0, 10)
          : "",
        venue: existingInv.venue ?? "",
        mapLink: existingInv.mapLink ?? "",
        instagramLink: existingInv.instagramLink ?? "",
        whatsappNumber: existingInv.whatsappNumber ?? "",
      });
      setSelectedTmpl(existingInv.templateId);
      setInvitationId(existingInv.id);
      setInvSlug(existingInv.slug);
    }
  }, [existingInv]);

  // Events shown in preview: DB events if invitation exists, else locally buffered
  const displayEvents = invitationId ? dbEvents : localEvents;

  // Auto-save: called by form fields on blur
  const handleSave = async (patch: Partial<InvData>) => {
    const merged = { ...inv, ...patch };
    setInv(merged);

    // Cannot save without both names
    if (!merged.groomName.trim() || !merged.brideName.trim()) return;

    setSaveStatus("saving");
    try {
      const result = await saveInv.mutateAsync({
        id: invitationId,
        templateId: selectedTmpl || baseTmpl.id,
        ...merged,
      });

      if (!invitationId && result?.id) {
        // First save — store the new ID and update the URL
        setInvitationId(result.id);
        if (result.slug) setInvSlug(result.slug);
        router.replace(`/editor?invitation=${result.id}`);

        // Flush buffered local events to DB
        for (const ev of localEvents) {
          await addEvent.mutateAsync({
            invitationId: result.id,
            name: ev.name,
            date: ev.date,
            venue: ev.venue,
            time: ev.time,
            icon: ev.icon,
            color: ev.color,
          });
        }
        setLocalEvents([]);
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  };

  const handleAddEvent = async (e: LocalEvent) => {
    if (invitationId) {
      await addEvent.mutateAsync({ invitationId, ...e });
    } else {
      setLocalEvents((prev) => [...prev, { ...e, id: Date.now() }]);
    }
  };

  const handleRemoveEvent = async (id: number) => {
    if (invitationId) {
      await removeEvent.mutateAsync(id);
    } else {
      setLocalEvents((prev) => prev.filter((ev) => ev.id !== id));
    }
  };

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTmpl(tmplId);
    setAiOverrides(null); // clear AI overrides when switching templates
    if (invitationId && inv.groomName && inv.brideName) {
      saveInv.mutate({ id: invitationId, templateId: tmplId, ...inv });
    }
  };

  const handlePublish = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!inv.groomName.trim() || !inv.brideName.trim()) {
      setTab("couple");
      return;
    }

    setSaveStatus("saving");
    try {
      const saveResult = await saveInv.mutateAsync({
        id: invitationId,
        templateId: selectedTmpl || baseTmpl.id,
        ...inv,
      });

      const resolvedId = invitationId ?? saveResult?.id;
      if (!resolvedId) return;

      if (!invitationId && saveResult?.id) {
        setInvitationId(saveResult.id);
        if (saveResult.slug) setInvSlug(saveResult.slug);
        router.replace(`/editor?invitation=${saveResult.id}`);
      }

      const publishResult = await publish.mutateAsync(resolvedId);
      if (publishResult?.slug) setInvSlug(publishResult.slug);

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      setShowShare(true);
    } catch {
      setSaveStatus("idle");
    }
  };

  // Loading state while fetching existing invitation
  if (invLoading && invitationIdParam) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[68px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
      </div>
    );
  }

  return (
    <>
      <div className="grid min-h-screen grid-cols-1 pt-[68px] lg:grid-cols-[380px_1fr]">
        {/* ── SIDEBAR ── */}
        <div className="border-gold-200/12 overflow-y-auto border-r bg-white pb-20">
          {/* Tab bar */}
          <div className="border-gold-200/12 sticky top-0 z-10 flex border-b bg-white">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 border-b-2 py-3.5 text-[9px] font-semibold uppercase tracking-[1.5px] transition-colors ${
                  tab === t
                    ? "border-gold-500 text-gold-700"
                    : "border-transparent text-cream-800/30 hover:text-cream-800/50"
                }`}
              >
                {t === "ai" ? "✨ AI" : t}
              </button>
            ))}
          </div>

          {/* Save status bar */}
          <div className="border-gold-200/8 flex h-7 items-center border-b bg-cream-50/30 px-5">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-[10px] text-gold-600/70">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
                Saving…
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-600/80">
                <span>✓</span> Saved
              </span>
            )}
            {saveStatus === "idle" && invitationId && (
              <span className="text-[10px] text-cream-800/25">All changes saved</span>
            )}
            {saveStatus === "idle" && !invitationId && (
              <span className="text-[10px] text-cream-800/25">
                Enter couple names to start saving
              </span>
            )}
          </div>

          <div className="p-5">
            {tab === "couple" && <CoupleForm defaultValues={inv} onSave={handleSave} />}
            {tab === "events" && (
              <EventsForm
                events={displayEvents as any}
                onAdd={handleAddEvent as any}
                onRemove={handleRemoveEvent}
              />
            )}
            {tab === "details" && <DetailsForm defaultValues={inv} onSave={handleSave} />}

            {tab === "style" && (
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
                    Choose Template
                  </label>
                  <TemplateSwitcher
                    templates={allTemplates}
                    activeId={selectedTmpl}
                    onSelect={(t) => handleTemplateChange(t.id)}
                  />
                </div>
                <div>
                  <label className="mb-3 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
                    Active
                  </label>
                  <div className="rounded-xl border border-gold-200/15 bg-cream-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="text-xl">{baseTmpl.emoji}</span>
                      <h3 className="font-display text-lg font-semibold">{baseTmpl.name}</h3>
                    </div>
                    <p className="text-xs opacity-45">{baseTmpl.description}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
                      Colors{" "}
                      {aiOverrides && (
                        <span className="ml-1 normal-case text-gold-600">✨ AI Applied</span>
                      )}
                    </label>
                    {aiOverrides && (
                      <button
                        onClick={() => setAiOverrides(null)}
                        className="text-[9px] text-red-400/70 underline hover:text-red-500"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {Object.entries(activeTmpl.colors || {}).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <div
                          className="h-10 w-10 rounded-lg border border-white/50 shadow-sm"
                          style={{ background: v as string }}
                        />
                        <span className="mt-0.5 block text-[8px] capitalize opacity-25">{k}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "ai" && (
              <AIDesignGenerator
                user={user ?? null}
                onApply={(r: { gradient: string; colors: Record<string, string> }) => {
                  setAiOverrides(r);
                  setTab("style"); // show applied state in style tab
                }}
              />
            )}

            {/* Ad banner for free users (not on AI tab) */}
            {(!user || user.showAds) && tab !== "ai" && (
              <div className="mt-6">
                <AdBanner
                  user={user ?? null}
                  slot="editor_bottom"
                  ad={{
                    id: "ai-cta",
                    title: "AI-Powered Designs",
                    description: "Let AI generate unique palettes and suggestions.",
                    ctaText: "Try AI Tab →",
                    ctaLink: "/editor",
                    gradient: "linear-gradient(135deg,#4A3A6B,#7A6AAB,#D4A853)",
                    icon: "✨",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── PREVIEW ── */}
        <div className="hidden items-start justify-center overflow-y-auto bg-cream-200/40 px-6 py-10 lg:flex">
          <div className="phone-frame">
            <div className="relative z-20 mx-auto h-[26px] w-[100px] rounded-b-2xl bg-[#1a1a1a]" />
            <div
              className="h-[694px] overflow-y-auto overflow-x-hidden"
              style={{ scrollbarWidth: "none" }}
            >
              <InvitationPreview
                invitation={inv}
                events={displayEvents as any}
                template={activeTmpl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── PUBLISH BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-gold-200/15 bg-white/90 px-6 py-3 backdrop-blur-md">
        <span className="mr-auto hidden text-xs opacity-30 sm:block">
          {inv.groomName && inv.brideName ? (
            <>
              Editing:{" "}
              <span className="font-semibold">
                {inv.groomName} & {inv.brideName}
              </span>
            </>
          ) : (
            <span>New Invitation — fill in couple names to begin saving</span>
          )}
        </span>
        {invitationId && (
          <a
            href={`/preview?invitation=${invitationId}`}
            className="btn-gold-outline !px-5 !py-2.5 !text-[10px]"
          >
            Preview
          </a>
        )}
        <button
          className="btn-gold !px-6 !py-2.5 !text-[10px] disabled:opacity-40"
          disabled={publish.isPending || saveInv.isPending}
          onClick={handlePublish}
        >
          {publish.isPending ? "Publishing…" : "✦ Publish & Share"}
        </button>
      </div>

      {showShare && (
        <ShareModal
          groomName={inv.groomName || "Your"}
          brideName={inv.brideName || "Names"}
          slug={invSlug}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-[68px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
        </div>
      }
    >
      <EditorInner />
    </Suspense>
  );
}
