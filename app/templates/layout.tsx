import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Invitation Templates — Invitara",
  description:
    "Browse beautiful wedding invitation templates — Beach, Mountain, City, and more. Buy once, personalise with AI.",
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
