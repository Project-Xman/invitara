import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Invitara",
  description:
    "Simple, transparent pricing for beautiful AI-powered wedding invitations. Free to start, pay only when you publish.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
