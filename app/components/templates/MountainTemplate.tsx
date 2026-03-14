import { useCountdown, useFormattedDate } from "./shared/hooks";
import { SectionReveal } from "./shared/SectionReveal";
import type { TemplateProps } from "./shared/types";
import { PhotoGallery } from "./shared/PhotoGallery";

export default function MountainTemplate({
  invitation: inv,
  events,
  template: t,
  fullWidth,
}: TemplateProps) {
  const tc = t.colors;
  const cd = useCountdown(inv.weddingDate);
  const dateStr = useFormattedDate(inv.weddingDate);

  return (
    <div
      className={fullWidth ? "w-full" : ""}
      style={{ background: tc.bg, fontFamily: "'Cormorant Garamond', serif" }}
    >
      {/* Hero - Layered mountain silhouettes */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Sky gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1A3325 0%, #2D5A3E 30%, #5A8A6A 60%, #A8C8A0 80%, #D4C8A0 100%)",
          }}
        />
        {/* Stars */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 20% 15%, white 50%, transparent 100%), radial-gradient(1px 1px at 60% 25%, white 50%, transparent 100%), radial-gradient(1px 1px at 80% 10%, white 50%, transparent 100%), radial-gradient(1.5px 1.5px at 40% 20%, white 50%, transparent 100%), radial-gradient(1px 1px at 10% 30%, white 50%, transparent 100%), radial-gradient(1px 1px at 90% 18%, white 50%, transparent 100%)",
          }}
        />
        {/* Mountain layers */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[200px]"
          style={{
            background: "#1A3325",
            clipPath:
              "polygon(0% 65%, 8% 45%, 15% 55%, 22% 30%, 30% 50%, 38% 25%, 42% 35%, 50% 15%, 58% 35%, 62% 25%, 70% 50%, 78% 30%, 85% 55%, 92% 40%, 100% 60%, 100% 100%, 0% 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[160px]"
          style={{
            background: "#2D5A3E",
            clipPath:
              "polygon(0% 55%, 10% 45%, 18% 55%, 25% 40%, 35% 55%, 45% 35%, 50% 45%, 55% 35%, 65% 50%, 75% 40%, 82% 55%, 90% 45%, 100% 55%, 100% 100%, 0% 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[80px]"
          style={{
            background: tc.bg,
            clipPath:
              "polygon(0% 50%, 15% 40%, 30% 55%, 45% 35%, 55% 45%, 70% 35%, 85% 50%, 100% 40%, 100% 100%, 0% 100%)",
          }}
        />
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center text-white">
          <p className="mb-4 font-sans text-[10px] font-medium uppercase tracking-[6px] opacity-50 md:text-xs">
            You're Cordially Invited
          </p>
          <div className="mb-4 text-3xl">🌲</div>
          <h1 className="font-script text-[48px] leading-none drop-shadow-lg md:text-[72px] lg:text-[96px]">{inv.groomName}</h1>
          <div className="my-3 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-white/25 md:w-24" />
            <span className="font-display text-sm uppercase tracking-[6px] opacity-70 md:text-base">Weds</span>
            <span className="h-px w-12 bg-white/25 md:w-24" />
          </div>
          <h1 className="font-script text-[48px] leading-none drop-shadow-lg md:text-[72px] lg:text-[96px]">{inv.brideName}</h1>
          <div className="mt-8 border-t border-white/15 pt-5">
            <p className="font-sans text-xs uppercase tracking-[3px] opacity-50 md:text-sm">{dateStr}</p>
            <p className="mt-1 font-sans text-[10px] uppercase tracking-[2px] opacity-30 md:text-xs">
              {inv.venue || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Blessings */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-lg md:text-xl" style={{ color: tc.secondary }}>
            {inv.mantra ||
              "\u0950 \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903"}
          </p>
          <div className="mb-4 text-3xl">🍃</div>
          <p className="font-sans text-sm opacity-50 md:text-base" style={{ color: tc.text }}>
            With the blessings of
          </p>
          <p className="mt-2 font-display text-lg font-semibold md:text-xl" style={{ color: tc.primary }}>
            {inv.blessingFrom || ""}
          </p>
          <div className="my-6 flex items-center justify-center gap-4">
            <TreeDivider color={tc.primary} />
            <span
              className="font-sans text-[10px] font-semibold uppercase tracking-[5px]"
              style={{ color: tc.secondary }}
            >
              INVITE
            </span>
            <TreeDivider color={tc.primary} />
          </div>
          <p className="font-sans text-sm opacity-45" style={{ color: tc.text }}>
            You to the wedding celebration of
          </p>
          <p className="mt-3 font-display text-2xl font-bold md:text-3xl" style={{ color: tc.primary }}>
            {inv.groomName} <span className="opacity-30">&</span> {inv.brideName}
          </p>
          {inv.groomFamily && (
            <p className="mt-4 font-sans text-xs opacity-40 md:text-sm" style={{ color: tc.text }}>
              Son of {inv.groomFamily}
            </p>
          )}
          {inv.brideFamily && (
            <p className="mt-1 font-sans text-xs opacity-40 md:text-sm" style={{ color: tc.text }}>
              Daughter of {inv.brideFamily}
            </p>
          )}
          </div>
        </div>
      </SectionReveal>

      {/* Earthy divider */}
      <div
        className="h-3"
        style={{
          background: `repeating-linear-gradient(90deg, ${tc.primary}15 0px, ${tc.primary}15 8px, ${tc.accent} 8px, ${tc.accent} 16px)`,
        }}
      />

      {/* Events */}
      <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
        <SectionReveal>
          <h2
            className="mb-1 text-center font-display text-2xl font-bold md:text-3xl lg:text-4xl"
            style={{ color: tc.primary }}
          >
            Celebrations
          </h2>
          <p className="mb-8 text-center font-sans text-sm opacity-40 md:text-base" style={{ color: tc.text }}>
            Nature's blessing on our journey
          </p>
        </SectionReveal>
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {events.map((ev, i) => (
            <SectionReveal key={ev.id} animation="scaleIn" delay={i * 100}>
              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: tc.primary + "12", background: tc.card }}
              >
                <div className="flex items-center gap-3.5 p-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${ev.color}15, ${ev.color}08)`,
                      border: `1px solid ${ev.color}20`,
                    }}
                  >
                    {ev.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold" style={{ color: tc.text }}>
                      {ev.name}
                    </h3>
                    <p
                      className="mt-0.5 font-sans text-[11px] opacity-40"
                      style={{ color: tc.text }}
                    >
                      \uD83D\uDCC5 {ev.date} \u00B7 \uD83D\uDD50 {ev.time}
                    </p>
                    <p className="font-sans text-[11px] opacity-40" style={{ color: tc.text }}>
                      \uD83D\uDCCD {ev.venue}
                    </p>
                  </div>
                </div>
                <div
                  className="py-2.5 text-center font-sans text-[10px] font-semibold uppercase tracking-[1.5px]"
                  style={{
                    color: ev.color,
                    borderTop: `1px solid ${ev.color}0D`,
                    background: ev.color + "05",
                  }}
                >
                  \uD83D\uDCCD See the Route
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>

      <div
        className="h-3"
        style={{
          background: `repeating-linear-gradient(90deg, ${tc.primary}15 0px, ${tc.primary}15 8px, ${tc.accent} 8px, ${tc.accent} 16px)`,
        }}
      />

      {/* Message */}
      {inv.message && (
        <SectionReveal>
          <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[5px] md:text-xs"
                style={{ color: tc.secondary }}
              >
                From Our Hearts
              </p>
              <p
                className="mx-auto max-w-xl text-base italic leading-[2] opacity-50 md:text-lg"
                style={{ color: tc.text }}
              >
                {inv.message}
              </p>
            </div>
          </div>
        </SectionReveal>
      )}

      <div
        className="h-3"
        style={{
          background: `repeating-linear-gradient(90deg, ${tc.primary}15 0px, ${tc.primary}15 8px, ${tc.accent} 8px, ${tc.accent} 16px)`,
        }}
      />

      {/* Gallery - 2 col masonry style */}
      <SectionReveal>
        <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
          <h2
            className="mb-6 text-center font-display text-xl font-bold md:text-3xl lg:text-4xl"
            style={{ color: tc.primary }}
          >
            Our Moments
          </h2>
          <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            {[
              { emoji: "\uD83D\uDCF8", h: "aspect-[3/4]" },
              { emoji: "\uD83D\uDC95", h: "aspect-square" },
              { emoji: "\u2728", h: "aspect-square" },
              { emoji: "\uD83C\uDF05", h: "aspect-[3/4]" },
            ].map((item, i) => (
              <div
                key={i}
                className={`${item.h} flex items-center justify-center rounded-xl text-3xl`}
                style={{ background: tc.accent + "55" }}
              >
                {item.emoji}
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Things to Know */}
      <SectionReveal>
        <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <div className="mx-auto max-w-3xl">
          <h2
            className="mb-6 text-center font-display text-xl font-bold md:text-3xl lg:text-4xl"
            style={{ color: tc.primary }}
          >
            Things to Know
          </h2>
          {[
            { icon: "#\uFE0F\u20E3", title: "Hashtag", desc: inv.hashtag || "" },
            { icon: "\uD83C\uDF24\uFE0F", title: "Weather", desc: "Check forecast" },
            { icon: "\uD83C\uDD7F\uFE0F", title: "Parking", desc: "Valet at venue" },
            { icon: "\uD83C\uDFE8", title: "Stay", desc: "Nearby lodging" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-3.5 py-3.5"
              style={{ borderBottom: i < 3 ? `1px solid ${tc.text}08` : "none" }}
            >
              <span className="w-8 shrink-0 text-center text-xl">{item.icon}</span>
              <div>
                <p className="font-sans text-sm font-semibold" style={{ color: tc.text }}>
                  {item.title}
                </p>
                <p className="font-sans text-xs opacity-40" style={{ color: tc.text }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
          </div>
        </div>
      </SectionReveal>

      {/* RSVP */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
          <div className="mx-auto max-w-xl">
            <div className="mb-3 text-4xl">💌</div>
            <h2 className="mb-2 font-display text-xl font-bold md:text-3xl" style={{ color: tc.primary }}>
              RSVP
            </h2>
            <p className="mb-6 font-sans text-xs opacity-40 md:text-sm" style={{ color: tc.text }}>
              Let us know you'll be there
            </p>
            <button
              className="w-full rounded-xl py-3.5 font-sans text-sm font-semibold uppercase tracking-[2px] text-white shadow-gold md:py-4 md:text-base"
              style={{ background: tc.primary }}
            >
              \uD83D\uDCAC RSVP on WhatsApp
            </button>
          </div>
        </div>
      </SectionReveal>

      {/* Countdown */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <h2 className="mb-6 font-display text-xl font-bold md:text-3xl lg:text-4xl" style={{ color: tc.primary }}>
            The Countdown Begins
          </h2>
          <div className="flex justify-center gap-3 md:gap-5 lg:gap-6">
            {[
              { v: cd.d, l: "Days" },
              { v: cd.h, l: "Hours" },
              { v: cd.m, l: "Mins" },
              { v: cd.s, l: "Secs" },
            ].map((u, i) => (
              <div key={i} className="text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl font-display text-2xl font-bold md:h-20 md:w-20 md:text-3xl lg:h-24 lg:w-24 lg:text-4xl"
                  style={{ background: tc.primary + "0A", color: tc.primary }}
                >
                  {String(u.v).padStart(2, "0")}
                </div>
                <span
                  className="mt-1 block font-sans text-[9px] font-medium uppercase tracking-[2px] opacity-35 md:text-xs"
                  style={{ color: tc.text }}
                >
                  {u.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Footer */}
      <div
        className="relative overflow-hidden px-6 py-14 text-center"
        style={{ background: "#1A3325" }}
      >
        {/* Mini mountain silhouette */}
        <div
          className="absolute left-0 right-0 top-0 h-8"
          style={{
            background: tc.card,
            clipPath:
              "polygon(0% 0%, 100% 0%, 100% 30%, 85% 60%, 70% 40%, 55% 70%, 40% 45%, 25% 75%, 10% 50%, 0% 70%)",
          }}
        />
        <div className="mb-2 mt-4 font-script text-3xl md:text-4xl" style={{ color: tc.secondary }}>
          {inv.groomName} & {inv.brideName}
        </div>
        <p className="text-xs text-white opacity-30">We look forward to celebrating with you!</p>
        <p className="mt-6 font-sans text-[10px] tracking-[1px] text-white opacity-15">
          Made with \u2665 by Invitara
        </p>
      </div>

      {/* Photo Gallery */}
      {(inv.photos ?? []).length > 0 && (
        <PhotoGallery photos={inv.photos ?? []} accentColor={tc.secondary} />
      )}
    </div>
  );
}

function TreeDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className="h-3 w-2"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", background: color + "30" }}
      />
      <div className="h-px w-8" style={{ background: color + "30" }} />
    </div>
  );
}
