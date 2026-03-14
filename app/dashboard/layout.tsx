import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Invitara",
  description: "Manage your wedding invitations, track RSVPs, and view analytics.",
  robots: { index: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
