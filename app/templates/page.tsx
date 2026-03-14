import type { Metadata } from "next";
import TemplatesClient from "./TemplatesClient";

export const metadata: Metadata = {
  title: "Wedding Invitation Templates — Invitara",
  description: "Browse beautiful wedding invitation templates for Hindu, Christian, Sikh, Muslim, and South-Indian weddings.",
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
