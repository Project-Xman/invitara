import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In — Invitara",
  description: "Sign in to manage your wedding invitations.",
};

export default function LoginPage() {
  return <LoginClient />;
}
