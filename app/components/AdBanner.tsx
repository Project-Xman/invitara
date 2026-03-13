import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { SafeUser } from "~/lib/auth";

interface InternalAd {
  id: string; title: string; description: string;
  ctaText: string; ctaLink: string; gradient: string; icon: string;
}

export function AdBanner({ user, slot, ad }: { user: SafeUser | null; slot: string; ad: InternalAd | null }) {
  const [dismissed, setDismissed] = useState(false);
  if (!ad || dismissed) return null;
  if (user && !user.showAds) return null;

  return (
    <div className="ad-banner p-5 mb-6 relative" style={{ background: ad.gradient }}>
      <div className="ad-label text-white/60">Ad</div>
      <button onClick={() => setDismissed(true)} className="ad-banner-dismiss text-white/60">✕</button>
      <div className="flex items-center gap-4 text-white">
        <span className="text-3xl">{ad.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-0.5">{ad.title}</h4>
          <p className="text-xs opacity-70 leading-relaxed">{ad.description}</p>
        </div>
        <Link to={ad.ctaLink} className="shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm transition-all">
          {ad.ctaText}
        </Link>
      </div>
    </div>
  );
}

// Compact inline ad (between event cards, etc.)
export function InlineAd({ user }: { user: SafeUser | null }) {
  if (user && !user.showAds) return null;
  return (
    <div className="my-4 p-3 rounded-xl bg-gold-100/40 border border-gold-200/20 flex items-center gap-3">
      <span className="text-[8px] font-semibold tracking-[1px] uppercase opacity-30">Sponsored</span>
      <p className="text-xs opacity-40 flex-1">Remove ads with any paid plan</p>
      <Link to="/pricing" className="text-[10px] font-semibold text-gold-700 hover:underline">Upgrade →</Link>
    </div>
  );
}
