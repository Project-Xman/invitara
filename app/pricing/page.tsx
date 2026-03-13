import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — Invitara",
  description: "Simple, transparent pricing for wedding invitation websites. One purchase, lifetime access.",
};

export default function PricingPage() {
  return <PricingClient />;
}
