import { useCountdown, useFormattedDate } from "./shared/hooks";
import { SectionReveal } from "./shared/SectionReveal";
import type { TemplateProps } from "./shared/types";
import { PhotoGallery } from "./shared/PhotoGallery";

export default function CityTemplate({
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
      style={{ background: tc.bg, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Hero - Dark metro with gold geometric accents */}
      <div
        className="relative flex min-h-[500px] items-center justify-center overflow-hidden"
        style={{ background: "#0A0A0A" }}
      >
        {/* Diagonal gold line pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 20px, #D4A853 20px, #D4A853 21px)",
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(212,168,83,0.06) 100%)",
          }}
        />
        {/* Gold geometric corner frames - Art Deco style */}
        <div className="absolute left-6 top-6 h-20 w-20">
          <div
            className="absolute left-0 top-0 h-[2px] w-full"
            style={{ background: tc.primary }}
          />
          <div
            className="absolute left-0 top-0 h-full w-[2px]"
            style={{ background: tc.primary }}
          />
          <div
            className="absolute left-2 top-2 h-2 w-2 rotate-45"
            style={{ background: tc.primary }}
          />
        </div>
        <div className="absolute right-6 top-6 h-20 w-20">
          <div
            className="absolute right-0 top-0 h-[2px] w-full"
            style={{ background: tc.primary }}
          />
          <div
            className="absolute right-0 top-0 h-full w-[2px]"
            style={{ background: tc.primary }}
          />
          <div
            className="absolute right-2 top-2 h-2 w-2 rotate-45"
            style={{ background: tc.primary }}
          />
        </div>
        <div className="absolute bottom-6 left-6 h-20 w-20">
          <div
            className="absolute bottom-0 left-0 h-[2px] w-full"
            style={{ background: tc.primary }}
          />
          <div
            className="absolute bottom-0 left-0 h-full w-[2px]"
            style={{ background: tc.primary }}
          />
          <div
            className="absolute bottom-2 left-2 h-2 w-2 rotate-45"
            style={{ background: tc.primary }}
          />
        </div>
        <div className="absolute bottom-6 right-6 h-20 w-20">
          <div
            className="absolute bottom-0 right-0 h-[2px] w-full"
            style={{ background: tc.primary }}
          />
          <div
            className="absolute bottom-0 right-0 h-full w-[2px]"
            style={{ background: tc.primary }}
          />
          <div
            className="absolute bottom-2 right-2 h-2 w-2 rotate-45"
            style={{ background: tc.primary }}
          />
        </div>
        {/* Content */}
        <div className="relative z-10 px-8 py-20 text-center">
          <p
            className="mb-8 text-[9px] font-medium uppercase tracking-[8px]"
            style={{ color: tc.primary + "80" }}
          >
            You're Cordially Invited
          </p>
          <h1 className="font-display text-[46px] leading-none tracking-wide text-white">
            {inv.groomName}
          </h1>
          <div className="my-4 flex items-center justify-center gap-5">
            <span className="h-px w-14" style={{ background: tc.primary + "40" }} />
            <span className="font-display text-xl italic" style={{ color: tc.primary }}>
              &
            </span>
            <span className="h-px w-14" style={{ background: tc.primary + "40" }} />
          </div>
          <h1 className="font-display text-[46px] leading-none tracking-wide text-white">
            {inv.brideName}
          </h1>
          <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${tc.primary}25` }}>
            <p
              className="text-[10px] uppercase tracking-[4px]"
              style={{ color: tc.primary + "90" }}
            >
              {dateStr}
            </p>
            <p
              className="mt-1 text-[10px] uppercase tracking-[3px]"
              style={{ color: tc.primary + "50" }}
            >
              {inv.venue || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Gold divider line */}
      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tc.primary}40, transparent)` }}
      />

      {/* Blessings */}
      <SectionReveal>
        <div className="px-6 py-14 text-center" style={{ background: tc.card }}>
          <p className="mb-2 text-lg" style={{ color: tc.secondary }}>
            {inv.mantra ||
              "\u0950 \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903"}
          </p>
          <div
            className="mx-auto my-4 flex h-8 w-8 items-center justify-center"
            style={{ border: `1px solid ${tc.primary}30` }}
          >
            <div className="h-3 w-3 rotate-45" style={{ background: tc.primary + "30" }} />
          </div>
          <p className="text-sm opacity-50" style={{ color: tc.text }}>
            With divine blessings of
          </p>
          <p className="mt-2 font-display text-lg font-semibold" style={{ color: tc.primary }}>
            {inv.blessingFrom || ""}
          </p>
          <div className="my-6 flex items-center justify-center gap-4">
            <span className="h-px w-10" style={{ background: tc.primary + "30" }} />
            <span
              className="text-[9px] font-semibold uppercase tracking-[6px]"
              style={{ color: tc.primary }}
            >
              INVITE
            </span>
            <span className="h-px w-10" style={{ background: tc.primary + "30" }} />
          </div>
          <p className="text-sm opacity-50" style={{ color: tc.text }}>
            You to the wedding celebrations of
          </p>
          <p className="mt-3 font-display text-2xl font-bold" style={{ color: tc.primary }}>
            {inv.groomName} <span className="font-body text-base opacity-30">&</span>{" "}
            {inv.brideName}
          </p>
          {inv.groomFamily && (
            <p className="mt-4 text-xs opacity-40" style={{ color: tc.text }}>
              Son of {inv.groomFamily}
            </p>
          )}
          {inv.brideFamily && (
            <p className="mt-1 text-xs opacity-40" style={{ color: tc.text }}>
              Daughter of {inv.brideFamily}
            </p>
          )}
        </div>
      </SectionReveal>

      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tc.primary}25, transparent)` }}
      />

      {/* Events - Horizontal timeline style */}
      <div className="px-5 py-12" style={{ background: tc.bg }}>
        <SectionReveal>
          <h2
            className="mb-1 text-center font-display text-2xl font-bold"
            style={{ color: tc.primary }}
          >
            The Celebrations
          </h2>
          <p className="mb-10 text-center text-sm opacity-40" style={{ color: tc.text }}>
            A timeline of festivities
          </p>
        </SectionReveal>
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute bottom-0 left-[22px] top-0 w-px"
            style={{ background: tc.primary + "20" }}
          />
          <div className="space-y-0">
            {events.map((ev, i) => (
              <SectionReveal key={ev.id} animation="slideRight" delay={i * 120}>
                <div className="relative flex gap-4 py-4">
                  {/* Timeline dot */}
                  <div
                    className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lg"
                    style={{ background: tc.card, borderColor: ev.color + "30" }}
                  >
                    {ev.icon}
                  </div>
                  <div
                    className="flex-1 rounded-lg border p-4"
                    style={{ borderColor: tc.primary + "10", background: tc.card }}
                  >
                    <h3 className="font-display text-base font-semibold" style={{ color: tc.text }}>
                      {ev.name}
                    </h3>
                    <p className="mt-1 text-[11px] opacity-50" style={{ color: tc.text }}>
                      {ev.date} {ev.time && `\u00B7 ${ev.time}`}
                    </p>
                    <p className="text-[11px] opacity-40" style={{ color: tc.text }}>
                      {ev.venue}
                    </p>
                    <div
                      className="mt-2 text-[9px] font-semibold uppercase tracking-[1.5px]"
                      style={{ color: ev.color }}
                    >
                      \uD83D\uDCCD See the Route \u2192
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>

      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tc.primary}25, transparent)` }}
      />

      {/* Message */}
      {inv.message && (
        <SectionReveal>
          <div className="px-8 py-14 text-center" style={{ background: tc.card }}>
            <div className="mx-auto mb-6 h-px w-8" style={{ background: tc.primary + "40" }} />
            <p
              className="mb-4 text-[9px] font-semibold uppercase tracking-[5px]"
              style={{ color: tc.primary }}
            >
              A Note from Us
            </p>
            <p
              className="mx-auto max-w-sm font-body text-sm leading-[2] opacity-55"
              style={{ color: tc.text }}
            >
              {inv.message}
            </p>
            <div className="mx-auto mt-6 h-px w-8" style={{ background: tc.primary + "40" }} />
          </div>
        </SectionReveal>
      )}

      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tc.primary}25, transparent)` }}
      />

      {/* Gallery */}
      <SectionReveal>
        <div className="px-5 py-12" style={{ background: tc.bg }}>
          <h2
            className="mb-6 text-center font-display text-xl font-bold"
            style={{ color: tc.primary }}
          >
            Our Moments
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {["\uD83D\uDCF8", "\uD83D\uDC95", "\u2728", "\uD83C\uDF05"].map((e, i) => (
              <div
                key={i}
                className="flex aspect-[3/4] items-center justify-center rounded-lg border text-3xl"
                style={{ background: tc.accent + "40", borderColor: tc.primary + "08" }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tc.primary}25, transparent)` }}
      />

      {/* Things to Know */}
      <SectionReveal>
        <div className="px-6 py-12" style={{ background: tc.card }}>
          <h2
            className="mb-6 text-center font-display text-xl font-bold"
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
              style={{ borderBottom: i < 3 ? `1px solid ${tc.primary}08` : "none" }}
            >
              <span className="w-8 shrink-0 text-center text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: tc.text }}>
                  {item.title}
                </p>
                <p className="text-xs opacity-40" style={{ color: tc.text }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionReveal>

      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tc.primary}25, transparent)` }}
      />

      {/* RSVP */}
      <SectionReveal>
        <div className="px-6 py-12 text-center" style={{ background: tc.bg }}>
          <div className="mb-3 text-4xl">💌</div>
          <h2 className="mb-2 font-display text-xl font-bold" style={{ color: tc.primary }}>
            RSVP
          </h2>
          <button
            className="w-full rounded-lg py-3.5 text-sm font-semibold uppercase tracking-[2px] text-white"
            style={{ background: tc.primary }}
          >
            💬 RSVP on WhatsApp
          </button>
        </div>
      </SectionReveal>

      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tc.primary}25, transparent)` }}
      />

      {/* Countdown */}
      <SectionReveal>
        <div className="px-6 py-12 text-center" style={{ background: tc.card }}>
          <h2 className="mb-6 font-display text-xl font-bold" style={{ color: tc.primary }}>
            The Countdown
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
                  className="flex h-16 w-16 items-center justify-center rounded-lg border font-display text-2xl font-bold"
                  style={{
                    borderColor: tc.primary + "15",
                    color: tc.primary,
                    background: tc.primary + "06",
                  }}
                >
                  {String(u.v).padStart(2, "0")}
                </div>
                <span
                  className="mt-1 block text-[9px] font-medium uppercase tracking-[2px] opacity-35"
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
      <div className="px-6 py-14 text-center" style={{ background: "#0A0A0A" }}>
        <div className="mb-2 font-display text-2xl tracking-wide text-white">
          {inv.groomName} & {inv.brideName}
        </div>
        <p className="text-xs text-white opacity-25">We look forward to celebrating with you!</p>
        <p className="mt-6 text-[10px] tracking-[1px] text-white opacity-10">
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
