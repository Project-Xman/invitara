"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  templatesQueryOptions,
  sessionQueryOptions,
  plansQueryOptions,
  adQueryOptions,
} from "~/lib/queries";
import { AdBanner } from "~/components/AdBanner";
import { Spotlight } from "~/components/marketing/Spotlight";
import { Hairline } from "~/components/marketing/Hairline";
import { SectionEyebrow } from "~/components/marketing/SectionEyebrow";
import { RevealOnScroll } from "~/components/marketing/RevealOnScroll";
import { Marquee } from "~/components/marketing/Marquee";
import { SpotlightCard } from "~/components/marketing/SpotlightCard";
import { Bento, BentoItem } from "~/components/marketing/Bento";
import { StatStrip } from "~/components/marketing/StatStrip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  ArrowRight,
  Banknote,
  Check,
  Clock,
  Edit3,
  Eye,
  Lock,
  MapPin,
  Music,
  Star,
  UserCheck,
} from "lucide-react";

const HERO_PREVIEWS = [
  {
    gradient: "linear-gradient(135deg,#0A1A2E 0%,#1E3A5F 35%,#2D5F8A 65%,#F5C518 100%)",
    label: "Royal",
    name: "Midnight Vow",
  },
  {
    gradient: "linear-gradient(180deg,#1A1A1A 0%,#2C2218 40%,#4A3520 70%,#D4A853 100%)",
    label: "Editorial",
    name: "City Royale",
  },
  {
    gradient: "linear-gradient(135deg,#1A0A2E 0%,#4A1942 30%,#C8397E 65%,#FFD4E8 100%)",
    label: "Romance",
    name: "Rose Petal",
  },
];

const CATEGORIES = [
  "All",
  "Hindu Weddings",
  "Christian Weddings",
  "Sikh Weddings",
  "Muslim Weddings",
  "South-Indian Weddings",
  "Save the Date",
];

const FEATURES_BENTO: Array<{
  size: "large" | "medium" | "small";
  icon: React.ReactNode;
  t: string;
  d: string;
}> = [
  {
    size: "large",
    icon: <Edit3 className="h-5 w-5" />,
    t: "Instant edits",
    d: "Change a date, add a venue, swap a song — every guest sees it the moment you save. No reprints. No reshares.",
  },
  {
    size: "medium",
    icon: <Eye className="h-5 w-5" />,
    t: "Photo highlights",
    d: "Pre-wedding shoots, built into every invitation.",
  },
  {
    size: "medium",
    icon: <Music className="h-5 w-5" />,
    t: "Music",
    d: "Background score on autoplay. Any MP3.",
  },
  {
    size: "small",
    icon: <Banknote className="h-4 w-4" />,
    t: "Affordable",
    d: "Less than printed cards.",
  },
  {
    size: "small",
    icon: <UserCheck className="h-4 w-4" />,
    t: "Elder-ready",
    d: "Generous typography.",
  },
  {
    size: "small",
    icon: <Clock className="h-4 w-4" />,
    t: "Live countdown",
    d: "To the moment itself.",
  },
  {
    size: "small",
    icon: <MapPin className="h-4 w-4" />,
    t: "Smart links",
    d: "RSVP, maps, socials.",
  },
];

const FEATURES_SIDE = [
  { icon: <Star className="h-4 w-4" />, t: "Ritual-aware", d: "Motifs for every tradition." },
  { icon: <Lock className="h-4 w-4" />, t: "Private events", d: "Separate links per event." },
];

const FAQS = [
  { q: "Do I need software to edit?", a: "No. Everything is browser-based. A form, a few photos, ten minutes — done." },
  { q: "Why this over a WhatsApp video?", a: "An interactive site: RSVP, galleries, directions, live updates. A video can't reply to questions." },
  { q: "Can I update after sharing?", a: "Yes. Changes are instant for everyone who has the link." },
  { q: "Is there an expiry?", a: "No. Lifetime access once purchased." },
  { q: "Can I add music?", a: "Any MP3 you upload becomes the score." },
  { q: "How does AI design work?", a: "Describe your dream. Our AI generates a palette and suggestions. Free with on-device Gemini Nano in Chrome, or 1 credit on server." },
];

const STATS = [
  { v: "500+", l: "Couples" },
  { v: "11", l: "Templates" },
  { v: "100%", l: "Browser-based" },
  { v: "₹0", l: "Start free" },
];

