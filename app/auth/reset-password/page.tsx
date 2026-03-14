import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordInner } from "./ResetPasswordInner";

export const metadata: Metadata = {
  title: "Reset Password — Invitara",
  description: "Set a new password for your Invitara account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-[68px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
