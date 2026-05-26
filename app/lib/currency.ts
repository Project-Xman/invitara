/**
 * Currency conversion. INR is base. Static rates fallback — wire to a live FX
 * source (exchangerate.host / openexchangerates.org) in production.
 */

export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD" | "AUD" | "CAD";

const RATES_FROM_INR: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
};

const SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
};

/** Convert INR major-unit price to target currency major unit, rounded. */
export function convertFromInr(inrMajor: number, target: Currency): number {
  return Math.round(inrMajor * (RATES_FROM_INR[target] ?? 1) * 100) / 100;
}

export function format(amount: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${SYMBOLS[currency] ?? currency} ${amount.toFixed(2)}`;
  }
}

export function detectCurrencyFromCountry(country?: string | null): Currency {
  if (!country) return "INR";
  const c = country.toUpperCase();
  const map: Record<string, Currency> = {
    IN: "INR",
    US: "USD",
    GB: "GBP",
    UK: "GBP",
    AE: "AED",
    SG: "SGD",
    AU: "AUD",
    CA: "CAD",
    DE: "EUR",
    FR: "EUR",
    ES: "EUR",
    IT: "EUR",
    NL: "EUR",
  };
  return map[c] ?? "INR";
}
