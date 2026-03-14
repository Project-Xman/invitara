import { useCountdown, useFormattedDate } from "./shared/hooks";
import { SectionReveal } from "./shared/SectionReveal";
import type { TemplateProps } from "./shared/types";
import { PhotoGallery } from "./shared/PhotoGallery";

export default function CityMinimalTemplate({
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
      style={{ background: tc.bg, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Hero - Ultra minimal, whitespace-driven */}
      <div
        className="flex min-h-screen flex-col items-center justify-center px-8 py-20"
        style={{ background: tc.bg }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <p
            className="mb-16 text-[9px] font-medium uppercase tracking-[8px] opacity-30 md:text-xs"
            style={{ color: tc.text }}
          >
            Wedding Invitation
          </p>
          <h1
            className="font-display text-[48px] leading-none tracking-[4px] md:text-[72px] lg:text-[96px]"
            style={{ color: tc.text }}
          >
            {inv.groomName}
          </h1>
          <div className="my-6 h-px w-12 mx-auto md:w-20" style={{ background: tc.secondary }} />
          <h1
            className="font-display text-[48px] leading-none tracking-[4px] md:text-[72px] lg:text-[96px]"
            style={{ color: tc.text }}
          >
            {inv.brideName}
          </h1>
          <div className="mt-16">
            <p className="text-[10px] uppercase tracking-[4px] opacity-35 md:text-sm" style={{ color: tc.text }}>
              {dateStr}
            </p>
          </div>
          <p
            className="mt-2 text-[10px] uppercase tracking-[3px] opacity-25 md:text-xs"
            style={{ color: tc.text }}
          >
            {inv.venue || ""}
          </p>
        </div>
      </div>

      {/* Single gold line divider */}
      <div className="mx-12 h-px" style={{ background: tc.secondary + "30" }} />

      {/* Events - Clean minimal list */}
      <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
        <SectionReveal>
          <p
            className="mb-10 text-center text-[9px] font-medium uppercase tracking-[6px] opacity-30 md:text-xs"
            style={{ color: tc.text }}
          >
            Schedule
          </p>
        </SectionReveal>
        <div className="mx-auto max-w-4xl space-y-0">
          {events.map((ev, i) => (
            <SectionReveal key={ev.id} animation="fadeIn" delay={i * 80}>
              <div
                className="flex gap-4 py-5"
                style={{ borderBottom: i < events.length - 1 ? `1px solid ${tc.text}06` : "none" }}
              >
                <div
                  className="w-1 shrink-0 self-stretch rounded-full"
                  style={{ background: tc.secondary + "40" }}
                />
                <div className="flex-1">
                  <h3
                    className="font-display text-lg font-semibold tracking-wide"
                    style={{ color: tc.text }}
                  >
                    {ev.name}
                  </h3>
                  <p
                    className="mt-1.5 text-[11px] tracking-wide opacity-35"
                    style={{ color: tc.text }}
                  >
                    {ev.date} {ev.time && `\u00B7 ${ev.time}`}
                  </p>
                  <p className="text-[11px] tracking-wide opacity-25" style={{ color: tc.text }}>
                    {ev.venue}
                  </p>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>

      <div className="mx-12 h-px" style={{ background: tc.secondary + "30" }} />

      {/* Message */}
      {inv.message && (
        <SectionReveal>
          <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
            <p
              className="mx-auto max-w-xl font-body text-base leading-[2.2] opacity-40 md:text-lg"
              style={{ color: tc.text }}
            >
              {inv.message}
            </p>
          </div>
        </SectionReveal>
      )}

      <div className="mx-12 h-px" style={{ background: tc.secondary + "30" }} />

      {/* Blessings - Subtle */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <div className="mx-auto max-w-3xl">
          <p className="mb-2 text-sm opacity-30 md:text-base" style={{ color: tc.text }}>
            {inv.mantra ||
              "\u0950 \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903"}
          </p>
          <div className="mx-auto my-5 h-px w-6" style={{ background: tc.secondary + "40" }} />
          <p className="text-[10px] uppercase tracking-[3px] opacity-25" style={{ color: tc.text }}>
            With blessings of
          </p>
          <p
            className="mt-2 font-display text-base font-semibold tracking-wide"
            style={{ color: tc.text }}
          >
            {inv.blessingFrom || ""}
          </p>
          {inv.groomFamily && (
            <p className="mt-6 text-[11px] opacity-25" style={{ color: tc.text }}>
              Son of {inv.groomFamily}
            </p>
          )}
          {inv.brideFamily && (
            <p className="mt-1 text-[11px] opacity-25 md:text-xs" style={{ color: tc.text }}>
              Daughter of {inv.brideFamily}
            </p>
          )}
          </div>
        </div>
      </SectionReveal>

      <div className="mx-12 h-px" style={{ background: tc.secondary + "30" }} />

      {/* Gallery - Clean single-row + 2-col */}
      <SectionReveal>
        <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
          <p
            className="mb-8 text-center text-[9px] font-medium uppercase tracking-[6px] opacity-30 md:text-xs"
            style={{ color: tc.text }}
          >
            Gallery
          </p>
          <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {["\uD83D\uDCF8", "\uD83D\uDC95", "\u2728", "\uD83C\uDF05"].map((e, i) => (
              <div
                key={i}
                className="flex aspect-[4/5] items-center justify-center text-2xl"
                style={{
                  background: tc.accent + "30",
                }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="mx-12 h-px" style={{ background: tc.secondary + "30" }} />

      {/* Things to Know */}
      <SectionReveal>
        <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <div className="mx-auto max-w-3xl">
          <p
            className="mb-8 text-center text-[9px] font-medium uppercase tracking-[6px] opacity-30 md:text-xs"
            style={{ color: tc.text }}
          >
            Details
          </p>
          {[
            { icon: "#\uFE0F\u20E3", title: "Hashtag", desc: inv.hashtag || "" },
            { icon: "\uD83C\uDF24\uFE0F", title: "Weather", desc: "Check forecast" },
            { icon: "\uD83C\uDD7F\uFE0F", title: "Parking", desc: "Valet at venue" },
            { icon: "\uD83C\uDFE8", title: "Stay", desc: "Nearby lodging" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-4 py-4"
              style={{ borderBottom: i < 3 ? `1px solid ${tc.text}05` : "none" }}
            >
              <span className="w-6 shrink-0 text-center text-lg opacity-50">{item.icon}</span>
              <div>
                <p className="text-sm font-medium tracking-wide" style={{ color: tc.text }}>
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs opacity-30" style={{ color: tc.text }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
          </div>
        </div>
      </SectionReveal>

      <div className="mx-12 h-px" style={{ background: tc.secondary + "30" }} />

      {/* Countdown - Minimal with gold numbers only */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
          <p
            className="mb-8 text-[9px] font-medium uppercase tracking-[6px] opacity-30 md:text-xs"
            style={{ color: tc.text }}
          >
            Countdown
          </p>
          <div className="flex justify-center gap-6 md:gap-10 lg:gap-12">
            {[
              { v: cd.d, l: "Days" },
              { v: cd.h, l: "Hours" },
              { v: cd.m, l: "Mins" },
              { v: cd.s, l: "Secs" },
            ].map((u, i) => (
              <div key={i} className="text-center">
                <div
                  className="font-display text-3xl font-bold tracking-wide md:text-4xl lg:text-5xl"
                  style={{ color: tc.secondary }}
                >
                  {String(u.v).padStart(2, "0")}
                </div>
                <span
                  className="mt-1 block text-[8px] font-medium uppercase tracking-[3px] opacity-25"
                  style={{ color: tc.text }}
                >
                  {u.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="mx-12 h-px" style={{ background: tc.secondary + "30" }} />

      {/* RSVP */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <div className="mx-auto max-w-xl">
            <p
              className="mb-6 text-[9px] font-medium uppercase tracking-[6px] opacity-30 md:text-xs"
              style={{ color: tc.text }}
            >
              Respond
            </p>
            <button
              className="w-full py-3.5 text-sm font-semibold uppercase tracking-[3px] text-white md:py-4 md:text-base"
              style={{ background: tc.secondary }}
            >
              RSVP
            </button>
          </div>
        </div>
      </SectionReveal>

      {/* Footer */}
      <div className="px-8 py-16 text-center md:py-20" style={{ background: tc.bg }}>
        <div className="mb-3 font-display text-2xl tracking-[3px] md:text-3xl lg:text-4xl" style={{ color: tc.text }}>
          {inv.groomName} & {inv.brideName}
        </div>
        <div className="mx-auto mb-3 h-px w-8" style={{ background: tc.secondary + "40" }} />
        <p className="text-[10px] uppercase tracking-[2px] opacity-20" style={{ color: tc.text }}>
          We look forward to celebrating with you
        </p>
        <p className="mt-8 text-[9px] tracking-[1px] opacity-10" style={{ color: tc.text }}>
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
