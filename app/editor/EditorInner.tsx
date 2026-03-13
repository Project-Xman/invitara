"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import Link from "next/link";
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
import { createEditorStore, type InvData } from "~/lib/editor-store";
import { CoupleForm, EventsForm, DetailsForm } from "~/components/EditorForm";
import { MediaForm } from "~/components/MediaForm";
import { InvitationPreview } from "~/components/InvitationPreview";
import { TemplateSwitcher } from "~/components/VirtualTemplateGrid";
import { AIDesignGenerator } from "~/components/AIDesignGenerator";
import { ShareModal } from "~/components/ShareModal";
import { AdBanner } from "~/components/AdBanner";

const TABS = ["couple", "events", "details", "style", "ai", "media"] as const;

export function EditorInner() {
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

  // Editor store — single source of truth for all mutable UI state
  const [editorStore] = useState(() =>
    createEditorStore(
      invitationIdParam
        ? (existingInv?.templateId ?? tmplIdParam ?? "beach")
        : (tmplIdParam ?? "beach")
    )
  );

  // Granular reactive subscriptions — only the subscribing component re-renders on slice change
  const tab = useStore(editorStore, (s) => s.tab);
  const inv = useStore(editorStore, (s) => s.inv);
  const invitationId = useStore(editorStore, (s) => s.invitationId);
  const invSlug = useStore(editorStore, (s) => s.invSlug);
  const selectedTmpl = useStore(editorStore, (s) => s.selectedTemplateId);
  const aiOverrides = useStore(editorStore, (s) => s.aiOverrides);
  const localEvents = useStore(editorStore, (s) => s.localEvents);
  const saveStatus = useStore(editorStore, (s) => s.saveStatus);
  const showShare = useStore(editorStore, (s) => s.showShare);

  // Load DB events scoped to the invitation
  const { data: dbEvents = [] } = useQuery({
    ...eventsQueryOptions(invitationId ?? ""),
    enabled: !!invitationId,
  });

  const saveInv = useSaveInvitation();
  const addEvent = useAddEvent();
  const removeEvent = useRemoveEvent();
  const publish = usePublishInvitation();

  // Warn before browser close/navigate if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Seed store when existing invitation loads
  useEffect(() => {
    if (existingInv) {
      editorStore.setState((s) => ({
        ...s,
        inv: {
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
          photos: (existingInv.photos as string[]) ?? [],
          musicUrl: existingInv.musicUrl ?? "",
        },
        selectedTemplateId: existingInv.templateId,
        invitationId: existingInv.id,
        invSlug: existingInv.slug,
      }));
    }
  }, [existingInv, editorStore]);

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

  // Events shown in preview: DB events if invitation exists, else locally buffered
  const displayEvents = invitationId ? dbEvents : localEvents;

  // Media save: photos and musicUrl saved directly (no debounce needed)
  const handleMediaSave = async (updates: { photos?: string[]; musicUrl?: string }) => {
    const current = editorStore.state.inv;
    const merged = { ...current, ...updates };
    editorStore.setState((s) => ({ ...s, inv: merged }));
    if (!invitationId) return;
    editorStore.setState((s) => ({ ...s, saveStatus: "saving" }));
    try {
      await saveInv.mutateAsync({
        id: invitationId,
        templateId: editorStore.state.selectedTemplateId || baseTmpl.id,
        ...merged,
      });
      editorStore.setState((s) => ({ ...s, saveStatus: "saved" }));
      setTimeout(() => editorStore.setState((s) => ({ ...s, saveStatus: "idle" })), 2000);
    } catch {
      editorStore.setState((s) => ({ ...s, saveStatus: "idle" }));
    }
  };

  // Auto-save: called by debounced form submit
  const handleSave = async (patch: Partial<InvData>) => {
    const current = editorStore.state.inv;
    const merged = { ...current, ...patch };
    editorStore.setState((s) => ({ ...s, inv: merged }));

    if (!merged.groomName.trim() || !merged.brideName.trim()) return;

    editorStore.setState((s) => ({ ...s, saveStatus: "saving" }));
    try {
      const result = await saveInv.mutateAsync({
        id: editorStore.state.invitationId,
        templateId: editorStore.state.selectedTemplateId || baseTmpl.id,
        ...merged,
      });

      if (!editorStore.state.invitationId && result?.id) {
        editorStore.setState((s) => ({
          ...s,
          invitationId: result.id,
          invSlug: result.slug ?? s.invSlug,
        }));
        router.replace(`/editor?invitation=${result.id}`);

        // Flush buffered local events to DB
        for (const ev of editorStore.state.localEvents) {
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
        editorStore.setState((s) => ({ ...s, localEvents: [] }));
      }

      editorStore.setState((s) => ({ ...s, saveStatus: "saved" }));
      setTimeout(() => editorStore.setState((s) => ({ ...s, saveStatus: "idle" })), 2000);
    } catch {
      editorStore.setState((s) => ({ ...s, saveStatus: "idle" }));
    }
  };

  const handleAddEvent = async (e: any) => {
    const currentId = editorStore.state.invitationId;
    if (currentId) {
      await addEvent.mutateAsync({ invitationId: currentId, ...e });
    } else {
      editorStore.setState((s) => ({
        ...s,
        localEvents: [...s.localEvents, { ...e, id: Date.now() }],
      }));
    }
  };

  const handleRemoveEvent = async (id: number) => {
    const currentId = editorStore.state.invitationId;
    if (currentId) {
      await removeEvent.mutateAsync(id);
    } else {
      editorStore.setState((s) => ({
        ...s,
        localEvents: s.localEvents.filter((ev) => ev.id !== id),
      }));
    }
  };

  const handleTemplateChange = (tmplId: string) => {
    editorStore.setState((s) => ({ ...s, selectedTemplateId: tmplId, aiOverrides: null }));
    const current = editorStore.state;
    if (current.invitationId && current.inv.groomName && current.inv.brideName) {
      saveInv.mutate({ id: current.invitationId, templateId: tmplId, ...current.inv });
    }
  };

  const handlePublish = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const current = editorStore.state;
    if (!current.inv.groomName.trim() || !current.inv.brideName.trim()) {
      editorStore.setState((s) => ({ ...s, tab: "couple" }));
      return;
    }

    editorStore.setState((s) => ({ ...s, saveStatus: "saving" }));
    try {
      const saveResult = await saveInv.mutateAsync({
        id: current.invitationId,
        templateId: current.selectedTemplateId || baseTmpl.id,
        ...current.inv,
      });

      const resolvedId = current.invitationId ?? saveResult?.id;
      if (!resolvedId) return;

      if (!current.invitationId && saveResult?.id) {
        editorStore.setState((s) => ({
          ...s,
          invitationId: saveResult.id,
          invSlug: saveResult.slug ?? s.invSlug,
        }));
        router.replace(`/editor?invitation=${saveResult.id}`);
      }

      const publishResult = await publish.mutateAsync(resolvedId);
      if (publishResult?.slug) {
        editorStore.setState((s) => ({ ...s, invSlug: publishResult.slug }));
      }

      editorStore.setState((s) => ({ ...s, saveStatus: "saved", showShare: true }));
      setTimeout(() => editorStore.setState((s) => ({ ...s, saveStatus: "idle" })), 2000);
    } catch {
      editorStore.setState((s) => ({ ...s, saveStatus: "idle" }));
    }
  };

  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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
      {/* ── MOBILE PREVIEW SHEET ── */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white pt-[68px] lg:hidden">
          <div className="flex items-center justify-between border-b border-gold-200/15 px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[2px] text-gold-600">
              Preview
            </span>
            <button
              onClick={() => setMobilePreviewOpen(false)}
              className="rounded-full bg-cream-100 px-4 py-1.5 text-[10px] font-semibold"
            >
              ← Back to Edit
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-cream-50/30">
            <InvitationPreview
              invitation={inv}
              events={displayEvents as any}
              template={activeTmpl}
              fullWidth
            />
          </div>
        </div>
      )}

      <div className="grid min-h-screen grid-cols-1 pt-[68px] lg:grid-cols-[380px_1fr]">
        {/* ── SIDEBAR ── */}
        <div className="border-gold-200/12 overflow-y-auto border-r bg-white pb-24 lg:pb-20">
          {/* Tab bar */}
          <div className="border-gold-200/12 sticky top-0 z-10 flex border-b bg-white">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => editorStore.setState((s) => ({ ...s, tab: t }))}
                className={`flex-1 border-b-2 py-3.5 text-[9px] font-semibold uppercase tracking-[1.5px] transition-colors ${
                  tab === t
                    ? "border-gold-500 text-gold-700"
                    : "border-transparent text-gold-800/50 hover:text-gold-800/80"
                }`}
              >
                {t === "ai" ? "✨ AI" : t === "media" ? "📸 Media" : t}
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
            <span className="text-[10px] text-gold-700/60">All changes saved</span>
            )}
            {saveStatus === "idle" && !invitationId && (
              <span className="text-[10px] text-gold-700/60">
                Enter couple names to start saving
              </span>
            )}
          </div>

          <div className="p-5">
            {tab === "couple" && <CoupleForm defaultValues={inv as any} onSave={handleSave} />}
            {tab === "events" && (
              <EventsForm
                events={displayEvents as any}
                onAdd={handleAddEvent as any}
                onRemove={handleRemoveEvent}
              />
            )}
            {tab === "details" && <DetailsForm defaultValues={inv as any} onSave={handleSave} />}

            {tab === "style" && (
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-gold-700 dark:text-gold-400">
                    Choose Template
                  </p>
                  <TemplateSwitcher
                    templates={allTemplates}
                    activeId={selectedTmpl}
                    onSelect={(t) => handleTemplateChange(t.id)}
                  />
                </div>
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-gold-700 dark:text-gold-400">
                    Active
                  </p>
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
                    <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gold-700 dark:text-gold-400">
                      Colors{" "}
                      {aiOverrides && (
                        <span className="ml-1 normal-case text-gold-600">✨ AI Applied</span>
                      )}
                    </p>
                    {aiOverrides && (
                      <button
                        onClick={() => editorStore.setState((s) => ({ ...s, aiOverrides: null }))}
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
                  editorStore.setState((s) => ({ ...s, aiOverrides: r, tab: "style" }));
                }}
              />
            )}

            {tab === "media" && (
              <MediaForm
                photos={inv.photos ?? []}
                musicUrl={inv.musicUrl ?? ""}
                onSave={handleMediaSave}
              />
            )}

            {/* Ad banner for free users (not on AI/media tab) */}
            {(!user || user.showAds) && tab !== "ai" && tab !== "media" && (
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
        {/* Mobile preview toggle */}
        <button
          className="btn-gold-outline !px-5 !py-2.5 !text-[10px] lg:hidden"
          onClick={() => setMobilePreviewOpen(true)}
        >
          Preview
        </button>
        {invitationId && (
          <Link
            href={`/preview?invitation=${invitationId}`}
            className="btn-gold-outline !hidden !px-5 !py-2.5 !text-[10px] lg:!inline-flex"
          >
            Preview
          </Link>
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
          onClose={() => editorStore.setState((s) => ({ ...s, showShare: false }))}
        />
      )}
    </>
  );
}
