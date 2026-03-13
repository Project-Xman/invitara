import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Forgot Password — Invitara",
  description: "Reset your Invitara account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
