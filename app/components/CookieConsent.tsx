"use client";

import { useEffect, useState } from "react";

const KEY = "invitara_cookie_consent_v1";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(KEY);
    if (!v) setShow(true);
  }, []);

  const accept = (level: "all" | "essential") => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ level, ts: Date.now() }));
      // Inform server via beacon for cookieConsentAt audit
      navigator.sendBeacon?.("/api/account/cookie-consent", JSON.stringify({ level }));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 540,
        margin: "0 auto",
        background: "white",
        borderRadius: 14,
        boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
        border: "1px solid #e8d9b0",
        padding: 18,
        zIndex: 9999,
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <div style={{ color: "#5c4a1a", marginBottom: 10 }}>
        We use cookies for essentials (login, payments) and analytics to improve Invitara.
        Read our <a href="/legal/privacy" style={{ color: "#8a6d2a", textDecoration: "underline" }}>privacy policy</a>.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => accept("all")}
          style={{ background: "#D4A853", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
        >
          Accept all
        </button>
        <button
          onClick={() => accept("essential")}
          style={{ background: "white", color: "#8a6d2a", border: "1px solid #e8d9b0", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
