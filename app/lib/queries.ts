import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import * as actions from "./actions";

// ━━━ AUTH ━━━
export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: () => actions.getSession(),
    staleTime: 5 * 60_000,
  });

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; phone?: string }) =>
      actions.register(data),
    onSuccess: (user) => {
      qc.setQueryData(["session"], user);
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => actions.login(data),
    onSuccess: (user) => {
      qc.setQueryData(["session"], user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => actions.logout(),
    onSuccess: () => {
      qc.setQueryData(["session"], null);
      qc.invalidateQueries();
    },
  });
}

// ━━━ TEMPLATES ━━━
export const templatesQueryOptions = (category?: string) =>
  queryOptions({
    queryKey: ["templates", category ?? "All"],
    queryFn: () => actions.getTemplates({ category }),
    staleTime: 5 * 60_000,
  });

export const myTemplatesQueryOptions = () =>
  queryOptions({ queryKey: ["my-templates"], queryFn: () => actions.getMyTemplates() });

// ━━━ INVITATIONS ━━━
export const myInvitationsQueryOptions = () =>
  queryOptions({ queryKey: ["my-invitations"], queryFn: () => actions.getMyInvitations() });

export const invitationQueryOptions = (id: string) =>
  queryOptions({ queryKey: ["invitation", id], queryFn: () => actions.getInvitation({ id }) });

export function useSaveInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.saveInvitation>[0]) =>
      actions.saveInvitation(data),
    onSuccess: (_res, vars) => {
      if (vars.id) qc.invalidateQueries({ queryKey: ["invitation", vars.id] });
      qc.invalidateQueries({ queryKey: ["my-invitations"] });
    },
  });
}

export function usePublishInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actions.publishInvitation({ id }),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["invitation", id] });
    },
  });
}

export function useUnpublishInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actions.unpublishInvitation({ id }),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["invitation", id] });
    },
  });
}

// ━━━ EVENTS ━━━
export const eventsQueryOptions = (invitationId: string) =>
  queryOptions({
    queryKey: ["events", invitationId],
    queryFn: () => actions.getEvents({ invitationId }),
  });

export function useAddEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.addEvent>[0]) => actions.addEvent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useRemoveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => actions.removeEvent({ id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

// ━━━ RSVPS ━━━
export const rsvpsQueryOptions = (invitationId: string) =>
  queryOptions({
    queryKey: ["rsvps", invitationId],
    queryFn: () => actions.getRsvps({ invitationId }),
  });

export function useUpdateRsvpStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; status: "attending" | "pending" | "declined" }) =>
      actions.updateRsvpStatus(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsvps"] }),
  });
}

// ━━━ CREDITS ━━━
export const creditsQueryOptions = () =>
  queryOptions({ queryKey: ["credits"], queryFn: () => actions.getMyCredits() });
export const creditPacksQueryOptions = () =>
  queryOptions({
    queryKey: ["credit-packs"],
    queryFn: () => actions.getCreditPacks(),
    staleTime: Infinity,
  });

// ━━━ AI GENERATION ━━━
export function useGenerateAIDesign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { prompt: string; style?: string; invitationId?: string }) =>
      actions.generateAIDesign(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

// ━━━ ANALYTICS ━━━
export const analyticsQueryOptions = (invitationId: string) =>
  queryOptions({
    queryKey: ["analytics", invitationId],
    queryFn: () => actions.getAnalytics({ invitationId }),
  });

// ━━━ ADS ━━━
export const adQueryOptions = (slot: string) =>
  queryOptions({
    queryKey: ["ad", slot],
    queryFn: () => actions.getAd({ slot }),
    staleTime: 60_000,
  });

// ━━━ PLANS ━━━
export const plansQueryOptions = () =>
  queryOptions({ queryKey: ["plans"], queryFn: () => actions.getPlans(), staleTime: Infinity });

// ━━━ PUBLIC INVITE ━━━
export const publicInviteQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["public-invite", slug],
    queryFn: () => actions.getInvitationBySlug({ slug }),
    staleTime: 60_000,
  });

export function useSubmitRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.submitRsvp>[0]) => actions.submitRsvp(data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["rsvps", vars.invitationId] });
    },
  });
}

// ━━━ DELETE INVITATION ━━━
export function useDeleteInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actions.deleteInvitation({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-invitations"] });
    },
  });
}

// ━━━ PAYMENTS ━━━
export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.createOrder>[0]) => actions.createOrder(data),
  });
}

export function usePurchasePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.purchasePlan>[0]) => actions.purchasePlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["session"] });
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

export function useBuyCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.buyCredits>[0]) => actions.buyCredits(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credits"] });
      qc.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useBuyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.buyTemplate>[0]) => actions.buyTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-templates"] });
    },
  });
}

// ━━━ PAYMENT HISTORY ━━━
export const paymentHistoryQueryOptions = () =>
  queryOptions({ queryKey: ["payment-history"], queryFn: () => actions.getPaymentHistory() });

// ━━━ PASSWORD RESET ━━━
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => actions.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => actions.resetPassword(data),
  });
}
