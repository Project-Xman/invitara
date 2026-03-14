import { useCountdown, useFormattedDate } from "./shared/hooks";
import { SectionReveal } from "./shared/SectionReveal";
import type { TemplateProps } from "./shared/types";
import { PhotoGallery } from "./shared/PhotoGallery";

export default function MeenayaTemplate({
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
      {/* Mantra / Blessings - FIRST (prominent, traditional placement) */}
      <SectionReveal>
        <div
          className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28"
          style={{
            background: `linear-gradient(180deg, ${tc.primary}08 0%, ${tc.card} 100%)`,
          }}
        >
          <div className="mx-auto max-w-3xl">
          <div className="mb-3 text-4xl">🪔</div>
          <p className="font-heading text-lg tracking-[2px] md:text-xl" style={{ color: tc.secondary }}>
            {inv.mantra ||
              "\u0950 \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903"}
          </p>
          <div className="my-5 flex items-center justify-center gap-3">
            <OrnamentDot color={tc.secondary} />
            <span className="h-px w-16" style={{ background: tc.secondary + "40" }} />
            <OrnamentDot color={tc.secondary} />
            <span className="h-px w-16" style={{ background: tc.secondary + "40" }} />
            <OrnamentDot color={tc.secondary} />
          </div>
          <p className="font-sans text-sm opacity-50" style={{ color: tc.text }}>
            With the divine blessings of
          </p>
          <p
            className="mt-2 font-heading text-base font-semibold tracking-wide"
            style={{ color: tc.primary }}
          >
            {inv.blessingFrom || ""}
          </p>
          <div className="my-6 flex items-center justify-center gap-3">
            <span className="h-px w-8" style={{ background: tc.secondary + "30" }} />
            <span
              className="font-sans text-[9px] font-semibold uppercase tracking-[6px]"
              style={{ color: tc.secondary }}
            >
              CORDIALLY INVITE
            </span>
            <span className="h-px w-8" style={{ background: tc.secondary + "30" }} />
          </div>
          <p className="font-sans text-sm opacity-45" style={{ color: tc.text }}>
            You to the wedding celebrations of
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

      {/* Hero - Deep red with ornate gold border frame */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: t.gradient }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.3) 100%)",
          }}
        />
        {/* Ornate double border frame */}
        <div
          className="absolute inset-5 rounded-sm border-2"
          style={{ borderColor: tc.secondary + "40" }}
        >
          <div className="absolute inset-2 border" style={{ borderColor: tc.secondary + "25" }} />
          {/* Corner ornaments */}
          <div
            className="absolute -left-1.5 -top-1.5 h-3 w-3 rotate-45"
            style={{ background: tc.secondary }}
          />
          <div
            className="absolute -right-1.5 -top-1.5 h-3 w-3 rotate-45"
            style={{ background: tc.secondary }}
          />
          <div
            className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rotate-45"
            style={{ background: tc.secondary }}
          />
          <div
            className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rotate-45"
            style={{ background: tc.secondary }}
          />
          {/* Mid-point ornaments */}
          <div
            className="absolute -top-1 left-1/2 h-px w-6 -translate-x-1/2"
            style={{ background: tc.secondary }}
          />
          <div
            className="absolute -bottom-1 left-1/2 h-px w-6 -translate-x-1/2"
            style={{ background: tc.secondary }}
          />
        </div>
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-10 py-16 text-center text-white">
          <p className="mb-6 font-sans text-[9px] font-medium uppercase tracking-[6px] opacity-50 md:text-xs">
            Shubh Vivah
          </p>
          <h1 className="font-script text-[48px] leading-none drop-shadow-lg md:text-[72px] lg:text-[96px]">{inv.groomName}</h1>
          <div className="my-3 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-white/20" />
            <span className="text-2xl">🪔</span>
            <span className="h-px w-10 bg-white/20" />
          </div>
          <h1 className="font-script text-[48px] leading-none drop-shadow-lg md:text-[72px] lg:text-[96px]">{inv.brideName}</h1>
          <div className="mt-8 border-t border-white/15 pt-5">
            <p className="font-sans text-xs uppercase tracking-[3px] opacity-50">{dateStr}</p>
            <p className="mt-1 font-sans text-[10px] uppercase tracking-[2px] opacity-30">
              {inv.venue || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Rangoli-inspired divider */}
      <RangoliDivider primaryColor={tc.primary} secondaryColor={tc.secondary} bgColor={tc.card} />

      {/* Events */}
      <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
        <SectionReveal>
          <h2
            className="mb-1 text-center font-heading text-xl font-semibold tracking-[2px] md:text-3xl lg:text-4xl"
            style={{ color: tc.primary }}
          >
            Celebrations
          </h2>
          <p className="mb-8 text-center font-sans text-sm opacity-40 md:text-base" style={{ color: tc.text }}>
            Moments of joy and togetherness
          </p>
        </SectionReveal>
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {events.map((ev, i) => (
            <SectionReveal key={ev.id} animation="fadeUp" delay={i * 100}>
              <div
                className="overflow-hidden rounded-xl"
                style={{
                  background: tc.bg,
                  border: `1px solid ${tc.secondary}18`,
                  boxShadow: `0 2px 12px ${tc.primary}08`,
                }}
              >
                <div className="flex items-center gap-3.5 p-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg"
                    style={{
                      background: `radial-gradient(circle, ${ev.color}15 0%, ${ev.color}05 100%)`,
                      border: `1.5px solid ${ev.color}25`,
                    }}
                  >
                    {ev.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-heading text-base font-semibold tracking-wide"
                      style={{ color: tc.text }}
                    >
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
                    background: `linear-gradient(90deg, transparent, ${ev.color}05, transparent)`,
                  }}
                >
                  \uD83D\uDCCD See the Route
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>

      <RangoliDivider primaryColor={tc.primary} secondaryColor={tc.secondary} bgColor={tc.bg} />

      {/* Message */}
      {inv.message && (
        <SectionReveal>
          <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 text-2xl">🙏</div>
              <p
                className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[4px] md:text-xs"
                style={{ color: tc.secondary }}
              >
                A Message from the Couple
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

      <RangoliDivider primaryColor={tc.primary} secondaryColor={tc.secondary} bgColor={tc.card} />

      {/* Gallery */}
      <SectionReveal>
        <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <h2
            className="mb-6 text-center font-heading text-xl font-semibold tracking-[2px] md:text-3xl lg:text-4xl"
            style={{ color: tc.primary }}
          >
            Our Moments
          </h2>
          <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {["\uD83D\uDCF8", "\uD83D\uDC95", "\u2728", "\uD83C\uDF05"].map((e, i) => (
              <div
                key={i}
                className="flex aspect-[3/4] items-center justify-center rounded-xl text-3xl"
                style={{
                  background: tc.accent + "55",
                  border: `1px solid ${tc.secondary}15`,
                }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Things to Know */}
      <SectionReveal>
        <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
          <div className="mx-auto max-w-3xl">
          <h2
            className="mb-6 text-center font-heading text-xl font-semibold tracking-[2px] md:text-3xl lg:text-4xl"
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
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <div className="mx-auto max-w-xl">
            <div className="mb-3 text-4xl">💌</div>
            <h2
              className="mb-2 font-heading text-xl font-semibold tracking-[2px] md:text-3xl"
              style={{ color: tc.primary }}
            >
              RSVP
            </h2>
            <p className="mb-6 font-sans text-xs opacity-40 md:text-sm" style={{ color: tc.text }}>
              Kindly let us know your presence
            </p>
            <button
              className="w-full animate-warm-glow rounded-full py-3.5 font-sans text-sm font-semibold uppercase tracking-[2px] text-white md:py-4 md:text-base"
              style={{ background: tc.primary }}
            >
              \uD83D\uDCAC RSVP on WhatsApp
            </button>
          </div>
        </div>
      </SectionReveal>

      {/* Countdown */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
          <h2
            className="mb-6 font-heading text-xl font-semibold tracking-[2px] md:text-3xl lg:text-4xl"
            style={{ color: tc.primary }}
          >
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
                  className="flex h-16 w-16 items-center justify-center rounded-full font-heading text-2xl font-bold md:h-20 md:w-20 md:text-3xl lg:h-24 lg:w-24 lg:text-4xl"
                  style={{
                    background: tc.primary + "0A",
                    color: tc.primary,
                    border: `1.5px solid ${tc.secondary}25`,
                  }}
                >
                  {String(u.v).padStart(2, "0")}
                </div>
                <span
                  className="mt-1.5 block font-sans text-[9px] font-medium uppercase tracking-[2px] opacity-35"
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
        style={{ background: t.gradient }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 20%, rgba(0,0,0,0.25) 100%)",
          }}
        />
        <div className="relative z-10">
          <div className="mb-3 text-3xl">🪔</div>
          <div className="mb-2 font-script text-3xl text-white drop-shadow-lg md:text-4xl">
            {inv.groomName} & {inv.brideName}
          </div>
          <p className="text-xs text-white opacity-35">We look forward to celebrating with you!</p>
          <p className="mt-6 font-sans text-[10px] tracking-[1px] text-white opacity-15">
            Made with \u2665 by Invitara
          </p>
        </div>
      </div>

      {/* Photo Gallery */}
      {(inv.photos ?? []).length > 0 && (
        <PhotoGallery photos={inv.photos ?? []} accentColor={tc.secondary} />
      )}
    </div>
  );
}

function OrnamentDot({ color }: { color: string }) {
  return <div className="h-1.5 w-1.5 rotate-45" style={{ background: color + "60" }} />;
}

function RangoliDivider({
  primaryColor,
  secondaryColor,
  bgColor,
}: {
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
}) {
  return (
    <div className="relative flex h-8 items-center justify-center" style={{ background: bgColor }}>
      <div
        className="absolute inset-x-0 top-1/2 h-px"
        style={{ background: secondaryColor + "20" }}
      />
      <div className="relative flex items-center gap-2">
        <div className="h-1 w-1 rotate-45" style={{ background: secondaryColor + "40" }} />
        <div className="h-1.5 w-1.5 rotate-45" style={{ background: secondaryColor + "50" }} />
        <div className="h-2 w-2 rotate-45" style={{ background: secondaryColor + "60" }} />
        <div
          className="h-3 w-3 rotate-45 border"
          style={{ borderColor: secondaryColor + "50", background: primaryColor + "10" }}
        />
        <div className="h-2 w-2 rotate-45" style={{ background: secondaryColor + "60" }} />
        <div className="h-1.5 w-1.5 rotate-45" style={{ background: secondaryColor + "50" }} />
        <div className="h-1 w-1 rotate-45" style={{ background: secondaryColor + "40" }} />
      </div>
    </div>
  );
}
