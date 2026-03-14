import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SafeUser } from "~/lib/auth";
import * as actions from "~/lib/actions";

interface InternalAd {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
  icon: string;
}

export function AdBanner({
  user,
  slot,
  ad,
}: {
  user: SafeUser | null;
  slot: string;
  ad: InternalAd | null;
}) {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  if (!ad || dismissed) return null;
  if (user && !user.showAds) return null;

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Fire-and-forget click tracking; don't block navigation on it
    actions.recordAdClick({ adSlot: slot, adId: ad.id }).catch(() => {});
    router.push(ad.ctaLink);
  };

  return (
    <div className="ad-banner relative mb-6 p-5" style={{ background: ad.gradient }}>
      <div className="ad-label text-white/60">Ad</div>
      <button onClick={() => setDismissed(true)} className="ad-banner-dismiss text-white/60">
        ✕
      </button>
      <div className="flex items-center gap-4 text-white">
        <span className="text-3xl">{ad.icon}</span>
        <div className="min-w-0 flex-1">
          <h4 className="mb-0.5 text-sm font-semibold">{ad.title}</h4>
          <p className="text-xs leading-relaxed opacity-70">{ad.description}</p>
        </div>
        <button
          onClick={handleCtaClick}
          className="shrink-0 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur-sm transition-all hover:bg-white/30"
        >
          {ad.ctaText}
        </button>
      </div>
    </div>
  );
}

// Compact inline ad (between event cards, etc.)
export function InlineAd({ user }: { user: SafeUser | null }) {
  if (user && !user.showAds) return null;
  return (
    <div className="my-4 flex items-center gap-3 rounded-xl border border-gold-200/20 bg-gold-100/40 p-3">
      <span className="text-[8px] font-semibold uppercase tracking-[1px] opacity-30">
        Sponsored
      </span>
      <p className="flex-1 text-xs opacity-40">Remove ads with any paid plan</p>
      <Link href="/pricing" className="text-[10px] font-semibold text-gold-700 hover:underline">
        Upgrade →
      </Link>
    </div>
  );
}
