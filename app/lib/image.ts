/**
 * Image transformation helpers. Default to Next.js Image component, which
 * handles resize + AVIF/WebP via /_next/image.
 *
 * For external CDN transforms (Cloudinary, imgix, ImageKit), set IMAGE_CDN_URL
 * and use buildCdnUrl(src, opts).
 */

import { env } from "./env";

export interface ResizeOpts {
  w?: number;
  h?: number;
  q?: number;
  fit?: "cover" | "contain" | "scale-down";
  format?: "auto" | "webp" | "avif" | "jpeg";
}

/** Build an optimized image URL via Next.js or external CDN. */
export function optimizedSrc(src: string, opts: ResizeOpts = {}): string {
  if (!src) return src;

  // External CDN — Cloudinary URL style ("/c_fill,w_800,h_600,q_auto,f_auto/")
  if (env.IMAGE_CDN_URL && /^https?:\/\//.test(src)) {
    if (env.IMAGE_CDN_URL.includes("cloudinary.com")) {
      const params: string[] = [];
      if (opts.w) params.push(`w_${opts.w}`);
      if (opts.h) params.push(`h_${opts.h}`);
      if (opts.fit === "cover") params.push("c_fill");
      else if (opts.fit === "contain") params.push("c_fit");
      params.push(`q_${opts.q ?? "auto"}`);
      params.push(`f_${opts.format ?? "auto"}`);
      const transform = params.join(",");
      return `${env.IMAGE_CDN_URL.replace(/\/$/, "")}/${transform}/${encodeURIComponent(src)}`;
    }
    // imgix/ImageKit-style query params
    const url = new URL(src);
    if (opts.w) url.searchParams.set("w", String(opts.w));
    if (opts.h) url.searchParams.set("h", String(opts.h));
    if (opts.q) url.searchParams.set("q", String(opts.q));
    if (opts.format && opts.format !== "auto") url.searchParams.set("fm", opts.format);
    return url.toString();
  }

  // Default: Next.js image optimizer
  if (!opts.w) return src;
  const params = new URLSearchParams({
    url: src,
    w: String(opts.w),
    q: String(opts.q ?? 75),
  });
  return `/_next/image?${params}`;
}

export function srcSet(src: string, widths: number[], opts: Omit<ResizeOpts, "w"> = {}): string {
  return widths.map((w) => `${optimizedSrc(src, { ...opts, w })} ${w}w`).join(", ");
}
