"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  templatesQueryOptions,
  sessionQueryOptions,
  myTemplatesQueryOptions,
  useCreateOrder,
  useBuyTemplate,
} from "~/lib/queries";
import { VirtualTemplateGrid } from "~/components/VirtualTemplateGrid";
import { openRazorpayCheckout } from "~/lib/razorpay";

const CATS = [
  "All",
  "Hindu Weddings",
  "Christian Weddings",
  "Sikh Weddings",
  "Muslim Weddings",
  "South-Indian Weddings",
  "Save the Date",
];

export default function TemplatesClient() {
  const [cat, setCat] = useState("All");
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: tmpls = [], isLoading, isError } = useQuery(templatesQueryOptions(cat));
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: myTemplates = [] } = useQuery({ ...myTemplatesQueryOptions(), enabled: !!user });
  const createOrder = useCreateOrder();
  const buyTemplate = useBuyTemplate();
  const router = useRouter();

  const ownedIds = (myTemplates as any[])
    .filter((t: any) => t.owned)
    .map((t: any) => t.id as string);

  const handleSelect = async (t: any) => {
    setError(null);

    if (t.isFree || ownedIds.includes(t.id)) {
      router.push(`/editor?template=${t.id}`);
      return;
    }

    if (!user) {
      router.push("/auth/register");
      return;
    }

    setBuyingId(t.id);
    try {
      const order = await createOrder.mutateAsync({ type: "template", templateId: t.id });
      const result = await openRazorpayCheckout({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        description: order.description,
        keyId: order.keyId,
        prefill: { name: user.name, email: user.email },
      });
      await buyTemplate.mutateAsync({
        templateId: t.id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpayOrderId: result.razorpay_order_id,
        razorpaySignature: result.razorpay_signature,
      });
      router.push(`/editor?template=${t.id}`);
    } catch (err: any) {
      if (err?.message !== "Payment cancelled") {
        setError(err?.message ?? "Payment failed. Please try again.");
      }
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-[68px]">
      <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8">
        <div className="mb-12 animate-fade-up text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[3px] text-gold-600/70">
            All Templates
          </p>
          <h1 className="mb-3 font-display text-4xl font-bold md:text-5xl">
            Choose Your <span className="text-golden">Perfect Design</span>
          </h1>
          <p className="font-body text-lg text-cream-800/50">
            {(tmpls as any[]).length} handcrafted templates
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200/40 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
            <button onClick={() => setError(null)} className="ml-3 text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 ${cat === c ? "border-gold-700 bg-gold-700 text-white shadow-gold" : "border-gold-200/25 bg-white text-cream-800/50 hover:border-gold-400"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
          </div>
        ) : isError ? (
          <div className="py-24 text-center">
            <p className="mb-2 font-medium text-red-500">Failed to load templates</p>
            <p className="text-sm text-cream-800/40">
              Please check your database connection and try again.
            </p>
          </div>
        ) : (tmpls as any[]).length === 0 ? (
          <div className="py-24 text-center">
            <p className="mb-2 font-medium text-cream-800/50">
              No templates found{cat !== "All" ? ` in "${cat}"` : ""}
            </p>
            <p className="text-sm text-cream-800/30">
              Try selecting a different category or run{" "}
              <code className="rounded bg-cream-200 px-1.5 py-0.5 text-xs">bun run db:seed</code> to
              populate templates.
            </p>
          </div>
        ) : (
          <VirtualTemplateGrid
            templates={tmpls}
            onSelect={handleSelect}
            columns={3}
            ownedIds={ownedIds}
            buyingId={buyingId}
          />
        )}
      </div>
    </div>
  );
}
