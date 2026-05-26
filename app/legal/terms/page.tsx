import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Invitara",
  description: "Terms that govern your use of Invitara.",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", lineHeight: 1.7, color: "#3c2f18" }}>
      <h1 style={{ color: "#8a6d2a" }}>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <h2>1. Accounts</h2>
      <p>You must be 18+ to create an account. Keep your credentials safe. You are responsible for activity under your account.</p>

      <h2>2. Acceptable use</h2>
      <p>No hate speech, illegal content, spam, or impersonation. No reverse-engineering or scraping our systems. We reserve the right to suspend abusive accounts.</p>

      <h2>3. Plans &amp; payments</h2>
      <p>Plans are billed via Razorpay. Subscriptions renew unless cancelled before the renewal date. Credit packs are one-time purchases.</p>

      <h2>4. Refunds</h2>
      <p>Refunds are available within 7 days of a plan purchase if you haven&apos;t published an invitation. Credit packs and template purchases are non-refundable once used.</p>

      <h2>5. Content ownership</h2>
      <p>You own the content you create. By publishing an invitation, you grant Invitara a worldwide license to host, display, and process it for the duration of your account.</p>

      <h2>6. Liability</h2>
      <p>Invitara is provided &quot;as is&quot;. We are not liable for indirect damages. Total liability capped at fees paid in the prior 12 months.</p>

      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of India; disputes go to the courts of Bengaluru, Karnataka.</p>

      <h2>8. Contact</h2>
      <p>Questions? Email <a href="mailto:support@invitara.com">support@invitara.com</a>.</p>
    </main>
  );
}
