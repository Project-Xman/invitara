import { useCountdown, useFormattedDate } from "./shared/hooks";
import { SectionReveal } from "./shared/SectionReveal";
import type { TemplateProps } from "./shared/types";
import { PhotoGallery } from "./shared/PhotoGallery";

const FOUR_LAAVAN = [
  { num: 1, text: "The first Laav - Begin the journey of love and dharma together." },
  { num: 2, text: "The second Laav - Walk the path of devotion and mutual respect." },
  { num: 3, text: "The third Laav - Embrace detachment from the world's distractions." },
  { num: 4, text: "The fourth Laav - Find eternal union and divine bliss together." },
];

export default function LaavanTemplate({
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
      {/* Hero - Saffron gradient with arch frame */}
      <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: t.gradient }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.15) 0%, transparent 60%)",
          }}
        />
        {/* Arch frame */}
        <div
          className="absolute inset-6 overflow-hidden rounded-t-[50%]"
          style={{ border: `2px solid ${tc.secondary}35` }}
        >
          <div
            className="absolute inset-2 rounded-t-[50%]"
            style={{ border: `1px solid ${tc.secondary}20` }}
          />
        </div>
        {/* Scalloped top edge */}
        <div
          className="absolute left-0 right-0 top-0 h-4"
          style={{
            background: `radial-gradient(circle at 50% 0%, transparent 6px, ${tc.primary}15 6px, ${tc.primary}15 7px, transparent 7px)`,
            backgroundSize: "16px 16px",
            backgroundPosition: "0 -8px",
          }}
        />
        {/* Content */}
        <div className="relative z-10 px-8 py-20 text-center text-white">
          <p className="mb-2 text-lg" style={{ color: "#FFFFFF90" }}>
            &#x0A74;
          </p>
          <p className="mb-6 font-sans text-[9px] font-medium uppercase tracking-[6px] opacity-50">
            Satguru Prasaad
          </p>
          <h1 className="font-script text-[52px] leading-none drop-shadow-lg">{inv.groomName}</h1>
          <div className="my-3 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-white/25" />
            <span className="font-display text-sm uppercase tracking-[6px] opacity-70">Weds</span>
            <span className="h-px w-12 bg-white/25" />
          </div>
          <h1 className="font-script text-[52px] leading-none drop-shadow-lg">{inv.brideName}</h1>
          <div className="mt-8 border-t border-white/15 pt-5">
            <p className="font-sans text-xs uppercase tracking-[3px] opacity-50">{dateStr}</p>
            <p className="mt-1 font-sans text-[10px] uppercase tracking-[2px] opacity-30">
              {inv.venue || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Scalloped divider */}
      <ScallopedDivider color={tc.secondary} bgColor={tc.card} />

      {/* Blessings - Ardaas style */}
      <SectionReveal>
        <div className="px-6 py-14 text-center" style={{ background: tc.card }}>
          <p className="mb-3 text-xl" style={{ color: tc.secondary }}>
            {inv.mantra || "Ik Onkaar Satguru Prasaad"}
          </p>
          <div className="mb-4 text-3xl">🙏</div>
          <p className="font-sans text-sm opacity-50" style={{ color: tc.text }}>
            With Waheguru's blessings and through
          </p>
          <p className="mt-2 font-display text-lg font-semibold" style={{ color: tc.primary }}>
            {inv.blessingFrom || ""}
          </p>
          <div className="my-6 flex items-center justify-center gap-4">
            <span className="h-px w-10" style={{ background: tc.secondary + "40" }} />
            <span
              className="font-sans text-[9px] font-semibold uppercase tracking-[5px]"
              style={{ color: tc.secondary }}
            >
              INVITE YOU
            </span>
            <span className="h-px w-10" style={{ background: tc.secondary + "40" }} />
          </div>
          <p className="font-sans text-sm opacity-45" style={{ color: tc.text }}>
            To the Anand Karaj ceremony of
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

      <ScallopedDivider color={tc.secondary} bgColor={tc.bg} />

      {/* Four Laavan Section - Unique feature */}
      <div className="px-6 py-14" style={{ background: tc.bg }}>
        <SectionReveal>
          <h2
            className="mb-2 text-center font-display text-2xl font-bold"
            style={{ color: tc.primary }}
          >
            The Four Laavan
          </h2>
          <p className="mb-10 text-center font-sans text-sm opacity-40" style={{ color: tc.text }}>
            Four rounds of the sacred Guru Granth Sahib
          </p>
        </SectionReveal>
        <div className="relative">
          {/* Connecting gold line */}
          <div
            className="absolute bottom-6 left-6 top-6 w-px"
            style={{ background: tc.secondary + "30" }}
          />
          <div className="space-y-6">
            {FOUR_LAAVAN.map((laav, i) => (
              <SectionReveal key={laav.num} animation="slideRight" delay={i * 150}>
                <div className="flex items-start gap-4">
                  {/* Numbered circle */}
                  <div
                    className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl font-bold"
                    style={{
                      background: tc.card,
                      color: tc.primary,
                      border: `2px solid ${tc.secondary}40`,
                      boxShadow: `0 0 0 4px ${tc.bg}`,
                    }}
                  >
                    {laav.num}
                  </div>
                  <div
                    className="flex-1 rounded-xl p-4"
                    style={{
                      background: tc.card,
                      border: `1px solid ${tc.secondary}15`,
                    }}
                  >
                    <p className="text-sm leading-relaxed opacity-55" style={{ color: tc.text }}>
                      {laav.text}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>

      <ScallopedDivider color={tc.secondary} bgColor={tc.card} />

      {/* Events */}
      <div className="px-5 py-12" style={{ background: tc.card }}>
        <SectionReveal>
          <h2
            className="mb-1 text-center font-display text-2xl font-bold"
            style={{ color: tc.primary }}
          >
            Celebrations
          </h2>
          <p className="mb-8 text-center font-sans text-sm opacity-40" style={{ color: tc.text }}>
            Join us in these joyous moments
          </p>
        </SectionReveal>
        <div className="space-y-3">
          {events.map((ev, i) => (
            <SectionReveal key={ev.id} animation="fadeUp" delay={i * 100}>
              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: ev.color + "18", background: tc.bg }}
              >
                <div className="flex items-center gap-3.5 p-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
                    style={{ background: ev.color + "10", border: `1px solid ${ev.color}20` }}
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

      <ScallopedDivider color={tc.secondary} bgColor={tc.bg} />

      {/* Message */}
      {inv.message && (
        <SectionReveal>
          <div className="px-8 py-14 text-center" style={{ background: tc.bg }}>
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

      <ScallopedDivider color={tc.secondary} bgColor={tc.card} />

      {/* Gallery */}
      <SectionReveal>
        <div className="px-5 py-12" style={{ background: tc.card }}>
          <h2
            className="mb-6 text-center font-display text-xl font-bold"
            style={{ color: tc.primary }}
          >
            Our Moments
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {["\uD83D\uDCF8", "\uD83D\uDC95", "\u2728", "\uD83C\uDF05"].map((e, i) => (
              <div
                key={i}
                className="flex aspect-[3/4] items-center justify-center rounded-xl text-3xl"
                style={{ background: tc.accent + "55" }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Things to Know */}
      <SectionReveal>
        <div className="px-5 py-12" style={{ background: tc.bg }}>
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
        <div className="px-6 py-12 text-center" style={{ background: tc.card }}>
          <div className="mb-3 text-4xl">💌</div>
          <h2 className="mb-2 font-display text-xl font-bold" style={{ color: tc.primary }}>
            RSVP
          </h2>
          <button
            className="w-full rounded-full py-3.5 font-sans text-sm font-semibold uppercase tracking-[2px] text-white shadow-gold"
            style={{ background: tc.primary }}
          >
            \uD83D\uDCAC RSVP on WhatsApp
          </button>
        </div>
      </SectionReveal>

      {/* Countdown */}
      <SectionReveal>
        <div className="px-6 py-12 text-center" style={{ background: tc.bg }}>
          <h2 className="mb-6 font-display text-xl font-bold" style={{ color: tc.primary }}>
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
                  className="flex h-16 w-16 items-center justify-center rounded-full font-display text-2xl font-bold"
                  style={{
                    background: tc.primary + "0A",
                    color: tc.primary,
                    border: `1.5px solid ${tc.secondary}20`,
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

      {/* Footer */}
      <div
        className="relative overflow-hidden px-6 py-14 text-center"
        style={{ background: t.gradient }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 100%)",
          }}
        />
        <div className="relative z-10">
          <p className="mb-2 text-xl text-white opacity-60">&#x0A74;</p>
          <div className="mb-2 font-script text-3xl text-white drop-shadow-lg">
            {inv.groomName} & {inv.brideName}
          </div>
          <p className="text-xs text-white opacity-30">
            Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh
          </p>
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

function ScallopedDivider({ color, bgColor }: { color: string; bgColor: string }) {
  return (
    <div className="relative h-5 overflow-hidden" style={{ background: bgColor }}>
      <div
        className="absolute inset-x-0 top-0 h-3"
        style={{
          backgroundImage: `radial-gradient(circle at 8px 0px, transparent 7px, ${color}15 7px, ${color}15 8px, transparent 8px)`,
          backgroundSize: "16px 16px",
        }}
      />
    </div>
  );
}
