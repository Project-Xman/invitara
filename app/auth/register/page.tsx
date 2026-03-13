import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Account — Invitara",
  description: "Sign up for free and get 3 AI credits to create your wedding invitation.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
