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
  adQueryOptions,
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
import {
  Users,
  Calendar,
  FileText,
  Palette,
  Sparkles,
  Image,
  Loader2,
  Check,
  Eye,
  Send,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

const TABS = ["couple", "events", "details", "style", "ai", "media"] as const;

const TAB_ICONS: Record<string, React.ReactNode> = {
  couple: <Users className="h-3.5 w-3.5" />,
  events: <Calendar className="h-3.5 w-3.5" />,
  details: <FileText className="h-3.5 w-3.5" />,
  style: <Palette className="h-3.5 w-3.5" />,
  ai: <Sparkles className="h-3.5 w-3.5" />,
  media: <Image className="h-3.5 w-3.5" />,
};

export function EditorInner() {
  const searchParams = useSearchParams();
  const tmplIdParam = searchParams.get("template") ?? undefined;
  const invitationIdParam = searchParams.get("invitation") ?? undefined;
  const router = useRouter();

  const { data: allTemplates = [] } = useQuery(templatesQueryOptions());
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: editorAd } = useQuery(adQueryOptions("editor_bottom"));

  const { data: existingInv, isLoading: invLoading } = useQuery({
    ...invitationQueryOptions(invitationIdParam ?? ""),
    enabled: !!invitationIdParam,
  });

  const [editorStore] = useState(() =>
    createEditorStore(
      invitationIdParam
        ? (existingInv?.templateId ?? tmplIdParam ?? "beach")
        : (tmplIdParam ?? "beach")
    )
  );

  const tab = useStore(editorStore, (s) => s.tab);
  const inv = useStore(editorStore, (s) => s.inv);
  const invitationId = useStore(editorStore, (s) => s.invitationId);
  const invSlug = useStore(editorStore, (s) => s.invSlug);
  const selectedTmpl = useStore(editorStore, (s) => s.selectedTemplateId);
  const aiOverrides = useStore(editorStore, (s) => s.aiOverrides);
  const localEvents = useStore(editorStore, (s) => s.localEvents);
  const saveStatus = useStore(editorStore, (s) => s.saveStatus);
  const showShare = useStore(editorStore, (s) => s.showShare);

  const { data: dbEvents = [] } = useQuery({
    ...eventsQueryOptions(invitationId ?? ""),
    enabled: !!invitationId,
  });

  const saveInv = useSaveInvitation();
  const addEvent = useAddEvent();
  const removeEvent = useRemoveEvent();
  const publish = usePublishInvitation();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

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

  const activeTmpl = aiOverrides
    ? {
        ...baseTmpl,
        gradient: aiOverrides.gradient ?? baseTmpl.gradient,
        colors: { ...baseTmpl.colors, ...(aiOverrides.colors ?? {}) },
      }
    : baseTmpl;

  const displayEvents = invitationId ? dbEvents : localEvents;

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

  if (invLoading && invitationIdParam) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[68px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile preview sheet */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background pt-[68px] lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[2px] text-primary">
              Preview
            </span>
            <button
              onClick={() => setMobilePreviewOpen(false)}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[10px] font-semibold"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Edit
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-accent/30">
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
        {/* Sidebar */}
        <div className="overflow-y-auto border-r border-border bg-card pb-24 lg:pb-20">
          {/* Tab bar */}
          <div className="sticky top-0 z-10 flex border-b border-border bg-card">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => editorStore.setState((s) => ({ ...s, tab: t }))}
                className={`flex flex-1 flex-col items-center gap-0.5 border-b-2 py-3 text-[9px] font-semibold uppercase tracking-[1px] transition-colors ${
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {TAB_ICONS[t]}
                {t}
              </button>
            ))}
          </div>

          {/* Save status bar */}
          <div className="flex h-7 items-center border-b border-border/50 bg-accent/30 px-5">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-[10px] text-primary/70">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-600">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
            {saveStatus === "idle" && invitationId && (
              <span className="text-[10px] text-muted-foreground">All changes saved</span>
            )}
            {saveStatus === "idle" && !invitationId && (
              <span className="text-[10px] text-muted-foreground">
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
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                    Choose Template
                  </p>
                  <TemplateSwitcher
                    templates={allTemplates}
                    activeId={selectedTmpl}
                    onSelect={(t) => handleTemplateChange(t.id)}
                  />
                </div>
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                    Active
                  </p>
                  <div className="rounded-xl border border-border bg-accent/50 p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="text-xl">{baseTmpl.emoji}</span>
                      <h3 className="font-display text-lg font-semibold">{baseTmpl.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{baseTmpl.description}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                      Colors{" "}
                      {aiOverrides && (
                        <span className="ml-1 inline-flex items-center gap-1 normal-case text-primary">
                          <Sparkles className="h-3 w-3" /> AI Applied
                        </span>
                      )}
                    </p>
                    {aiOverrides && (
                      <button
                        onClick={() => editorStore.setState((s) => ({ ...s, aiOverrides: null }))}
                        className="flex items-center gap-1 text-[9px] text-destructive/70 underline hover:text-destructive"
                      >
                        <RotateCcw className="h-3 w-3" /> Reset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {Object.entries(activeTmpl.colors || {}).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <div
                          className="h-10 w-10 rounded-lg border border-border shadow-sm"
                          style={{ background: v as string }}
                        />
                        <span className="mt-0.5 block text-[8px] capitalize text-muted-foreground/50">{k}</span>
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

            {/* Ad */}
            {(!user || user.showAds) && tab !== "ai" && tab !== "media" && (
              <div className="mt-6">
                <AdBanner user={user ?? null} slot="editor_bottom" ad={editorAd ?? null} />
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="hidden items-start justify-center overflow-y-auto bg-accent/30 px-6 py-10 lg:flex">
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

      {/* Publish bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-border bg-card/90 px-6 py-3 backdrop-blur-md">
        <span className="mr-auto hidden text-xs text-muted-foreground sm:block">
          {inv.groomName && inv.brideName ? (
            <>
              Editing:{" "}
              <span className="font-semibold text-foreground">
                {inv.groomName} & {inv.brideName}
              </span>
            </>
          ) : (
            <span>New Invitation -- fill in couple names to begin saving</span>
          )}
        </span>
        <button
          className="btn-gold-outline !px-5 !py-2.5 !text-[10px] lg:hidden"
          onClick={() => setMobilePreviewOpen(true)}
        >
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
        {invitationId && (
          <Link
            href={`/preview?invitation=${invitationId}`}
            className="btn-gold-outline !hidden !px-5 !py-2.5 !text-[10px] lg:!inline-flex"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </Link>
        )}
        <button
          className="btn-gold !px-6 !py-2.5 !text-[10px] disabled:opacity-40"
          disabled={publish.isPending || saveInv.isPending}
          onClick={handlePublish}
        >
          {publish.isPending ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...</>
          ) : (
            <><Send className="h-3.5 w-3.5" /> Publish & Share</>
          )}
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
