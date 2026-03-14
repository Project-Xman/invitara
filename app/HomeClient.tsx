"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { templatesQueryOptions, sessionQueryOptions, plansQueryOptions } from "~/lib/queries";
import { AdBanner } from "~/components/AdBanner";

import {
  Banknote,
  UserCheck,
  MapPin,
  Edit,
  Music,
  Lock,
  Clock,
  Eye,
  Star,
  ChevronRight,
  Check,
  Plus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Hindu Weddings",
  "Christian Weddings",
  "Sikh Weddings",
  "Muslim Weddings",
  "South-Indian Weddings",
  "Save the Date",
];

const features = [
  { icon: <Banknote className="h-6 w-6 text-primary" />, t: "Affordable", d: "Cheaper than printed cards & WhatsApp invites." },
  { icon: <UserCheck className="h-6 w-6 text-primary" />, t: "Elder-Friendly", d: "Large text, clear layouts for every generation." },
  { icon: <Eye className="h-6 w-6 text-primary" />, t: "Photo Highlights", d: "Pre-wedding shoot gallery built-in." },
  { icon: <Edit className="h-6 w-6 text-primary" />, t: "Instant Edits", d: "Update anytime, even after sharing." },
  { icon: <Star className="h-6 w-6 text-primary" />, t: "Ritual-Ready", d: "Deity motifs, mantras for every tradition." },
  { icon: <Lock className="h-6 w-6 text-primary" />, t: "Private Events", d: "Separate links per event." },
  { icon: <Clock className="h-6 w-6 text-primary" />, t: "Live Countdown", d: "Builds excitement for your big day." },
  { icon: <MapPin className="h-6 w-6 text-primary" />, t: "Smart Links", d: "RSVP, maps, Instagram & WhatsApp built-in." },
  { icon: <Music className="h-6 w-6 text-primary" />, t: "Background Music", d: "Add any MP3 track." },
];

const faqs = [
  {
    q: "Do I need software to edit?",
    a: "No -- everything is browser-based, fill a form, done in 10 minutes.",
  },
  {
    q: "Why this over WhatsApp video?",
    a: "Interactive websites -- RSVP, galleries, directions, live updates.",
  },
  { q: "Can I update after sharing?", a: "Yes, changes are instant for everyone." },
  { q: "Is there an expiry?", a: "No, lifetime access once purchased." },
  { q: "Can I add music?", a: "Yes, upload any MP3 file." },
  {
    q: "How does AI design work?",
    a: "Describe your dream design, our AI generates custom color palettes and suggestions. Free with Chrome's built-in Gemini Nano, or 1 credit on server.",
  },
];

