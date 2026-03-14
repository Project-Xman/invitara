import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailInner } from "./VerifyEmailInner";

export const metadata: Metadata = {
  title: "Verify Email — Invitara",
  description: "Verify your Invitara email address to activate your account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-[68px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
