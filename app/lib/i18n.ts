/**
 * Lightweight i18n. Loads message catalogs per locale + provides a `t()` helper.
 * For deep i18n (URL routing, ICU MessageFormat), upgrade to next-intl.
 */

import en from "./locales/en.json";
import hi from "./locales/hi.json";

export type Locale = "en" | "hi" | "ta" | "te" | "ml" | "bn" | "mr" | "gu";

const SUPPORTED: Locale[] = ["en", "hi", "ta", "te", "ml", "bn", "mr", "gu"];

const catalogs: Partial<Record<Locale, Record<string, string>>> = {
  en,
  hi,
};

export function isSupportedLocale(loc: string | null | undefined): loc is Locale {
  return !!loc && (SUPPORTED as string[]).includes(loc);
}

export function pickLocale(input?: string | null): Locale {
  if (isSupportedLocale(input)) return input;
  return "en";
}

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const catalog = catalogs[locale] ?? catalogs.en ?? {};
  let s = catalog[key] ?? catalogs.en?.[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}

export const SUPPORTED_LOCALES = SUPPORTED;
