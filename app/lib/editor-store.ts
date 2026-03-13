import { Store } from "@tanstack/store";

export type InvData = {
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
  photos: string[];
  musicUrl: string;
};

export type LocalEvent = {
  id: number;
  name: string;
  date: string;
  venue: string;
  time: string;
  icon: string;
  color: string;
};

export type SaveStatus = "idle" | "saving" | "saved";

export type EditorState = {
  invitationId: string | undefined;
  invSlug: string | undefined;
  selectedTemplateId: string;
  aiOverrides: { gradient?: string; colors?: Record<string, string> } | null;
  inv: InvData;
  localEvents: LocalEvent[];
  tab: "couple" | "events" | "details" | "style" | "ai" | "media";
  saveStatus: SaveStatus;
  showShare: boolean;
};

export const EMPTY_INV: InvData = {
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
  photos: [],
  musicUrl: "",
};

export function createEditorStore(initialTemplateId: string): Store<EditorState> {
  return new Store<EditorState>({
    invitationId: undefined,
    invSlug: undefined,
    selectedTemplateId: initialTemplateId,
    aiOverrides: null,
    inv: EMPTY_INV,
    localEvents: [],
    tab: "couple",
    saveStatus: "idle",
    showShare: false,
  });
}

export type EditorStore = ReturnType<typeof createEditorStore>;
