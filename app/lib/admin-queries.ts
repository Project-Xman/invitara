import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminActions from "./admin-actions";

// ━━━ ERROR HANDLER ━━━
function handleMutationError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  const label = context ? `[${context}] ` : "";
  console.error(`${label}${message}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALYTICS QUERIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminAnalyticsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "analytics"],
    queryFn: () => adminActions.getAdminAnalytics(),
    staleTime: 5 * 60_000,
  });

export const adminSignupChartQueryOptions = (days: number) =>
  queryOptions({
    queryKey: ["admin", "signup-chart", days],
    queryFn: () => adminActions.getSignupChart({ days }),
    staleTime: 5 * 60_000,
  });

export const adminRevenueChartQueryOptions = (days: number) =>
  queryOptions({
    queryKey: ["admin", "revenue-chart", days],
    queryFn: () => adminActions.getRevenueChart({ days }),
    staleTime: 5 * 60_000,
  });

export const adminPopularTemplatesQueryOptions = (limit: number) =>
  queryOptions({
    queryKey: ["admin", "popular-templates", limit],
    queryFn: () => adminActions.getPopularTemplates({ limit }),
    staleTime: 5 * 60_000,
  });

export const adminPlanDistributionQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "plan-distribution"],
    queryFn: () => adminActions.getPlanDistribution(),
    staleTime: 5 * 60_000,
  });

export const adminConversionFunnelQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "conversion-funnel"],
    queryFn: () => adminActions.getConversionFunnel(),
    staleTime: 5 * 60_000,
  });

export const adminRetentionCohortsQueryOptions = (weeks: number) =>
  queryOptions({
    queryKey: ["admin", "retention-cohorts", weeks],
    queryFn: () => adminActions.getRetentionCohorts({ weeks }),
    staleTime: 5 * 60_000,
  });

export const adminGeoBreakdownQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "geo-breakdown"],
    queryFn: () => adminActions.getGeographicBreakdown(),
    staleTime: 5 * 60_000,
  });

export const adminDeviceBreakdownQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "device-breakdown"],
    queryFn: () => adminActions.getDeviceBreakdown(),
    staleTime: 5 * 60_000,
  });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USERS QUERIES & MUTATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminUsersQueryOptions = (filters: {
  page: number;
  pageSize: number;
  search?: string;
  plan?: string;
  showBanned?: boolean;
}) =>
  queryOptions({
    queryKey: ["admin", "users", filters],
    queryFn: () => adminActions.getAdminUsers(filters),
    staleTime: 30_000,
  });

export function useUpdateUserPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; plan: string }) =>
      adminActions.updateUserPlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => handleMutationError(error, "Update user plan"),
  });
}

export function useAdjustUserCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; amount: number; reason: string }) =>
      adminActions.adjustUserCredits(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => handleMutationError(error, "Adjust user credits"),
  });
}

export function useToggleUserAds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string }) =>
      adminActions.toggleUserAds(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => handleMutationError(error, "Toggle user ads"),
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string }) => adminActions.banUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => handleMutationError(error, "Ban user"),
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string }) => adminActions.unbanUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => handleMutationError(error, "Unban user"),
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INVITATIONS QUERIES & MUTATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminInvitationsQueryOptions = (filters: {
  page: number;
  pageSize: number;
  search?: string;
  published?: string;
  templateId?: string;
}) =>
  queryOptions({
    queryKey: ["admin", "invitations", filters],
    queryFn: () => adminActions.getAdminInvitations(filters),
    staleTime: 30_000,
  });

export function useAdminUnpublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { invitationId: string }) =>
      adminActions.adminUnpublish(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invitations"] });
    },
    onError: (error) => handleMutationError(error, "Admin unpublish"),
  });
}

export function useAdminDeleteInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { invitationId: string }) =>
      adminActions.adminDeleteInvitation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invitations"] });
    },
    onError: (error) => handleMutationError(error, "Admin delete invitation"),
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEMPLATES QUERIES & MUTATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "templates"],
    queryFn: () => adminActions.getAdminTemplates(),
    staleTime: 5 * 60_000,
  });

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminActions.createTemplate>[0]) =>
      adminActions.createTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "templates"] });
    },
    onError: (error) => handleMutationError(error, "Create template"),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminActions.updateTemplate>[0]) =>
      adminActions.updateTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "templates"] });
    },
    onError: (error) => handleMutationError(error, "Update template"),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string }) => adminActions.deleteTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "templates"] });
    },
    onError: (error) => handleMutationError(error, "Delete template"),
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLANS QUERIES & MUTATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminPlansQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "plans"],
    queryFn: () => adminActions.getAdminPlans(),
    staleTime: 5 * 60_000,
  });

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminActions.updatePlan>[0]) =>
      adminActions.updatePlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error) => handleMutationError(error, "Update plan"),
  });
}

export function useTogglePlanActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string }) => adminActions.togglePlanActive(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error) => handleMutationError(error, "Toggle plan active"),
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADS QUERIES & MUTATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminAdsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "ads"],
    queryFn: () => adminActions.getAdminAds(),
    staleTime: 5 * 60_000,
  });

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminActions.createAd>[0]) =>
      adminActions.createAd(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
    onError: (error) => handleMutationError(error, "Create ad"),
  });
}

export function useUpdateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminActions.updateAd>[0]) =>
      adminActions.updateAd(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
    onError: (error) => handleMutationError(error, "Update ad"),
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string }) => adminActions.deleteAd(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
    onError: (error) => handleMutationError(error, "Delete ad"),
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAYMENTS QUERIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminPaymentsQueryOptions = (filters: {
  page: number;
  pageSize: number;
  status?: string;
  type?: string;
  search?: string;
}) =>
  queryOptions({
    queryKey: ["admin", "payments", filters],
    queryFn: () => adminActions.getAdminPayments(filters),
    staleTime: 30_000,
  });

export const adminPaymentSummaryQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "payment-summary"],
    queryFn: () => adminActions.getPaymentSummary(),
    staleTime: 5 * 60_000,
  });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREDIT PACKAGES QUERIES & MUTATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminCreditPackagesQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "credit-packages"],
    queryFn: () => adminActions.getAdminCreditPackages(),
    staleTime: 5 * 60_000,
  });

export function useCreateCreditPackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminActions.createCreditPackage>[0]) =>
      adminActions.createCreditPackage(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "credit-packages"] });
    },
    onError: (error) => handleMutationError(error, "Create credit package"),
  });
}

export function useUpdateCreditPackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminActions.updateCreditPackage>[0]) =>
      adminActions.updateCreditPackage(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "credit-packages"] });
    },
    onError: (error) => handleMutationError(error, "Update credit package"),
  });
}

export function useToggleCreditPackageActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number }) =>
      adminActions.toggleCreditPackageActive(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "credit-packages"] });
    },
    onError: (error) => handleMutationError(error, "Toggle credit package active"),
  });
}
