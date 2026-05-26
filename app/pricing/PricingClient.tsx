"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Crown,
  Flower,
  Gem,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  plansQueryOptions,
  sessionQueryOptions,
  useCreateOrder,
  usePurchasePlan,
} from "~/lib/queries";
import { openRazorpayCheckout } from "~/lib/razorpay";
import { Spotlight } from "~/components/marketing/Spotlight";
import { SectionEyebrow } from "~/components/marketing/SectionEyebrow";
import { RevealOnScroll } from "~/components/marketing/RevealOnScroll";
import { Testimonial } from "~/components/marketing/Testimonial";
import { Hairline } from "~/components/marketing/Hairline";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const TIER_ICONS: Record<string, React.ReactNode> = {
  free: <Flower className="h-5 w-5" strokeWidth={1.4} />,
  starter: <Sparkles className="h-5 w-5" strokeWidth={1.4} />,
  premium: <Gem className="h-5 w-5" strokeWidth={1.4} />,
  royal: <Crown className="h-5 w-5" strokeWidth={1.4} />,
};

const COMPARISON: Array<[string, string, string]> = [
  ["Templates", "2 Free", "All / Purchase Individual"],
  ["Events", "Up to 2", "Unlimited"],
  ["Ads", "Yes, shown", "No ads"],
  ["AI Credits", "3 on signup", "5–50 bonus"],
  ["RSVP Dashboard", "Basic", "Full + Analytics"],
  ["Custom Domain", "—", "Included"],
  ["Background Music", "—", "Included"],
  ["Priority Support", "—", "Included"],
];

export default function PricingClient() {
  const { data: plans = [] } = useQuery(plansQueryOptions());
  const { data: user } = useQuery(sessionQueryOptions());
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const purchasePlan = usePurchasePlan();

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

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
      toast.success(`Welcome to ${planId}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed. Please try again.";
      if (msg !== "Payment cancelled") setError(msg);
    } finally {
      setBuyingPlan(null);
    }
  };

  type Plan = {
    id: string;
    name: string;
    price: number;
    credits: number;
    showAds: boolean;
    features: string[];
    badge?: string;
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-[100px] pb-16">
        <Spotlight origin="top" intensity={0.12} />
        <div className="relative z-10 mx-auto max-w-[1320px] px-6 lg:px-8">
          <RevealOnScroll variant="fadeUp">
            <SectionEyebrow number="03" label="Pricing" className="mb-5" />
          </RevealOnScroll>
          <RevealOnScroll variant="mask" duration={0.9} delay={0.08}>
            <h1 className="section-headline max-w-3xl">
              One purchase. <span className="italic text-shimmer">Lifetime access.</span>
            </h1>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.25}>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              No subscriptions, no hidden costs. Start free, upgrade when you&apos;re ready.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <Hairline />

      <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8">
        {/* ── Plan cards ─────────────────────────────── */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {(plans as Plan[]).map((p, i) => {
            const isActive = user?.plan === p.id;
            const isLoading = buyingPlan === p.id;
            const isFeatured = !!p.badge;
            return (
              <RevealOnScroll key={p.id} variant="fadeUp" delay={i * 0.08}>
                <div
                  className={
                    "relative flex h-full flex-col rounded-2xl border bg-card p-7 transition-all duration-500 " +
                    (isFeatured
                      ? "border-primary/50 shadow-glow-champagne-lg"
                      : "border-white/[0.06] shadow-elevation-2 hover:-translate-y-1 hover:shadow-elevation-3")
                  }
                >
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[9px] font-medium uppercase tracking-[0.25em] text-primary-foreground">
                      {p.badge}
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-background/80 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.25em] text-primary backdrop-blur">
                      <CheckCircle2 className="h-3 w-3" /> Current
                    </div>
                  )}

                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 text-primary">
                      {TIER_ICONS[p.id] ?? <Sparkles className="h-5 w-5" />}
                    </div>
                    <h3 className="font-display italic text-xl font-light">{p.name}</h3>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-light text-foreground">
                      {p.price === 0 ? "Free" : "₹" + p.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {p.price === 0 ? "forever" : "once"}
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] uppercase tracking-[0.3em]">
                    {p.showAds ? (
                      <span className="text-amber-500/80">Contains ads</span>
                    ) : p.price > 0 ? (
                      <span className="text-primary/80">No ads · {p.credits} AI credits</span>
                    ) : (
                      <span className="text-muted-foreground">&nbsp;</span>
                    )}
                  </div>

                  <div className="mt-6 hairline" />

                  <ul className="mt-6 flex-1 space-y-3">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isActive ? (
                      <button
                        disabled
                        className="w-full rounded-full border border-border/40 py-3 text-[11px] font-medium uppercase text-muted-foreground"
                        style={{ letterSpacing: "0.12em" }}
                      >
                        Current Plan
                      </button>
                    ) : p.id === "free" ? (
                      <Link
                        href={user ? "/dashboard" : "/auth/register"}
                        className="btn-outline-premium w-full justify-center"
                      >
                        Get Started Free
                      </Link>
                    ) : user ? (
                      <button
                        onClick={() => handleUpgrade(p.id)}
                        disabled={isLoading || buyingPlan !== null}
                        className={
                          "w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 " +
                          (isFeatured ? "btn-primary" : "btn-outline-premium")
                        }
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                          </span>
                        ) : (
                          `Choose ${p.name}`
                        )}
                      </button>
                    ) : (
                      <Link
                        href="/auth/register"
                        className={
                          "w-full justify-center " +
                          (isFeatured ? "btn-primary" : "btn-outline-premium")
                        }
                      >
                        Choose {p.name}
                      </Link>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* ── Testimonial ────────────────────────────── */}
        <div className="my-24">
          <RevealOnScroll variant="fadeUp">
            <Testimonial
              quote="The invitation became part of the wedding itself. Guests still talk about it."
              author="Aanya & Vihaan"
              context="December 2024 · Jaipur"
            />
          </RevealOnScroll>
        </div>

        <Hairline />

        {/* ── Comparison table ───────────────────────── */}
        <div className="mx-auto mt-20 max-w-3xl">
          <RevealOnScroll variant="fadeUp" className="mb-10 text-center">
            <SectionEyebrow number="04" label="Compared" className="mb-5 justify-center" />
            <h2 className="font-display text-4xl font-light tracking-[-0.01em]">
              Free vs Paid <span className="italic text-shimmer">at a glance.</span>
            </h2>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <div className="card-premium overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Feature
                    </TableHead>
                    <TableHead className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Free
                    </TableHead>
                    <TableHead className="text-center text-[10px] uppercase tracking-[0.3em] text-primary">
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> Paid
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPARISON.map(([f, free, paid], i) => (
                    <TableRow key={i} className="border-b border-white/[0.04] last:border-none">
                      <TableCell className="text-sm font-medium text-foreground">{f}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {free}
                      </TableCell>
                      <TableCell className="text-center text-sm text-primary/90">{paid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
