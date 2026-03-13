import { useState } from "react";

export function ShareModal({
  groomName,
  brideName,
  slug,
  onClose,
}: {
  groomName: string;
  brideName: string;
  slug?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  // Use real slug-based URL when available, otherwise fall back to a placeholder
  const origin = typeof window !== "undefined" ? window.location.origin : "https://invitara.app";
  const link = slug
    ? `${origin}/invite/${slug}`
    : `${origin}/invite/${groomName.toLowerCase().replace(/\s+/g, "-")}-weds-${brideName.toLowerCase().replace(/\s+/g, "-")}`;

  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`You're invited! 💌\n${groomName} weds ${brideName}\n\n${link}`)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`${groomName} & ${brideName}'s Wedding Invitation`)}&body=${encodeURIComponent(`You're cordially invited!\n\nView our invitation: ${link}`)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(`You're invited to ${groomName} & ${brideName}'s wedding! ${link}`)}`;

  const channels = [
    { icon: "💬", name: "WhatsApp", href: whatsappUrl },
    { icon: "✉️", name: "Email", href: emailUrl },
    { icon: "💌", name: "SMS", href: smsUrl },
    { icon: "📋", name: "Copy Link", href: undefined },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" role="presentation">
      <button
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close modal"
        tabIndex={0}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share your invitation"
        className="relative w-full max-w-md animate-fade-up rounded-3xl bg-white p-8 shadow-gold-xl"
      >
        <div className="absolute -top-3 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        <div className="mb-6 text-center">
          <div className="mb-3 text-3xl">✨</div>
          <h2 className="font-display text-2xl font-bold">Share Your Invite</h2>
          <p className="mt-1 text-sm opacity-45">
            {slug ? "Your invitation is live!" : "Save your invite to get a shareable link."}
          </p>
        </div>
        <div className="mb-6 flex gap-2">
          <input readOnly value={link} className="input-gold flex-1 !py-2.5 font-mono !text-sm" />
          <button onClick={copy} className="btn-gold shrink-0 !px-5 !py-2.5 !text-[11px]">
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3">
          {channels.map((ch) => (
            <button
              key={ch.name}
              onClick={ch.href ? () => window.open(ch.href, "_blank") : copy}
              className="rounded-xl border border-gold-200/20 p-4 text-center transition-all hover:bg-gold-50"
            >
              <div className="mb-1.5 text-2xl">{ch.icon}</div>
              <div className="text-xs font-semibold">{ch.name}</div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full rounded-xl border border-gold-200/30 py-3 text-sm font-medium transition-all hover:bg-cream-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
