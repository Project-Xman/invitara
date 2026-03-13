"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  plansQueryOptions,
  sessionQueryOptions,
  useCreateOrder,
  usePurchasePlan,
} from "~/lib/queries";
import { openRazorpayCheckout } from "~/lib/razorpay";

export default function PricingPage() {
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
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[3px] text-gold-600/70">
            Pricing
          </p>
          <h1 className="mb-3 font-display text-4xl font-bold md:text-5xl">Choose Your Plan</h1>
          <p className="mx-auto max-w-md font-body text-lg text-cream-800/50">
            One purchase. Lifetime access. No hidden costs. Free plan includes ads.
          </p>
        </div>

        {error && (
          <div className="mx-auto mb-8 max-w-5xl rounded-xl border border-red-200/40 bg-red-50 p-4 text-center text-sm text-red-600">
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
                className={`relative rounded-2xl p-7 text-center ${p.badge ? "scale-[1.02] border-2 border-gold-500 bg-white shadow-gold-lg" : "border border-gold-200/15 bg-white"}`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-700 px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[1px] text-white">
                    {p.badge}
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-0.5 text-[9px] font-semibold text-white">
                    Current
                  </div>
                )}
                <h3 className="mb-1 font-display text-xl font-bold">{p.name}</h3>
                <div className="mb-0.5 font-display text-4xl font-bold text-gold-700">
                  {p.price === 0 ? "Free" : "₹" + p.price.toLocaleString("en-IN")}
                </div>
                <p className="mb-1 text-xs opacity-40">{p.price === 0 ? "forever" : "one-time"}</p>
                {p.showAds ? (
                  <p className="mb-4 text-[10px] font-semibold text-amber-600">⚠️ Contains Ads</p>
                ) : p.price > 0 ? (
                  <p className="mb-4 text-[10px] font-semibold text-emerald-600">
                    ✓ Ad-Free + {p.credits} AI Credits
                  </p>
                ) : (
                  <div className="mb-4" />
                )}
                <div className="mb-6 space-y-2.5 text-left">
                  {(p.features as string[]).map((f: string, j: number) => (
                    <div key={j} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 font-bold text-gold-600">✓</span>
                      <span className="opacity-55">{f}</span>
                    </div>
                  ))}
                </div>
                {isActive ? (
                  <button
                    disabled
                    className="w-full rounded-full border border-gold-200/20 bg-cream-100 py-3 text-sm font-semibold text-cream-700"
                  >
                    Current Plan
                  </button>
                ) : p.id === "free" ? (
                  <Link
                    href={user ? "/dashboard" : "/auth/register"}
                    className="block w-full rounded-full border-2 border-gold-500 py-3 text-center text-sm font-semibold tracking-wide text-gold-700 transition-all hover:bg-gold-700 hover:text-white"
                  >
                    Get Started Free
                  </Link>
                ) : user ? (
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={isLoading || buyingPlan !== null}
                    className={`w-full rounded-full py-3 text-sm font-semibold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60 ${p.badge ? "bg-gold-700 text-white shadow-gold hover:-translate-y-0.5 hover:shadow-gold-lg" : "border-2 border-gold-500 text-gold-700 hover:bg-gold-700 hover:text-white"}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Processing…
                      </span>
                    ) : (
                      `Choose ${p.name}`
                    )}
                  </button>
                ) : (
                  <Link
                    href="/auth/register"
                    className={`block w-full rounded-full py-3 text-center text-sm font-semibold tracking-wide transition-all ${p.badge ? "bg-gold-700 text-white shadow-gold hover:-translate-y-0.5 hover:shadow-gold-lg" : "border-2 border-gold-500 text-gold-700 hover:bg-gold-700 hover:text-white"}`}
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
          <div className="overflow-hidden rounded-2xl border border-gold-200/15 bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-cream-50/60">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[1.5px] opacity-40">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[1.5px] opacity-40">
                    Free
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[1.5px] text-gold-700">
                    ✦ Paid
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
                  ["Custom Domain", "✗", "✓"],
                  ["Music", "✗", "✓"],
                  ["Priority Support", "✗", "✓"],
                ].map(([f, free, paid], i) => (
                  <tr key={i} className="border-gold-200/8 border-t">
                    <td className="px-6 py-3 text-sm font-medium">{f}</td>
                    <td className="px-4 py-3 text-center text-sm opacity-50">{free}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gold-700">
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
