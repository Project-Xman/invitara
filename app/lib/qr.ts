/**
 * QR code generation. Uses goqr.me (api.qrserver.com) — no install needed.
 * Returns a PNG URL suitable for <img src>.
 *
 * For UPI payment QR: pass upi://pay?pa=...&pn=...&am=...
 */

export interface QrOpts {
  size?: number;
  margin?: number;
  ecc?: "L" | "M" | "Q" | "H";
  bgColor?: string;
  fgColor?: string;
}

export function qrUrl(data: string, opts: QrOpts = {}): string {
  const params = new URLSearchParams({
    data,
    size: `${opts.size ?? 512}x${opts.size ?? 512}`,
    margin: String(opts.margin ?? 2),
    ecc: opts.ecc ?? "M",
  });
  if (opts.bgColor) params.set("bgcolor", opts.bgColor.replace("#", ""));
  if (opts.fgColor) params.set("color", opts.fgColor.replace("#", ""));
  return `https://api.qrserver.com/v1/create-qr-code/?${params}`;
}

/** Build a UPI deep link for payee + name + optional amount + note. */
export function upiLink(input: {
  upiId: string;
  payeeName: string;
  amount?: number;
  note?: string;
  currency?: "INR";
}): string {
  const params = new URLSearchParams();
  params.set("pa", input.upiId);
  params.set("pn", input.payeeName);
  if (input.amount && input.amount > 0) params.set("am", input.amount.toFixed(2));
  if (input.note) params.set("tn", input.note);
  params.set("cu", input.currency ?? "INR");
  return `upi://pay?${params}`;
}

export function inviteShareUrl(appUrl: string, slug: string): string {
  return `${appUrl.replace(/\/$/, "")}/invite/${slug}`;
}
