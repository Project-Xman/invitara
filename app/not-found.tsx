import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        fontFamily: "var(--font-body, system-ui)",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 540,
          textAlign: "center",
          padding: 40,
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>💌</div>
        <h1 style={{ fontSize: 32, color: "#8a6d2a", marginBottom: 12 }}>Invite not found</h1>
        <p style={{ color: "#6b6056", marginBottom: 28, lineHeight: 1.6 }}>
          The page or invitation you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              padding: "12px 24px",
              background: "#D4A853",
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Go home
          </Link>
          <Link
            href="/templates"
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#8a6d2a",
              border: "1px solid #e8d9b0",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Browse templates
          </Link>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Not Found — Invitara",
  description: "We couldn't find that page or invitation.",
};
