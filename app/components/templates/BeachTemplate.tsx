import { useCountdown, useFormattedDate } from "./shared/hooks";
import { SectionReveal } from "./shared/SectionReveal";
import { PhotoGallery } from "./shared/PhotoGallery";
import type { TemplateProps } from "./shared/types";

export default function BeachTemplate({
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
      {/* Hero */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: t.gradient }} />
        {/* Watercolor radial overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 80% 30%, rgba(255,228,181,0.25) 0%, transparent 50%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        {/* Wave bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{
            background: tc.bg,
            clipPath:
              "polygon(0% 60%, 5% 50%, 10% 45%, 15% 48%, 20% 55%, 25% 60%, 30% 55%, 35% 45%, 40% 40%, 45% 45%, 50% 55%, 55% 60%, 60% 55%, 65% 48%, 70% 42%, 75% 48%, 80% 55%, 85% 60%, 90% 55%, 95% 50%, 100% 55%, 100% 100%, 0% 100%)",
          }}
        />
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center text-white">
          <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[5px] opacity-60 md:text-xs">
            Together with their families
          </p>
          <div className="my-4">
            <span className="inline-block animate-wave text-5xl">🐚</span>
          </div>
          <h1 className="mb-1 font-script text-[48px] leading-none drop-shadow-lg md:text-[72px] lg:text-[96px]">
            {inv.groomName}
          </h1>
          <div className="my-3 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-white/30 md:w-24" />
            <span className="text-lg opacity-70 md:text-xl">&</span>
            <span className="h-px w-16 bg-white/30 md:w-24" />
          </div>
          <h1 className="font-script text-[48px] leading-none drop-shadow-lg md:text-[72px] lg:text-[96px]">{inv.brideName}</h1>
          <div className="mt-8">
            <p className="font-sans text-xs uppercase tracking-[3px] opacity-50 md:text-sm">{dateStr}</p>
            <p className="mt-1 font-sans text-[10px] uppercase tracking-[2px] opacity-35 md:text-xs">
              {inv.venue || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {inv.message && (
        <SectionReveal>
          <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-5 font-sans text-[10px] font-semibold uppercase tracking-[5px] md:text-xs"
                style={{ color: tc.secondary }}
              >
                A Message from Us
              </p>
              <p
                className="mx-auto max-w-xl text-base italic leading-[2] opacity-55 md:text-lg"
                style={{ color: tc.text }}
              >
                {inv.message}
              </p>
            </div>
          </div>
        </SectionReveal>
      )}

      {/* Wave divider */}
      <WaveDivider color={tc.card} bgColor={tc.bg} />

      {/* Blessings */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-2xl md:text-3xl" style={{ color: tc.secondary }}>
            {inv.mantra ||
              "\u0950 \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903"}
          </p>
          <div className="mb-4 text-3xl">🌊</div>
          <p className="font-sans text-sm opacity-50 md:text-base" style={{ color: tc.text }}>
            With blessings from
          </p>
          <p className="mt-2 font-display text-lg font-semibold md:text-xl" style={{ color: tc.primary }}>
            {inv.blessingFrom || ""}
          </p>
          <div className="my-6 flex items-center justify-center gap-4">
            <span className="h-px w-10" style={{ background: tc.secondary + "40" }} />
            <span
              className="font-sans text-xs font-semibold uppercase tracking-[5px]"
              style={{ color: tc.secondary }}
            >
              INVITE YOU
            </span>
            <span className="h-px w-10" style={{ background: tc.secondary + "40" }} />
          </div>
          <p className="font-sans text-sm opacity-45 md:text-base" style={{ color: tc.text }}>
            To the wedding celebration of
          </p>
          <p className="mt-3 font-script text-3xl md:text-4xl" style={{ color: tc.primary }}>
            {inv.groomName} & {inv.brideName}
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

      <WaveDivider color={tc.bg} bgColor={tc.card} />

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
            Join us for these joyful moments
          </p>
        </SectionReveal>
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {events.map((ev, i) => (
            <SectionReveal
              key={ev.id}
              animation={i % 2 === 0 ? "slideLeft" : "slideRight"}
              delay={i * 100}
            >
              <div
                className="overflow-hidden rounded-3xl border"
                style={{ borderColor: ev.color + "18", background: tc.card }}
              >
                <div className="flex items-center gap-3.5 p-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
                    style={{ background: ev.color + "10" }}
                  >
                    {ev.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold" style={{ color: tc.text }}>
                      {ev.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] opacity-40" style={{ color: tc.text }}>
                      {ev.date} {ev.time && `\u00B7 ${ev.time}`}
                    </p>
                    <p className="text-[11px] opacity-40" style={{ color: tc.text }}>
                      {ev.venue}
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

      <WaveDivider color={tc.card} bgColor={tc.bg} />

      {/* Gallery */}
      <SectionReveal>
        <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <h2
            className="mb-6 text-center font-display text-xl font-bold md:text-3xl lg:text-4xl"
            style={{ color: tc.primary }}
          >
            Our Moments
          </h2>
          <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {["\uD83D\uDCF8", "\uD83D\uDC95", "\u2728", "\uD83C\uDF05"].map((e, i) => (
              <SectionReveal key={i} animation="scaleIn" delay={i * 80}>
                <div
                  className="flex aspect-[3/4] items-center justify-center rounded-3xl text-3xl"
                  style={{ background: tc.accent + "55" }}
                >
                  {e}
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </SectionReveal>

      <WaveDivider color={tc.bg} bgColor={tc.card} />

      {/* Things to Know */}
      <SectionReveal>
        <div className="px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
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

      <WaveDivider color={tc.card} bgColor={tc.bg} />

      {/* Countdown */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.card }}>
          <p className="mb-3 text-3xl">🌅</p>
          <h2 className="mb-6 font-display text-xl font-bold md:text-3xl lg:text-4xl" style={{ color: tc.primary }}>
            Counting the Days
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
                  className="flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-bold md:h-20 md:w-20 md:text-3xl lg:h-24 lg:w-24 lg:text-4xl"
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

      <WaveDivider color={tc.bg} bgColor={tc.card} />

      {/* RSVP */}
      <SectionReveal>
        <div className="px-6 py-14 text-center md:px-12 md:py-20 lg:px-16 lg:py-28" style={{ background: tc.bg }}>
          <div className="mx-auto max-w-xl">
            <div className="mb-3 text-4xl">💌</div>
            <h2 className="mb-2 font-display text-xl font-bold md:text-3xl" style={{ color: tc.primary }}>
              RSVP
            </h2>
            <p className="mb-6 font-sans text-xs opacity-40 md:text-sm" style={{ color: tc.text }}>
              We'd love to hear from you
            </p>
            <button
              className="w-full rounded-full py-3.5 font-sans text-sm font-semibold uppercase tracking-[2px] text-white shadow-gold md:py-4 md:text-base"
              style={{ background: tc.primary }}
            >
              💬 RSVP on WhatsApp
            </button>
          </div>
        </div>
      </SectionReveal>

      {/* Footer */}
      <div className="px-6 py-14 text-center md:py-20" style={{ background: tc.accent + "30" }}>
        <div className="mb-2 font-script text-3xl md:text-4xl" style={{ color: tc.primary }}>
          {inv.groomName} & {inv.brideName}
        </div>
        <p className="font-sans text-xs opacity-35 md:text-sm" style={{ color: tc.text }}>
          We look forward to celebrating with you!
        </p>
        <p
          className="mt-6 font-sans text-[10px] tracking-[1px] opacity-15 md:text-xs"
          style={{ color: tc.text }}
        >
          Made with ♥ by Invitara
        </p>
      </div>

      {/* Photo Gallery — rendered if photos are uploaded */}
      {(inv.photos ?? []).length > 0 && (
        <SectionReveal>
          <PhotoGallery photos={inv.photos ?? []} accentColor={tc.secondary} />
        </SectionReveal>
      )}
    </div>
  );
}

function WaveDivider({ color, bgColor }: { color: string; bgColor: string }) {
  return (
    <div className="relative h-10" style={{ background: bgColor }}>
      <div
        className="absolute inset-0"
        style={{
          background: color,
          clipPath:
            "polygon(0% 40%, 4% 35%, 8% 32%, 12% 35%, 16% 42%, 20% 48%, 24% 50%, 28% 48%, 32% 42%, 36% 35%, 40% 32%, 44% 35%, 48% 40%, 52% 45%, 56% 48%, 60% 45%, 64% 38%, 68% 32%, 72% 30%, 76% 34%, 80% 40%, 84% 46%, 88% 48%, 92% 44%, 96% 38%, 100% 35%, 100% 100%, 0% 100%)",
        }}
      />
    </div>
  );
}