export default function HomeClient() {
  const [cat, setCat] = useState("All");
  const { data: tmpls = [] } = useQuery(templatesQueryOptions(cat));
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: plans = [] } = useQuery(plansQueryOptions());
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="animate-fade-up">
      {/* HERO */}
      <section className="bg-dots-gold relative flex min-h-screen items-center justify-center overflow-hidden pt-[68px]">
        <div className="absolute right-[-100px] top-[-100px] h-[500px] w-[500px] animate-float rounded-full bg-primary/[0.06] blur-[80px]" />
        <div className="absolute bottom-[-50px] left-[-50px] h-[400px] w-[400px] animate-float-d rounded-full bg-primary/[0.05] blur-[70px]" />
        <div className="relative z-10 max-w-[900px] px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/[0.15] bg-primary/[0.08] px-5 py-2 text-xs font-medium uppercase tracking-[1.5px] text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Now with AI Design Generation
          </div>
          <h1 className="mb-6 font-display text-5xl font-bold leading-[1.05] md:text-7xl lg:text-8xl">
            Website Templates for <span className="text-golden">Wedding Invites</span>
          </h1>
          <p className="mx-auto mb-10 max-w-[560px] font-body text-lg leading-relaxed text-muted-foreground md:text-xl">
            Easy-to-customise, effortless to share. AI-powered design. Pick a style, add your story,
            share in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/templates" className="btn-gold">
              Choose a Template
            </Link>
            <Link href="/preview" className="btn-gold-outline">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* AD */}
      {(!user || user.showAds) && (
        <div className="mx-auto mt-10 max-w-[1320px] px-6 lg:px-8">
          <AdBanner
            user={user || null}
            slot="hero_banner"
            ad={{
              id: "upgrade",
              title: "Go Premium",
              description: "Remove ads, unlock all templates, get AI credits & custom domain.",
              ctaText: "Upgrade Now",
              ctaLink: "/pricing",
              gradient: "linear-gradient(135deg,#A67C2E 0%,#D4A853 50%,#FFD466 100%)",
              icon: "",
            }}
          />
        </div>
      )}

      {/* TEMPLATES */}
      <section className="mx-auto max-w-[1320px] px-6 py-24 lg:px-8">
        <div className="mb-12 text-center">
          <p className="section-label mb-3">Templates</p>
          <h2 className="section-heading mb-3">
            Designed for your Big Day
          </h2>
        </div>
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wide transition-all ${cat === c ? "border-primary bg-primary text-primary-foreground shadow-gold" : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(tmpls as any[]).map((t: any) => (
            <Link
              key={t.id}
              href={`/editor?template=${t.id}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-gold-lg"
            >
              {t.isFree && (
                <span className="absolute right-3 top-3 z-30 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] text-white">
                  Free
                </span>
              )}
              <div className="relative h-56 overflow-hidden">
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ background: t.gradient }}
                />
                <div className="absolute inset-0 z-10 flex items-center justify-center text-white">
                  <div className="text-center">
                    <h3 className="font-script text-3xl drop-shadow-md">Preview</h3>
                    <span className="mt-1 block font-body text-[10px] uppercase tracking-[5px] opacity-60">
                      {t.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-1 text-[9px] font-semibold uppercase tracking-[2px] text-primary/60">
                  {t.category}
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <span>{t.emoji}</span>
                  <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{t.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-primary">
                    {t.isFree ? "Free" : "\u20B9" + t.price.toLocaleString("en-IN")}
                  </span>
                  <span className="btn-gold !px-4 !py-1.5 !text-[9px]">
                    Customize <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="section-label mb-3">Features</p>
            <h2 className="section-heading mb-3">
              The Wedding Invite, Reinvented
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-background p-7 transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  {f.icon}
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">{f.t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto max-w-[1320px] px-6 py-24 lg:px-8" id="pricing">
        <div className="mb-14 text-center">
          <p className="section-label mb-3">Pricing</p>
          <h2 className="section-heading mb-3">Simple, Transparent Pricing</h2>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {(plans as any[]).map((p, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-7 text-center ${p.badge ? "scale-[1.02] border-2 border-primary bg-card shadow-gold-lg" : "border border-border bg-card"}`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[1px] text-primary-foreground">
                  {p.badge}
                </div>
              )}
              <h3 className="mb-1 font-display text-xl font-bold">{p.name}</h3>
              <div className="mb-0.5 font-display text-4xl font-bold text-primary">
                {p.price === 0 ? "Free" : "\u20B9" + p.price.toLocaleString("en-IN")}
              </div>
              <p className="mb-1 text-xs text-muted-foreground">{p.price === 0 ? "forever" : "one-time"}</p>
              {p.showAds && (
                <p className="mb-3 flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-600">
                  <AlertCircle className="h-3 w-3" /> Contains Ads
                </p>
              )}
              {!p.showAds && p.price > 0 && (
                <p className="mb-3 flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> No Ads + {p.credits} AI Credits
                </p>
              )}
              <div className="mb-6 space-y-2 text-left">
                {(p.features as string[]).map((f: string, j: number) => (
                  <div key={j} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 font-bold text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href={p.id === "free" ? "/auth/register" : "/pricing"}
                className={p.badge ? "btn-gold w-full" : "btn-gold-outline w-full"}
              >
                {p.id === "free" ? "Get Started Free" : "Choose Plan"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-14 text-center">
            <h2 className="section-heading">Questions? Answers.</h2>
          </div>
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-border">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="group flex w-full items-center justify-between py-5 text-left"
              >
                <span className="pr-4 text-sm font-medium group-hover:text-primary">{f.q}</span>
                <span
                  className={`shrink-0 transition-transform ${openFaq === i ? "rotate-45" : ""}`}
                >
                  <Plus className="h-4 w-4 text-primary" />
                </span>
              </button>
              <div
                className={`overflow-hidden text-sm leading-relaxed text-muted-foreground transition-all ${openFaq === i ? "max-h-40 pb-5" : "max-h-0"}`}
              >
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground px-6 py-16 text-background">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <div className="mb-3 font-script text-3xl text-primary">Invitara</div>
            <p className="text-sm leading-relaxed opacity-50">
              Beautiful, AI-powered wedding invitation websites. Inter font, golden wedding theme.
            </p>
          </div>
          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[2px] opacity-40">
              Product
            </h4>
            {["Templates", "Features", "Pricing", "AI Design", "Demo"].map((l) => (
              <p
                key={l}
                className="mb-3 cursor-pointer text-sm opacity-55 transition-opacity hover:opacity-100"
              >
                {l}
              </p>
            ))}
          </div>
          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[2px] opacity-40">
              Support
            </h4>
            {["Contact Us", "Privacy Policy", "Terms", "Refund Policy"].map((l) => (
              <p
                key={l}
                className="mb-3 cursor-pointer text-sm opacity-55 transition-opacity hover:opacity-100"
              >
                {l}
              </p>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-[1320px] border-t border-background/10 pt-8 text-center text-xs opacity-25">
          {'\u00A9'} 2026 Invitara. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
