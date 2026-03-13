import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import * as actions from "./actions";

// ━━━ ERROR HANDLER ━━━
function handleMutationError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  const label = context ? `[${context}] ` : "";
  console.error(`${label}${message}`);
}

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
    onError: (error) => handleMutationError(error, "Register"),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => actions.login(data),
    onSuccess: (user) => {
      qc.setQueryData(["session"], user);
    },
    onError: (error) => handleMutationError(error, "Login"),
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
    onError: (error) => handleMutationError(error, "Logout"),
  });
}

// ━━━ TEMPLATES ━━━
export const templatesQueryOptions = (category?: string) =>
  queryOptions({
    queryKey: ["templates", category ?? "All"],
    queryFn: () => actions.getTemplates({ category }),
    staleTime: 10 * 60_000,
  });

export const myTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ["my-templates"],
    queryFn: () => actions.getMyTemplates(),
    staleTime: 10 * 60_000,
  });

// ━━━ INVITATIONS ━━━
export const myInvitationsQueryOptions = () =>
  queryOptions({
    queryKey: ["my-invitations"],
    queryFn: () => actions.getMyInvitations(),
    staleTime: 30_000,
  });

export const invitationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["invitation", id],
    queryFn: () => actions.getInvitation({ id }),
    staleTime: 30_000,
  });

export function useSaveInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.saveInvitation>[0]) =>
      actions.saveInvitation(data),
    onSuccess: (_res, vars) => {
      if (vars.id) qc.invalidateQueries({ queryKey: ["invitation", vars.id] });
      qc.invalidateQueries({ queryKey: ["my-invitations"] });
    },
    onError: (error) => handleMutationError(error, "Save invitation"),
  });
}

export function usePublishInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actions.publishInvitation({ id }),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["invitation", id] });
    },
    onError: (error) => handleMutationError(error, "Publish invitation"),
  });
}

export function useUnpublishInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actions.unpublishInvitation({ id }),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["invitation", id] });
    },
    onError: (error) => handleMutationError(error, "Unpublish invitation"),
  });
}

// ━━━ EVENTS ━━━
export const eventsQueryOptions = (invitationId: string) =>
  queryOptions({
    queryKey: ["events", invitationId],
    queryFn: () => actions.getEvents({ invitationId }),
    staleTime: 30_000,
  });

export function useAddEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.addEvent>[0]) => actions.addEvent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
    onError: (error) => handleMutationError(error, "Add event"),
  });
}

export function useRemoveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => actions.removeEvent({ id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
    onError: (error) => handleMutationError(error, "Remove event"),
  });
}

// ━━━ RSVPS ━━━
export const rsvpsQueryOptions = (invitationId: string) =>
  queryOptions({
    queryKey: ["rsvps", invitationId],
    queryFn: () => actions.getRsvps({ invitationId }),
    staleTime: 30_000,
  });

export function useUpdateRsvpStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; status: "attending" | "pending" | "declined" }) =>
      actions.updateRsvpStatus(data),

    onMutate: async ({ id, status }) => {
      // Cancel any in-flight refetches to avoid overwriting optimistic update
      await qc.cancelQueries({ queryKey: ["rsvps"] });
      // Snapshot all rsvp queries for rollback
      const snapshot = qc.getQueriesData<any[]>({ queryKey: ["rsvps"] });
      // Optimistically update every matching cache entry
      qc.setQueriesData<any[]>({ queryKey: ["rsvps"] }, (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === id ? { ...r, status } : r));
      });
      return { snapshot };
    },

    onError: (error, _vars, context) => {
      // Roll back to snapshot on error
      if (context?.snapshot) {
        for (const [queryKey, data] of context.snapshot) {
          qc.setQueryData(queryKey, data);
        }
      }
      handleMutationError(error, "Update RSVP status");
    },

    onSettled: () => qc.invalidateQueries({ queryKey: ["rsvps"] }),
  });
}

// ━━━ CREDITS ━━━
export const creditsQueryOptions = () =>
  queryOptions({
    queryKey: ["credits"],
    queryFn: () => actions.getMyCredits(),
    staleTime: 30_000,
  });

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
    onError: (error) => handleMutationError(error, "AI design generation"),
  });
}

// ━━━ ANALYTICS ━━━
export const analyticsQueryOptions = (invitationId: string) =>
  queryOptions({
    queryKey: ["analytics", invitationId],
    queryFn: () => actions.getAnalytics({ invitationId }),
    staleTime: 5 * 60_000,
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
    onError: (error) => handleMutationError(error, "Submit RSVP"),
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
    onError: (error) => handleMutationError(error, "Delete invitation"),
  });
}

// ━━━ PAYMENTS ━━━
export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.createOrder>[0]) => actions.createOrder(data),
    onError: (error) => handleMutationError(error, "Create order"),
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
    onError: (error) => handleMutationError(error, "Plan purchase"),
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
    onError: (error) => handleMutationError(error, "Buy credits"),
  });
}

export function useBuyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof actions.buyTemplate>[0]) => actions.buyTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-templates"] });
    },
    onError: (error) => handleMutationError(error, "Buy template"),
  });
}

// ━━━ PAYMENT HISTORY ━━━
export const paymentHistoryQueryOptions = () =>
  queryOptions({
    queryKey: ["payment-history"],
    queryFn: () => actions.getPaymentHistory(),
    staleTime: 5 * 60_000,
  });

// ━━━ PASSWORD RESET ━━━
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => actions.forgotPassword(data),
    onError: (error) => handleMutationError(error, "Forgot password"),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => actions.resetPassword(data),
    onError: (error) => handleMutationError(error, "Reset password"),
  });
}
