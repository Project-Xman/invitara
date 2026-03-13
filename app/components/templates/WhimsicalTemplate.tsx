import { useCountdown, useFormattedDate } from "./shared/hooks";
import { SectionReveal } from "./shared/SectionReveal";
import type { TemplateProps } from "./shared/types";

export default function WhimsicalTemplate({
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
      style={{ background: tc.bg, fontFamily: "'Dancing Script', cursive" }}
    >
      {/* Hero - Pastel gradient with floating blobs */}
      <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: t.gradient }} />
        {/* Floating blob shapes */}
        <div
          className="absolute -left-10 top-10 h-40 w-40 animate-blob-morph rounded-full opacity-20"
          style={{ background: tc.primary + "40" }}
        />
        <div
          className="absolute -right-8 top-32 h-32 w-32 animate-blob-morph rounded-full opacity-15"
          style={{ background: tc.secondary + "50", animationDelay: "-4s" }}
        />
        <div
          className="absolute bottom-20 left-8 h-28 w-28 animate-blob-morph rounded-full opacity-15"
          style={{ background: "#A0D8E080", animationDelay: "-8s" }}
        />
        {/* Watercolor splashes */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 60%, rgba(255,200,220,0.2) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 30%, rgba(200,176,232,0.15) 0%, transparent 45%)",
          }}
        />
        {/* Floating flowers */}
        <div className="absolute left-8 top-16 animate-float-gentle text-2xl opacity-40">🌸</div>
        <div
          className="absolute right-10 top-40 animate-float-gentle text-xl opacity-35"
          style={{ animationDelay: "-2s" }}
        >
          🌷
        </div>
        <div
          className="absolute bottom-28 left-16 animate-float-gentle text-lg opacity-30"
          style={{ animationDelay: "-4s" }}
        >
          🌺
        </div>
        <div
          className="absolute bottom-16 right-20 animate-float-gentle text-xl opacity-35"
          style={{ animationDelay: "-1s" }}
        >
          💐
        </div>
        {/* Content */}
        <div className="relative z-10 px-6 py-20 text-center text-white">
          <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[5px] opacity-60">
            Together Forever
          </p>
          <div className="mb-4 text-4xl">✨</div>
          <h1 className="text-[58px] leading-none drop-shadow-lg">{inv.groomName}</h1>
          <div className="my-2 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-white/25" />
            <span className="text-2xl opacity-70">💕</span>
            <span className="h-px w-12 bg-white/25" />
          </div>
          <h1 className="text-[58px] leading-none drop-shadow-lg">{inv.brideName}</h1>
          <div className="mt-8">
            <p className="font-sans text-xs uppercase tracking-[3px] opacity-50">{dateStr}</p>
            <p className="mt-1 font-sans text-[10px] uppercase tracking-[2px] opacity-35">
              {inv.venue || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Message - right after hero for whimsical feel */}
      {inv.message && (
        <SectionReveal>
          <div
            className="relative overflow-hidden px-8 py-14 text-center"
            style={{ background: tc.bg }}
          >
            {/* Small blob decoration */}
            <div
              className="absolute right-4 top-4 h-16 w-16 animate-blob-morph rounded-full opacity-10"
              style={{ background: tc.primary }}
            />
            <p
              className="mb-5 font-sans text-[10px] font-semibold uppercase tracking-[5px]"
              style={{ color: tc.secondary }}
            >
              Our Love Story
            </p>
            <p
              className="mx-auto max-w-sm font-body text-base italic leading-[2] opacity-55"
              style={{ color: tc.text }}
            >
              {inv.message}
            </p>
            <div className="mt-4 text-2xl">🦋</div>
          </div>
        </SectionReveal>
      )}

      {/* Dashed gold divider */}
      <DashedDivider color={tc.secondary} />

      {/* Blessings */}
      <SectionReveal>
        <div className="px-6 py-14 text-center" style={{ background: tc.card }}>
          <p className="mb-3 text-xl" style={{ color: tc.secondary }}>
            {inv.mantra ||
              "\u0950 \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903"}
          </p>
          <div className="mb-4 text-3xl">🌈</div>
          <p className="font-sans text-sm opacity-50" style={{ color: tc.text }}>
            With blessings from
          </p>
          <p className="mt-2 font-display text-lg font-semibold" style={{ color: tc.primary }}>
            {inv.blessingFrom || ""}
          </p>
          <div className="my-6 flex items-center justify-center gap-3">
            <span className="text-sm">🌿</span>
            <span
              className="font-sans text-[9px] font-semibold uppercase tracking-[5px]"
              style={{ color: tc.secondary }}
            >
              JOYFULLY INVITE
            </span>
            <span className="text-sm">🌿</span>
          </div>
          <p className="font-sans text-sm opacity-45" style={{ color: tc.text }}>
            You to celebrate the union of
          </p>
          <p className="mt-3 text-3xl" style={{ color: tc.primary }}>
            {inv.groomName} & {inv.brideName}
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

      <DashedDivider color={tc.secondary} />

      {/* Events */}
      <div className="px-5 py-12" style={{ background: tc.bg }}>
        <SectionReveal>
          <h2 className="mb-1 text-center text-2xl" style={{ color: tc.primary }}>
            Celebrations
          </h2>
          <p className="mb-8 text-center font-sans text-sm opacity-40" style={{ color: tc.text }}>
            Magical moments await
          </p>
        </SectionReveal>
        <div className="space-y-3">
          {events.map((ev, i) => (
            <SectionReveal
              key={ev.id}
              animation={i % 2 === 0 ? "slideLeft" : "slideRight"}
              delay={i * 100}
            >
              <div
                className="relative overflow-hidden rounded-3xl"
                style={{
                  background: tc.card,
                  border: `2px dashed ${ev.color}25`,
                }}
              >
                {/* Small blob accent */}
                <div
                  className="absolute -right-2 -top-2 h-10 w-10 rounded-full opacity-10"
                  style={{
                    background: ev.color,
                    borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                  }}
                />
                <div className="relative z-10 flex items-center gap-3.5 p-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
                    style={{
                      background: `linear-gradient(135deg, ${ev.color}15, ${ev.color}08)`,
                    }}
                  >
                    {ev.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg" style={{ color: tc.text }}>
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
                  style={{ color: ev.color, borderTop: `1px dashed ${ev.color}15` }}
                >
                  \uD83D\uDCCD See the Route
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>

      <DashedDivider color={tc.secondary} />

      {/* Gallery */}
      <SectionReveal>
        <div className="relative overflow-hidden px-5 py-12" style={{ background: tc.card }}>
          <div
            className="opacity-8 absolute bottom-4 left-4 h-20 w-20 animate-blob-morph rounded-full"
            style={{ background: tc.primary + "20" }}
          />
          <h2 className="mb-6 text-center text-xl" style={{ color: tc.primary }}>
            Our Moments
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {["\uD83D\uDCF8", "\uD83D\uDC95", "\u2728", "\uD83C\uDF05"].map((e, i) => (
              <SectionReveal key={i} animation="scaleIn" delay={i * 80}>
                <div
                  className="flex aspect-[3/4] items-center justify-center rounded-3xl text-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${tc.accent}60, ${tc.accent}30)`,
                    border: `2px dashed ${tc.secondary}15`,
                  }}
                >
                  {e}
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </SectionReveal>

      <DashedDivider color={tc.secondary} />

      {/* Things to Know */}
      <SectionReveal>
        <div className="px-6 py-12" style={{ background: tc.bg }}>
          <h2 className="mb-6 text-center text-xl" style={{ color: tc.primary }}>
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
              style={{ borderBottom: i < 3 ? `1px dashed ${tc.text}10` : "none" }}
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

      <DashedDivider color={tc.secondary} />

      {/* Countdown */}
      <SectionReveal>
        <div
          className="relative overflow-hidden px-6 py-12 text-center"
          style={{ background: tc.card }}
        >
          <div className="absolute left-4 top-4 animate-float-gentle text-lg opacity-20">🌸</div>
          <div
            className="absolute bottom-6 right-6 animate-float-gentle text-lg opacity-20"
            style={{ animationDelay: "-2s" }}
          >
            🌷
          </div>
          <h2 className="mb-6 text-xl" style={{ color: tc.primary }}>
            Counting the Days
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
                  className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${tc.primary}12, ${tc.accent}40)`,
                    color: tc.primary,
                    border: `2px dashed ${tc.secondary}20`,
                  }}
                >
                  {String(u.v).padStart(2, "0")}
                </div>
                <span
                  className="mt-1 block font-sans text-[9px] font-medium uppercase tracking-[2px] opacity-35"
                  style={{ color: tc.text }}
                >
                  {u.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <DashedDivider color={tc.secondary} />

      {/* RSVP */}
      <SectionReveal>
        <div className="px-6 py-12 text-center" style={{ background: tc.bg }}>
          <div className="mb-3 text-4xl">💌</div>
          <h2 className="mb-2 text-xl" style={{ color: tc.primary }}>
            RSVP
          </h2>
          <p className="mb-6 font-sans text-xs opacity-40" style={{ color: tc.text }}>
            We'd love to hear from you
          </p>
          <button
            className="w-full rounded-full py-3.5 font-sans text-sm font-semibold uppercase tracking-[2px] text-white"
            style={{
              background: `linear-gradient(135deg, ${tc.primary}, ${tc.secondary})`,
            }}
          >
            \uD83D\uDCAC RSVP on WhatsApp
          </button>
        </div>
      </SectionReveal>

      {/* Footer */}
      <div
        className="relative overflow-hidden px-6 py-14 text-center"
        style={{
          background: `linear-gradient(135deg, ${tc.primary}15, ${tc.accent}40, ${tc.secondary}15)`,
        }}
      >
        <div className="absolute left-8 top-4 animate-float-gentle text-xl opacity-15">🌸</div>
        <div
          className="absolute bottom-4 right-8 animate-float-gentle text-xl opacity-15"
          style={{ animationDelay: "-3s" }}
        >
          💐
        </div>
        <div className="mb-2 text-3xl" style={{ color: tc.primary }}>
          {inv.groomName} & {inv.brideName}
        </div>
        <p className="font-sans text-xs opacity-35" style={{ color: tc.text }}>
          We look forward to celebrating with you!
        </p>
        <p
          className="mt-6 font-sans text-[10px] tracking-[1px] opacity-15"
          style={{ color: tc.text }}
        >
          Made with \u2665 by Invitara
        </p>
      </div>
    </div>
  );
}

function DashedDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-8 py-3">
      <span className="flex-1 border-t-2 border-dashed" style={{ borderColor: color + "15" }} />
      <span className="text-sm opacity-30">✿</span>
      <span className="flex-1 border-t-2 border-dashed" style={{ borderColor: color + "15" }} />
    </div>
  );
}
