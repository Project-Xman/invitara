import { useState } from "react";
import {
  MessageCircle,
  Mail,
  MessageSquare,
  Twitter,
  Users,
  Copy,
  Check,
  Sparkles,
  X,
} from "lucide-react";

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

  const origin = typeof window !== "undefined" ? window.location.origin : "https://invitara.app";
  const link = slug
    ? `${origin}/invite/${slug}`
    : `${origin}/invite/${groomName.toLowerCase().replace(/\s+/g, "-")}-weds-${brideName.toLowerCase().replace(/\s+/g, "-")}`;

  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `You're invited!\n${groomName} weds ${brideName}\n\n${link}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`${groomName} & ${brideName}'s Wedding Invitation`)}&body=${encodeURIComponent(`You're cordially invited!\n\nView our invitation: ${link}`)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(`You're invited to ${groomName} & ${brideName}'s wedding! ${link}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${groomName} & ${brideName} are getting married! ${link}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;

  const channels = [
    { icon: <MessageCircle className="h-5 w-5" />, name: "WhatsApp", href: whatsappUrl },
    { icon: <Mail className="h-5 w-5" />, name: "Email", href: emailUrl },
    { icon: <MessageSquare className="h-5 w-5" />, name: "SMS", href: smsUrl },
    { icon: <Twitter className="h-5 w-5" />, name: "Twitter / X", href: twitterUrl },
    { icon: <Users className="h-5 w-5" />, name: "Facebook", href: facebookUrl },
    { icon: <Copy className="h-5 w-5" />, name: "Copy Link", href: undefined },
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
        className="relative w-full max-w-md animate-fade-up rounded-3xl bg-card p-8 shadow-gold-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="absolute -top-3 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold">Share Your Invite</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {slug ? "Your invitation is live!" : "Save your invite to get a shareable link."}
          </p>
        </div>
        <div className="mb-6 flex gap-2">
          <input readOnly value={link} className="input-gold flex-1 !py-2.5 font-mono !text-sm" />
          <button onClick={copy} className="btn-gold shrink-0 !px-5 !py-2.5 !text-[11px]">
            {copied ? (
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Copied</span>
            ) : (
              <span className="flex items-center gap-1"><Copy className="h-3.5 w-3.5" /> Copy</span>
            )}
          </button>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-3">
          {channels.map((ch) => (
            <button
              key={ch.name}
              onClick={ch.href ? () => window.open(ch.href, "_blank") : copy}
              className="rounded-xl border border-border p-4 text-center transition-all hover:bg-accent"
            >
              <div className="mb-1.5 flex justify-center text-primary">{ch.icon}</div>
              <div className="text-xs font-semibold">{ch.name}</div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full rounded-xl border border-border py-3 text-sm font-medium transition-all hover:bg-accent"
        >
          Close
        </button>
      </div>
    </div>
  );
}
