import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invitation Editor — Invitara",
  description: "Customise your wedding invitation with AI-powered templates and real-time preview.",
  robots: { index: false },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
