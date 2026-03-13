"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import * as actions from "~/lib/actions";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }
    actions
      .verifyEmail({ token })
      .then(() => setStatus("success"))
      .catch((err: any) => {
        setStatus("error");
        setMessage(err?.message || "Verification failed. The link may have expired.");
      });
  }, [token]);

  return (
    <div className="bg-dots-gold flex min-h-screen items-center justify-center px-6 pt-[68px]">
      <div className="w-full max-w-md animate-fade-up text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
            <p className="text-sm opacity-50">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <div className="rounded-2xl border border-gold-200/15 bg-white p-8 shadow-card">
            <div className="mb-3 text-4xl">✅</div>
            <h1 className="mb-2 font-display text-2xl font-bold">Email Verified!</h1>
            <p className="mb-6 text-sm opacity-50">
              Your account is now fully verified. Start creating beautiful invitations.
            </p>
            <Link href="/dashboard" className="btn-gold !px-8 !py-2.5">
              Go to Dashboard
            </Link>
          </div>
        )}
        {status === "error" && (
          <div className="rounded-2xl border border-red-200/30 bg-white p-8 shadow-card">
            <div className="mb-3 text-4xl">❌</div>
            <h1 className="mb-2 font-display text-2xl font-bold">Verification Failed</h1>
            <p className="mb-6 text-sm opacity-50">{message}</p>
            <Link href="/" className="btn-gold !px-8 !py-2.5">
              Go Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

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
