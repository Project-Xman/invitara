import { useCountdown, useFormattedDate } from "./shared/hooks";
import { SectionReveal } from "./shared/SectionReveal";
import type { TemplateProps } from "./shared/types";

export default function RaabtaTemplate({
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
      className={fullWidth ? "mx-auto max-w-lg" : ""}
      style={{ background: tc.bg, fontFamily: "'Cormorant Garamond', serif" }}
    >
      {/* Bismillah Section */}
      <SectionReveal>
        <div
          className="px-6 py-10 text-center"
          style={{
            background: `linear-gradient(180deg, ${tc.primary}12 0%, ${tc.card} 100%)`,
          }}
        >
          <p className="mb-2 font-heading text-lg tracking-wide" style={{ color: tc.secondary }}>
            Bismillah ir-Rahman ir-Rahim
          </p>
          <p className="font-sans text-xs opacity-40" style={{ color: tc.text }}>
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <GeometricStar color={tc.secondary} size={8} />
            <span className="h-px w-12" style={{ background: tc.secondary + "30" }} />
            <div className="h-2 w-2 rotate-45" style={{ background: tc.secondary + "40" }} />
            <span className="h-px w-12" style={{ background: tc.secondary + "30" }} />
            <GeometricStar color={tc.secondary} size={8} />
          </div>
        </div>
      </SectionReveal>

      {/* Hero - Deep green with Moorish arch frame */}
      <div
        className="relative flex min-h-[460px] items-center justify-center overflow-hidden"
        style={{ background: tc.primary }}
      >
        {/* Arabesque background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
            radial-gradient(circle at 0% 0%, transparent 40%, ${tc.secondary} 40%, ${tc.secondary} 41%, transparent 41%),
            radial-gradient(circle at 100% 0%, transparent 40%, ${tc.secondary} 40%, ${tc.secondary} 41%, transparent 41%),
            radial-gradient(circle at 0% 100%, transparent 40%, ${tc.secondary} 40%, ${tc.secondary} 41%, transparent 41%),
            radial-gradient(circle at 100% 100%, transparent 40%, ${tc.secondary} 40%, ${tc.secondary} 41%, transparent 41%)
          `,
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.25) 100%)",
          }}
        />
        {/* Pointed arch frame */}
        <div className="absolute inset-x-8 inset-y-6">
          <div
            className="h-full w-full"
            style={{
              border: `1.5px solid ${tc.secondary}35`,
              borderRadius: "50% 50% 4px 4px / 60% 60% 4px 4px",
            }}
          />
          <div
            className="absolute inset-2 h-auto w-auto"
            style={{
              border: `1px solid ${tc.secondary}20`,
              borderRadius: "50% 50% 4px 4px / 60% 60% 4px 4px",
            }}
          />
        </div>
        {/* Crescent + star at top */}
        <div className="absolute left-1/2 top-10 z-20 -translate-x-1/2">
          <CrescentStar color={tc.secondary} />
        </div>
        {/* Content */}
        <div className="relative z-10 px-8 py-20 text-center text-white">
          <p className="mb-6 mt-4 font-sans text-[9px] font-medium uppercase tracking-[6px] opacity-50">
            You Are Cordially Invited
          </p>
          <h1 className="font-script text-[50px] leading-none drop-shadow-lg">{inv.groomName}</h1>
          <div className="my-3 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-white/20" />
            <span className="text-lg" style={{ color: tc.secondary + "AA" }}>
              &
            </span>
            <span className="h-px w-10 bg-white/20" />
          </div>
          <h1 className="font-script text-[50px] leading-none drop-shadow-lg">{inv.brideName}</h1>
          <div className="mt-8 border-t border-white/15 pt-5">
            <p className="font-sans text-xs uppercase tracking-[3px] opacity-50">{dateStr}</p>
            <p className="mt-1 font-sans text-[10px] uppercase tracking-[2px] opacity-30">
              {inv.venue || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Geometric divider */}
      <GeometricDivider color={tc.secondary} bgColor={tc.card} />

      {/* Blessings */}
      <SectionReveal>
        <div className="px-6 py-14 text-center" style={{ background: tc.card }}>
          <div className="mb-4 text-3xl">🤲</div>
          <p className="font-sans text-sm opacity-50" style={{ color: tc.text }}>
            With the blessings of Allah Subhanahu Wa Ta'ala and through
          </p>
          <p
            className="mt-2 font-heading text-lg font-semibold tracking-wide"
            style={{ color: tc.primary }}
          >
            {inv.blessingFrom || ""}
          </p>
          <div className="my-6 flex items-center justify-center gap-3">
            <span className="h-px w-8" style={{ background: tc.secondary + "30" }} />
            <span
              className="font-sans text-[9px] font-semibold uppercase tracking-[5px]"
              style={{ color: tc.secondary }}
            >
              REQUEST THE HONOUR
            </span>
            <span className="h-px w-8" style={{ background: tc.secondary + "30" }} />
          </div>
          <p className="font-sans text-sm opacity-45" style={{ color: tc.text }}>
            Of your gracious presence at the Nikah ceremony of
          </p>
          <p className="mt-3 font-display text-2xl font-bold" style={{ color: tc.primary }}>
            {inv.groomName} <span className="opacity-30">&</span> {inv.brideName}
          </p>
          {inv.groomFamily && (
            <p className="mt-4 font-sans text-xs opacity-40" style={{ color: tc.text }}>
              Son of {inv.groomFamily}
            </p>
          )}
          {inv.brideFamily && (
            <p className="mt-1 font-sans text-xs opacity-40" style={{ color: tc.text }}>
              Daughter of {inv.brideFamily}
            </p>
          )}
        </div>
      </SectionReveal>

      <GeometricDivider color={tc.secondary} bgColor={tc.bg} />

      {/* Events */}
      <div className="px-5 py-12" style={{ background: tc.bg }}>
        <SectionReveal>
          <h2
            className="mb-1 text-center font-heading text-xl font-semibold tracking-[2px]"
            style={{ color: tc.primary }}
          >
            Celebrations
          </h2>
          <p className="mb-8 text-center font-sans text-sm opacity-40" style={{ color: tc.text }}>
            Blessed moments of togetherness
          </p>
        </SectionReveal>
        <div className="space-y-3">
          {events.map((ev, i) => (
            <SectionReveal key={ev.id} animation="fadeUp" delay={i * 100}>
              <div
                className="overflow-hidden border"
                style={{
                  borderColor: tc.secondary + "15",
                  background: tc.card,
                  borderRadius: "12px 12px 12px 12px",
                }}
              >
                {/* Mihrab-style top accent */}
                <div
                  className="h-1.5"
                  style={{
                    background: `linear-gradient(90deg, transparent 10%, ${ev.color}30 30%, ${ev.color}40 50%, ${ev.color}30 70%, transparent 90%)`,
                  }}
                />
                <div className="flex items-center gap-3.5 p-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center text-lg"
                    style={{
                      background: ev.color + "08",
                      border: `1px solid ${ev.color}20`,
                      borderRadius: "50% 50% 8px 8px / 60% 60% 8px 8px",
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
                      {ev.date} {ev.time && `\u00B7 ${ev.time}`}
                    </p>
                    <p className="font-sans text-[11px] opacity-40" style={{ color: tc.text }}>
                      {ev.venue}
                    </p>
                  </div>
                </div>
                <div
                  className="py-2.5 text-center font-sans text-[10px] font-semibold uppercase tracking-[1.5px]"
                  style={{
                    color: ev.color,
                    borderTop: `1px solid ${ev.color}0D`,
                    background: ev.color + "04",
                  }}
                >
                  \uD83D\uDCCD See the Route
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>

      <GeometricDivider color={tc.secondary} bgColor={tc.card} />

      {/* Message */}
      {inv.message && (
        <SectionReveal>
          <div className="px-8 py-14 text-center" style={{ background: tc.card }}>
            <p
              className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[4px]"
              style={{ color: tc.secondary }}
            >
              A Message from the Couple
            </p>
            <p
              className="mx-auto max-w-sm text-base italic leading-[2] opacity-50"
              style={{ color: tc.text }}
            >
              {inv.message}
            </p>
          </div>
        </SectionReveal>
      )}

      <GeometricDivider color={tc.secondary} bgColor={tc.bg} />

      {/* Gallery */}
      <SectionReveal>
        <div className="px-5 py-12" style={{ background: tc.bg }}>
          <h2
            className="mb-6 text-center font-heading text-xl font-semibold tracking-[2px]"
            style={{ color: tc.primary }}
          >
            Our Moments
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {["\uD83D\uDCF8", "\uD83D\uDC95", "\u2728", "\uD83C\uDF05"].map((e, i) => (
              <div
                key={i}
                className="flex aspect-[3/4] items-center justify-center text-3xl"
                style={{
                  background: tc.accent + "55",
                  borderRadius: "50% 50% 12px 12px / 30% 30% 12px 12px",
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
        <div className="px-5 py-12" style={{ background: tc.card }}>
          <h2
            className="mb-6 text-center font-heading text-xl font-semibold tracking-[2px]"
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
      </SectionReveal>

      {/* RSVP */}
      <SectionReveal>
        <div className="px-6 py-12 text-center" style={{ background: tc.bg }}>
          <div className="mb-3 text-4xl">💌</div>
          <h2
            className="mb-2 font-heading text-xl font-semibold tracking-[2px]"
            style={{ color: tc.primary }}
          >
            RSVP
          </h2>
          <p className="mb-6 font-sans text-xs opacity-40" style={{ color: tc.text }}>
            Kindly honour us with your response
          </p>
          <button
            className="w-full rounded-xl py-3.5 font-sans text-sm font-semibold uppercase tracking-[2px] text-white shadow-gold"
            style={{ background: tc.primary }}
          >
            \uD83D\uDCAC RSVP on WhatsApp
          </button>
        </div>
      </SectionReveal>

      {/* Countdown */}
      <SectionReveal>
        <div className="px-6 py-12 text-center" style={{ background: tc.card }}>
          <h2
            className="mb-6 font-heading text-xl font-semibold tracking-[2px]"
            style={{ color: tc.primary }}
          >
            The Countdown Begins
          </h2>
          <div className="flex justify-center gap-3">
            {[
              { v: cd.d, l: "Days" },
              { v: cd.h, l: "Hours" },
              { v: cd.m, l: "Mins" },
              { v: cd.s, l: "Secs" },
            ].map((u, i) => (
              <div key={i} className="text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center font-heading text-2xl font-bold"
                  style={{
                    background: tc.primary + "0A",
                    color: tc.primary,
                    border: `1px solid ${tc.secondary}15`,
                    borderRadius: "50% 50% 12px 12px / 40% 40% 12px 12px",
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
        style={{ background: tc.primary }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, ${tc.secondary} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10">
          <CrescentStar color={tc.secondary + "60"} />
          <div className="mb-2 mt-4 font-script text-3xl text-white drop-shadow-lg">
            {inv.groomName} & {inv.brideName}
          </div>
          <p className="text-xs text-white opacity-30">
            MashaAllah - We look forward to celebrating with you!
          </p>
          <p className="mt-6 font-sans text-[10px] tracking-[1px] text-white opacity-15">
            Made with \u2665 by Invitara
          </p>
        </div>
      </div>
    </div>
  );
}

function GeometricStar({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rotate-0"
        style={{
          background: color + "40",
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        }}
      />
    </div>
  );
}

function CrescentStar({ color }: { color: string }) {
  return (
    <div className="relative mx-auto h-8 w-8">
      {/* Crescent */}
      <div className="absolute inset-0 rounded-full" style={{ background: color, opacity: 0.5 }} />
      <div
        className="absolute left-1.5 top-0 h-8 w-7 rounded-full"
        style={{ background: "inherit" }}
      />
      {/* Star */}
      <div className="absolute right-0 top-1 h-3 w-3">
        <GeometricStar color={color} size={12} />
      </div>
    </div>
  );
}

function GeometricDivider({ color, bgColor }: { color: string; bgColor: string }) {
  return (
    <div className="relative flex h-6 items-center justify-center" style={{ background: bgColor }}>
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: color + "15" }} />
      <div className="relative flex items-center gap-2">
        <span className="h-px w-8" style={{ background: color + "30" }} />
        <div className="h-2 w-2 rotate-45" style={{ border: `1px solid ${color}40` }} />
        <GeometricStar color={color} size={10} />
        <div className="h-2 w-2 rotate-45" style={{ border: `1px solid ${color}40` }} />
        <span className="h-px w-8" style={{ background: color + "30" }} />
      </div>
    </div>
  );
}
