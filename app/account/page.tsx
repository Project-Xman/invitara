"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  sessionQueryOptions,
  creditsQueryOptions,
  creditPacksQueryOptions,
  paymentHistoryQueryOptions,
  useLogout,
} from "~/lib/queries";
import { CreditStore } from "~/components/CreditStore";

export default function AccountPage() {
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: creditData } = useQuery(creditsQueryOptions());
  const { data: packs = [] } = useQuery(creditPacksQueryOptions());
  const { data: payments = [] } = useQuery({ ...paymentHistoryQueryOptions(), enabled: !!user });
  const logout = useLogout();
  const router = useRouter();

  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center pt-[68px]">
        <div className="text-center">
          <h2 className="mb-4 font-display text-2xl font-bold">Please sign in</h2>
          <Link href="/auth/login" className="btn-gold">
            Sign In
          </Link>
        </div>
      </div>
    );

  const planColors: Record<string, string> = {
    free: "bg-cream-200 text-cream-800",
    starter: "bg-blue-100 text-blue-700",
    premium: "bg-gold-200 text-gold-800",
    royal: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="min-h-screen animate-fade-up pt-[68px]">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[3px] text-gold-600/70">
            Account
          </p>
          <h1 className="font-display text-3xl font-bold">Your Account</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Profile */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gold-200/15 bg-white p-6">
              <h3 className="mb-4 font-display text-lg font-bold">Profile</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-50">Name</span>
                  <span className="text-sm font-semibold">{user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-50">Email</span>
                  <span className="text-sm font-semibold">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-50">Phone</span>
                  <span className="text-sm font-semibold">{user.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-50">Plan</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${planColors[user.plan]}`}
                  >
                    {user.plan.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-50">Ads</span>
                  <span
                    className={`text-sm font-semibold ${user.showAds ? "text-amber-600" : "text-emerald-600"}`}
                  >
                    {user.showAds ? "⚠️ Showing Ads" : "✓ Ad-Free"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-50">Since</span>
                  <span className="text-sm opacity-60">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Upgrade CTA for free users */}
            {user.plan === "free" && (
              <div
                className="rounded-2xl p-6 text-white"
                style={{ background: "linear-gradient(135deg,#A67C2E,#D4A853,#FFD466)" }}
              >
                <h3 className="mb-2 font-display text-lg font-bold">
                  Remove Ads & Unlock Everything
                </h3>
                <p className="mb-4 text-sm opacity-80">
                  Upgrade to any paid plan to remove ads, get bonus AI credits, and unlock all
                  templates.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block rounded-full bg-white px-6 py-2.5 text-xs font-semibold tracking-wide text-gold-800 shadow-lg transition-all hover:-translate-y-0.5"
                >
                  View Plans →
                </Link>
              </div>
            )}

            <button
              onClick={() => {
                logout.mutate();
                router.push("/");
              }}
              className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>

          {/* Credits */}
          <CreditStore
            user={user}
            packages={packs as any[]}
            history={(creditData?.history || []) as any[]}
          />
        </div>

        {/* Payment History */}
        {(payments as any[]).length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 font-display text-xl font-bold">Payment History</h3>
            <div className="overflow-hidden rounded-2xl border border-gold-200/15 bg-white">
              {(payments as any[]).map((p: any) => (
                <div
                  key={p.id}
                  className="border-gold-200/8 flex items-center justify-between border-b px-5 py-3.5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {p.type === "subscription"
                        ? `Plan Upgrade`
                        : p.type === "credits"
                          ? "Credits Purchase"
                          : "Template Purchase"}
                    </p>
                    <p className="mt-0.5 text-[11px] opacity-30">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide ${p.status === "completed" ? "bg-emerald-100 text-emerald-700" : p.status === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}
                    >
                      {p.status}
                    </span>
                    <p className="text-sm font-semibold">
                      ₹{Number(p.amount).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
