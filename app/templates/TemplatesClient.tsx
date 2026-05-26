"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { toast } from "sonner";
import {
  templatesQueryOptions,
  sessionQueryOptions,
  myTemplatesQueryOptions,
  useCreateOrder,
  useBuyTemplate,
} from "~/lib/queries";
import { VirtualTemplateGrid } from "~/components/VirtualTemplateGrid";
import { openRazorpayCheckout } from "~/lib/razorpay";
import { Spotlight } from "~/components/marketing/Spotlight";
import { SectionEyebrow } from "~/components/marketing/SectionEyebrow";
import { RevealOnScroll } from "~/components/marketing/RevealOnScroll";
import { Hairline } from "~/components/marketing/Hairline";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const CATS = [
  "All",
  "Hindu Weddings",
  "Christian Weddings",
  "Sikh Weddings",
  "Muslim Weddings",
  "South-Indian Weddings",
  "Save the Date",
];

const SORTS = ["Latest", "Price ↑", "Popular"];

export default function TemplatesClient() {
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("Latest");
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: tmpls = [], isLoading, isError } = useQuery(templatesQueryOptions(cat));
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: myTemplates = [] } = useQuery({ ...myTemplatesQueryOptions(), enabled: !!user });
  const createOrder = useCreateOrder();
  const buyTemplate = useBuyTemplate();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  const ownedIds = (myTemplates as Array<{ id: string; owned?: boolean }>)
    .filter((t) => t.owned)
    .map((t) => t.id);

  const handleSelect = async (t: {
    id: string;
    isFree?: boolean;
    price: number;
    name: string;
  }) => {
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
      toast.success(`Unlocked: ${t.name}`);
      router.push(`/editor?template=${t.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed. Please try again.";
      if (msg !== "Payment cancelled") setError(msg);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-[100px] pb-16">
        <Spotlight origin="top" intensity={0.12} />
        <div className="relative z-10 mx-auto max-w-[1320px] px-6 lg:px-8">
          <RevealOnScroll variant="fadeUp">
            <SectionEyebrow number="01" label="The Collection" className="mb-5" />
          </RevealOnScroll>
          <RevealOnScroll variant="mask" duration={0.9} delay={0.08}>
            <h1 className="section-headline max-w-3xl">
              Stories, told <span className="italic text-shimmer">beautifully.</span>
            </h1>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.25}>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              {(tmpls as unknown[]).length} handcrafted designs · new additions each season.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <Hairline />

      <div className="mx-auto max-w-[1320px] px-6 py-10 lg:px-8">
        {/* ── Filter strip ────────────────────────────── */}
        <RevealOnScroll variant="fadeUp">
          <LayoutGroup id="cat-filter">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-1 pb-3">
                {CATS.map((c) => {
                  const active = cat === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={
                        "relative inline-flex items-center px-4 py-2 text-[11px] font-medium uppercase transition-colors duration-300 " +
                        (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
                      }
                      style={{ letterSpacing: "0.18em" }}
                    >
                      {c}
                      {active && (
                        <motion.span
                          layoutId="filter-indicator"
                          className="absolute -bottom-0.5 left-3 right-3 h-px bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </LayoutGroup>
        </RevealOnScroll>

        {/* Sort row */}
        <div className="mt-3 flex items-center gap-4 border-t border-white/[0.04] pt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>Sort by</span>
          <div className="flex gap-3">
            {SORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={
                  "transition-colors " +
                  (sort === s ? "text-primary" : "hover:text-foreground")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ────────────────────────────────────── */}
        <div className="mt-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  Loading the collection
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="py-24 text-center">
              <p className="font-display italic text-2xl font-light text-destructive">
                Failed to load templates
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Please check your database connection and try again.
              </p>
            </div>
          ) : (tmpls as unknown[]).length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display italic text-2xl font-light text-muted-foreground">
                No templates found{cat !== "All" ? ` in "${cat}"` : ""}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Try a different category, or run{" "}
                <code className="rounded-md bg-accent px-2 py-0.5 text-xs font-mono text-foreground">
                  bun run db:seed
                </code>{" "}
                to populate templates.
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
    </div>
  );
}
