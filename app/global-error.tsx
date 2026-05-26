"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void (async () => {
      try {
        const { captureException } = await import("~/lib/sentry");
        await captureException(error, { digest: error.digest });
      } catch {}
    })();
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "linear-gradient(135deg, #fefdf8, #fbf6e8)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: "center",
            background: "white",
            borderRadius: 16,
            padding: 40,
            boxShadow: "0 20px 60px rgba(212,168,83,0.18)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>💔</div>
          <h1 style={{ fontSize: 24, color: "#8a6d2a", marginBottom: 8 }}>
            Something broke
          </h1>
          <p style={{ color: "#6b6056", marginBottom: 24, lineHeight: 1.6 }}>
            We&apos;ve been notified and will fix this shortly. Try again, or head back home.
          </p>
          {error.digest ? (
            <p style={{ fontSize: 12, color: "#bba", marginBottom: 16 }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 20px",
                background: "#D4A853",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "10px 20px",
                background: "white",
                color: "#8a6d2a",
                border: "1px solid #e8d9b0",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