export default function HomeClient() {
  const [cat, setCat] = useState("All");
  const { data: tmpls = [] } = useQuery(templatesQueryOptions(cat));
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: plans = [] } = useQuery(plansQueryOptions());
  const { data: heroAd } = useQuery(adQueryOptions("hero_banner"));

  const templatesList = (
    tmpls as Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      gradient: string;
      isFree: boolean;
      price: number;
    }>
  ).slice(0, 6);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative isolate min-h-[92vh] overflow-hidden pt-[76px]">
        <Spotlight origin="top" intensity={0.14} />

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-76px)] max-w-[1320px] flex-col items-center gap-16 px-6 py-16 lg:flex-row lg:gap-20 lg:px-8 lg:py-20">
          {/* Left: editorial headline */}
          <div className="flex-1 max-w-3xl">
            <RevealOnScroll variant="mask" duration={0.8}>
              <SectionEyebrow number="00" label="Invitations, reimagined" className="mb-8" />
            </RevealOnScroll>

            <RevealOnScroll variant="mask" duration={1.0} delay={0.08} as="h1">
              <span className="block font-display font-light leading-[0.92]" style={{ letterSpacing: "-0.03em" }}>
                <span className="block text-[clamp(3rem,9vw,7rem)]">Love,</span>
                <span className="block text-[clamp(3rem,9vw,7rem)] italic text-shimmer">in motion.</span>
              </span>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.3}>
              <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                A wedding invitation should feel like the moment itself — cinematic, alive,
                unmistakably yours.
              </p>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.45}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/templates" className="btn-primary">
                  Begin your story <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/preview" className="btn-ghost">
                  Watch the film
                </Link>
              </div>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.6}>
              <div className="mt-16">
                <StatStrip stats={STATS} />
              </div>
            </RevealOnScroll>
          </div>

          {/* Right: stacked phone-frame previews */}
          <div className="hidden lg:flex w-[320px] flex-shrink-0 flex-col gap-4">
            {HERO_PREVIEWS.map((p, i) => (
              <RevealOnScroll key={p.name} variant="slideRight" delay={0.3 + i * 0.12}>
                <div
                  className="card-premium relative overflow-hidden"
                  style={{ height: "200px" }}
                >
                  <div className="absolute inset-0" style={{ background: p.gradient }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between">
                    <div>
                      <div className="text-[8px] font-medium uppercase tracking-[0.35em] text-white/60">
                        {p.label}
                      </div>
                      <div className="mt-1 font-display italic text-xl text-white">{p.name}</div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────── */}
      <Hairline />
      <Marquee speed={45} className="py-6 border-y border-white/[0.04]">
        {[...templatesList, ...templatesList].map((t, i) => (
          <span
            key={`${t.id}-${i}`}
            className="mx-12 inline-flex items-center gap-4 font-display italic text-2xl font-light text-muted-foreground"
          >
            {t.name}
            <span className="h-1 w-1 rounded-full bg-primary/40" />
          </span>
        ))}
      </Marquee>
      <Hairline />

      {/* ── AD ───────────────────────────────────────────── */}
      {(!user || user.showAds) && heroAd && (
        <div className="mx-auto mt-12 max-w-[1320px] px-6 lg:px-8">
          <AdBanner user={user || null} slot="hero_banner" ad={heroAd} />
        </div>
      )}

      {/* ── TEMPLATES ────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1320px] px-6 py-28 lg:px-8">
        <RevealOnScroll variant="fadeUp" className="mb-14 max-w-2xl">
          <SectionEyebrow number="01" label="The Collection" className="mb-5" />
          <h2 className="section-headline">Stories, told beautifully.</h2>
          <p className="mt-5 text-base text-muted-foreground">
            {(tmpls as unknown[]).length} handcrafted templates · new designs added each season.
          </p>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.15}>
          <div className="mb-12 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={
                  "rounded-full border px-4 py-2 text-[11px] font-medium uppercase transition-all duration-300 " +
                  (cat === c
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
                style={{ letterSpacing: "0.12em" }}
              >
                {c}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templatesList.map((t, i) => (
            <RevealOnScroll key={t.id} variant="fadeUp" delay={Math.min(i * 0.06, 0.36)}>
              <SpotlightCard className="card-premium relative overflow-hidden rounded-2xl">
                <Link href={`/editor?template=${t.id}`} className="block">
                  {t.isFree && (
                    <span className="absolute right-4 top-4 z-30 rounded-full border border-primary/40 bg-background/60 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.25em] text-primary backdrop-blur">
                      Free
                    </span>
                  )}
                  <div className="relative h-60 overflow-hidden">
                    <div
                      className="absolute inset-0 transition-transform duration-700 group-hover/spot:scale-[1.04]"
                      style={{ background: t.gradient }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  </div>
                  <div className="relative z-10 p-6">
                    <div className="text-[9px] font-medium uppercase tracking-[0.4em] text-primary/70">
                      {t.category}
                    </div>
                    <h3 className="mt-2 font-display italic text-2xl font-light">{t.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-display text-xl text-foreground">
                        {t.isFree ? "Free" : "₹" + t.price.toLocaleString("en-IN")}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-primary transition-all group-hover/spot:gap-2.5">
                        Customise <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </SpotlightCard>
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/templates" className="btn-outline-premium">
            Browse the Collection <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <Hairline />

      {/* ── FEATURES BENTO ───────────────────────────────── */}
      <section className="mx-auto max-w-[1320px] px-6 py-28 lg:px-8">
        <RevealOnScroll variant="fadeUp" className="mb-14 max-w-2xl">
          <SectionEyebrow number="02" label="The Craft" className="mb-5" />
          <h2 className="section-headline">Everything you need, nothing you don&apos;t.</h2>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.1}>
          <Bento>
            {FEATURES_BENTO.map((f, i) => (
              <BentoItem key={i} size={f.size}>
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary">
                    {f.icon}
                  </div>
                  <h3
                    className={
                      f.size === "large"
                        ? "font-display text-3xl font-light"
                        : f.size === "medium"
                        ? "font-display text-xl font-light"
                        : "font-display text-base font-light"
                    }
                  >
                    {f.t}
                  </h3>
                  <p
                    className={
                      "mt-2 text-muted-foreground " +
                      (f.size === "small" ? "text-xs" : "text-sm leading-relaxed")
                    }
                  >
                    {f.d}
                  </p>
                </div>
              </BentoItem>
            ))}
          </Bento>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.2}>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {FEATURES_SIDE.map((f, i) => (
              <div key={i} className="card-premium p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl font-light">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <Hairline />

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-[1320px] px-6 py-28 lg:px-8">
        <RevealOnScroll variant="fadeUp" className="mb-14 max-w-2xl">
          <SectionEyebrow number="03" label="Pricing" className="mb-5" />
          <h2 className="section-headline">One purchase. Lifetime access.</h2>
          <p className="mt-5 text-base text-muted-foreground">
            No subscriptions. No hidden cost. Pick a plan, share forever.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {(
            plans as Array<{
              id: string;
              name: string;
              price: number;
              credits: number;
              showAds: boolean;
              features: string[];
              badge?: string;
            }>
          ).map((p, i) => {
            const featured = !!p.badge;
            return (
              <RevealOnScroll key={p.id} variant="fadeUp" delay={i * 0.08}>
                <div
                  className={
                    "relative h-full rounded-2xl border bg-card p-7 transition-all duration-500 " +
                    (featured
                      ? "border-primary/50 shadow-glow-champagne-lg"
                      : "border-white/[0.06] shadow-elevation-2 hover:-translate-y-1 hover:shadow-elevation-3")
                  }
                >
                  {featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[9px] font-medium uppercase tracking-[0.25em] text-primary-foreground">
                      {p.badge}
                    </div>
                  )}
                  <h3 className="font-display italic text-xl font-light">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
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

                  <ul className="mt-6 space-y-3 text-left">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={p.id === "free" ? "/auth/register" : "/pricing"}
                    className={
                      "mt-8 inline-flex w-full justify-center " +
                      (featured ? "btn-primary" : "btn-outline-premium")
                    }
                  >
                    {p.id === "free" ? "Get Started Free" : "Choose Plan"}
                  </Link>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      <Hairline />

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-28 lg:px-8">
        <RevealOnScroll variant="fadeUp" className="mb-12 text-center">
          <SectionEyebrow number="04" label="Questions" className="mb-5 justify-center" />
          <h2 className="section-headline">Answers.</h2>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b border-white/[0.06] last:border-none"
              >
                <AccordionTrigger className="py-6 font-display text-xl font-light italic hover:no-underline">
                  <span className="mr-4 text-sm not-italic text-primary/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </RevealOnScroll>
      </section>
    </div>
  );
}
