import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account — Invitara",
  description: "Sign in or create your Invitara account to manage your wedding invitations.",
  robots: { index: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
