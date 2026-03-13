import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import * as sf from "./server-fns";

// ━━━ AUTH ━━━
export const sessionQueryOptions = () => queryOptions({ queryKey: ["session"], queryFn: () => sf.getSession(), staleTime: 5 * 60_000 });

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; phone?: string }) => sf.register({ data }),
    onSuccess: (res) => {
      document.cookie = `invitara_token=${res.token}; path=/; max-age=${30 * 86400}; samesite=lax`;
      qc.setQueryData(["session"], res.user);
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => sf.login({ data }),
    onSuccess: (res) => {
      document.cookie = `invitara_token=${res.token}; path=/; max-age=${30 * 86400}; samesite=lax`;
      qc.setQueryData(["session"], res.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { document.cookie = "invitara_token=; path=/; max-age=0"; },
    onSuccess: () => { qc.setQueryData(["session"], null); qc.invalidateQueries(); },
  });
}

// ━━━ TEMPLATES ━━━
export const templatesQueryOptions = (category?: string) =>
  queryOptions({ queryKey: ["templates", category ?? "All"], queryFn: () => sf.getTemplates({ data: { category } }), staleTime: Infinity });

export const myTemplatesQueryOptions = () =>
  queryOptions({ queryKey: ["my-templates"], queryFn: () => sf.getMyTemplates() });

// ━━━ INVITATIONS ━━━
export const myInvitationsQueryOptions = () =>
  queryOptions({ queryKey: ["my-invitations"], queryFn: () => sf.getMyInvitations() });

export const invitationQueryOptions = (id: string) =>
  queryOptions({ queryKey: ["invitation", id], queryFn: () => sf.getInvitation({ data: { id } }) });

export function useSaveInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof sf.saveInvitation>[0]["data"]) => sf.saveInvitation({ data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invitation"] }); qc.invalidateQueries({ queryKey: ["my-invitations"] }); },
  });
}

// ━━━ EVENTS ━━━
export const eventsQueryOptions = (invitationId: string) =>
  queryOptions({ queryKey: ["events", invitationId], queryFn: () => sf.getEvents({ data: { invitationId } }) });

export function useAddEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof sf.addEvent>[0]["data"]) => sf.addEvent({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useRemoveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sf.removeEvent({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

// ━━━ RSVPS ━━━
export const rsvpsQueryOptions = (invitationId: string) =>
  queryOptions({ queryKey: ["rsvps", invitationId], queryFn: () => sf.getRsvps({ data: { invitationId } }) });

export function useUpdateRsvpStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; status: "attending" | "pending" | "declined" }) => sf.updateRsvpStatus({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsvps"] }),
  });
}

// ━━━ CREDITS ━━━
export const creditsQueryOptions = () => queryOptions({ queryKey: ["credits"], queryFn: () => sf.getMyCredits() });
export const creditPacksQueryOptions = () => queryOptions({ queryKey: ["credit-packs"], queryFn: () => sf.getCreditPacks(), staleTime: Infinity });

// ━━━ AI GENERATION ━━━
export function useGenerateAIDesign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { prompt: string; style?: string; invitationId?: string }) => sf.generateAIDesign({ data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["credits"] }); },
  });
}

// ━━━ ANALYTICS ━━━
export const analyticsQueryOptions = (invitationId: string) =>
  queryOptions({ queryKey: ["analytics", invitationId], queryFn: () => sf.getAnalytics({ data: { invitationId } }) });

// ━━━ ADS ━━━
export const adQueryOptions = (slot: string) =>
  queryOptions({ queryKey: ["ad", slot], queryFn: () => sf.getAd({ data: { slot } }), staleTime: 60_000 });

// ━━━ PLANS ━━━
export const plansQueryOptions = () => queryOptions({ queryKey: ["plans"], queryFn: () => sf.getPlans(), staleTime: Infinity });
