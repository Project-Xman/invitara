import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Invitara",
  description: "How Invitara collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", lineHeight: 1.7, color: "#3c2f18" }}>
      <h1 style={{ color: "#8a6d2a" }}>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <h2>1. Information we collect</h2>
      <p>Account data (name, email, phone), invitation content you create, payment metadata, RSVPs received, and basic analytics (page views, device, country).</p>

      <h2>2. How we use it</h2>
      <ul>
        <li>To run your account and deliver invitations to guests.</li>
        <li>To process payments via Razorpay (we never store full card numbers).</li>
        <li>To send transactional email (verification, RSVPs, receipts).</li>
        <li>To analyze usage in aggregate and improve the product.</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>We share data only with the processors that power Invitara: Razorpay (payments), Resend (email), Vercel (hosting + blob storage), Cloudflare (CAPTCHA), Meta (WhatsApp Business). We do not sell your data.</p>

      <h2>4. Your rights (GDPR / DPDP)</h2>
      <p>You may request a data export, correction, or deletion at any time:</p>
      <ul>
        <li><strong>Export:</strong> <code>/api/account/export</code></li>
        <li><strong>Delete:</strong> from your account page (30-day grace).</li>
      </ul>

      <h2>5. Retention</h2>
      <p>We keep account data while your account exists. On deletion, content is removed within 30 days, except records required by law (payments, tax — retained 7 years).</p>

      <h2>6. Cookies</h2>
      <p>Essential cookies for auth + payments; optional analytics cookies that you control via the consent banner.</p>

      <h2>7. Contact</h2>
      <p>Questions? Email <a href="mailto:privacy@invitara.com">privacy@invitara.com</a>.</p>
    </main>
  );
}
