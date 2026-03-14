"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Check,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import {
  plansQueryOptions,
  sessionQueryOptions,
  useCreateOrder,
  usePurchasePlan,
} from "~/lib/queries";
import { openRazorpayCheckout } from "~/lib/razorpay";

export default function PricingClient() {
  const { data: plans = [] } = useQuery(plansQueryOptions());
  const { data: user } = useQuery(sessionQueryOptions());
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const purchasePlan = usePurchasePlan();

  const handleUpgrade = async (planId: string) => {
    if (!user) return;
    setError(null);
    setBuyingPlan(planId);
    try {
      const order = await createOrder.mutateAsync({
        type: "subscription",
        plan: planId as "starter" | "premium" | "royal",
      });

      const result = await openRazorpayCheckout({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        description: order.description,
        keyId: order.keyId,
        prefill: { name: user.name, email: user.email },
      });

      await purchasePlan.mutateAsync({
        plan: planId as "starter" | "premium" | "royal",
        razorpayPaymentId: result.razorpay_payment_id,
        razorpayOrderId: result.razorpay_order_id,
        razorpaySignature: result.razorpay_signature,
      });
    } catch (err: any) {
      if (err?.message !== "Payment cancelled") {
        setError(err?.message ?? "Payment failed. Please try again.");
      }
    } finally {
      setBuyingPlan(null);
    }
  };

  return (
    <div className="min-h-screen animate-fade-up pt-[68px]">
      <div className="mx-auto max-w-[1320px] px-6 py-20 lg:px-8">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">Pricing</p>
          <h1 className="section-heading mb-3">Choose Your Plan</h1>
          <p className="mx-auto max-w-md font-body text-lg text-muted-foreground">
            One purchase. Lifetime access. No hidden costs. Free plan includes ads.
          </p>
        </div>

        {error && (
          <div className="mx-auto mb-8 flex max-w-5xl items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-3 text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {(plans as any[]).map((p, i) => {
            const isActive = user?.plan === p.id;
            const isLoading = buyingPlan === p.id;
            return (
              <div
                key={i}
                className={`relative rounded-2xl p-7 text-center ${p.badge ? "scale-[1.02] border-2 border-primary bg-card shadow-gold-lg" : "border border-border bg-card"}`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[1px] text-primary-foreground">
                    {p.badge}
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-0.5 text-[9px] font-semibold text-white">
                    <CheckCircle2 className="h-3 w-3" /> Current
                  </div>
                )}
                <h3 className="mb-1 font-display text-xl font-bold">{p.name}</h3>
                <div className="mb-0.5 font-display text-4xl font-bold text-primary">
                  {p.price === 0 ? "Free" : "\u20B9" + p.price.toLocaleString("en-IN")}
                </div>
                <p className="mb-1 text-xs text-muted-foreground">{p.price === 0 ? "forever" : "one-time"}</p>
                {p.showAds ? (
                  <p className="mb-4 flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-600">
                    <AlertCircle className="h-3 w-3" /> Contains Ads
                  </p>
                ) : p.price > 0 ? (
                  <p className="mb-4 flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Ad-Free + {p.credits} AI Credits
                  </p>
                ) : (
                  <div className="mb-4" />
                )}
                <div className="mb-6 space-y-2.5 text-left">
                  {(p.features as string[]).map((f: string, j: number) => (
                    <div key={j} className="flex items-start gap-2 text-xs">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 font-bold text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                {isActive ? (
                  <button
                    disabled
                    className="w-full rounded-full border border-border bg-muted py-3 text-sm font-semibold text-muted-foreground"
                  >
                    Current Plan
                  </button>
                ) : p.id === "free" ? (
                  <Link
                    href={user ? "/dashboard" : "/auth/register"}
                    className="block w-full rounded-full border-2 border-primary py-3 text-center text-sm font-semibold tracking-wide text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    Get Started Free
                  </Link>
                ) : user ? (
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={isLoading || buyingPlan !== null}
                    className={`w-full rounded-full py-3 text-sm font-semibold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60 ${p.badge ? "bg-primary text-primary-foreground shadow-gold hover:-translate-y-0.5 hover:shadow-gold-lg" : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Choose ${p.name}`
                    )}
                  </button>
                ) : (
                  <Link
                    href="/auth/register"
                    className={`block w-full rounded-full py-3 text-center text-sm font-semibold tracking-wide transition-all ${p.badge ? "bg-primary text-primary-foreground shadow-gold hover:-translate-y-0.5 hover:shadow-gold-lg" : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}
                  >
                    {`Choose ${p.name}`}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-display text-2xl font-bold">Free vs Paid</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="bg-accent/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                    Free
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[1.5px] text-primary">
                    <span className="flex items-center justify-center gap-1">
                      <Sparkles className="h-3 w-3" /> Paid
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Templates", "2 Free", "All / Purchase Individual"],
                  ["Events", "Up to 2", "Unlimited"],
                  ["Ads", "Yes, shown", "No ads"],
                  ["AI Credits", "3 on signup", "5-50 bonus"],
                  ["RSVP Dashboard", "Basic", "Full + Analytics"],
                  ["Custom Domain", "--", "Included"],
                  ["Music", "--", "Included"],
                  ["Priority Support", "--", "Included"],
                ].map(([f, free, paid], i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-6 py-3 text-sm font-medium">{f}</td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">{free}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-primary">
                      {paid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
