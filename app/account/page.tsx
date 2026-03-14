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
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  LogOut,
  Crown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from "lucide-react";

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
    free: "bg-muted text-muted-foreground",
    starter: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    premium: "bg-primary/10 text-primary",
    royal: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  const profileFields = [
    { icon: <User className="h-4 w-4" />, label: "Name", value: user.name },
    { icon: <Mail className="h-4 w-4" />, label: "Email", value: user.email },
    { icon: <Phone className="h-4 w-4" />, label: "Phone", value: user.phone || "--" },
    {
      icon: <Shield className="h-4 w-4" />,
      label: "Plan",
      value: (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${planColors[user.plan]}`}>
          {user.plan.toUpperCase()}
        </span>
      ),
    },
    {
      icon: user.showAds ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />,
      label: "Ads",
      value: (
        <span className={`flex items-center gap-1.5 text-sm font-semibold ${user.showAds ? "text-amber-600" : "text-emerald-600"}`}>
          {user.showAds ? (
            <><AlertCircle className="h-3.5 w-3.5" /> Showing Ads</>
          ) : (
            <><CheckCircle2 className="h-3.5 w-3.5" /> Ad-Free</>
          )}
        </span>
      ),
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Since",
      value: new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="min-h-screen animate-fade-up pt-[68px]">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-10 text-center">
          <p className="section-label mb-2">Account</p>
          <h1 className="font-display text-3xl font-bold">Your Account</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Profile */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                <User className="h-5 w-5 text-primary" /> Profile
              </h3>
              <div className="space-y-3">
                {profileFields.map((f, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      {f.icon} {f.label}
                    </span>
                    <span className="text-sm font-semibold">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            {user.plan === "free" && (
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
                <div className="mb-3 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  <h3 className="font-display text-lg font-bold">
                    Remove Ads & Unlock Everything
                  </h3>
                </div>
                <p className="mb-4 text-sm opacity-80">
                  Upgrade to any paid plan to remove ads, get bonus AI credits, and unlock all
                  templates.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-semibold tracking-wide text-primary shadow-lg transition-all hover:-translate-y-0.5"
                >
                  View Plans <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <button
              onClick={() => {
                logout.mutate();
                router.push("/");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Sign Out
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
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <CreditCard className="h-5 w-5 text-primary" /> Payment History
            </h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {(payments as any[]).map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-border/50 px-5 py-3.5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {p.type === "subscription"
                        ? "Plan Upgrade"
                        : p.type === "credits"
                          ? "Credits Purchase"
                          : "Template Purchase"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide ${p.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : p.status === "failed" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                    >
                      {p.status}
                    </span>
                    <p className="text-sm font-semibold">
                      {'\u20B9'}{Number(p.amount).toLocaleString("en-IN")}
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
