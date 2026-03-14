"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as actions from "~/lib/actions";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function VerifyEmailInner() {
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
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
          </div>
        )}
        {status === "success" && (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="mb-2 font-display text-2xl font-bold">Email Verified!</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Your account is now fully verified. Start creating beautiful invitations.
            </p>
            <Link href="/dashboard" className="btn-gold !px-8 !py-2.5">
              Go to Dashboard
            </Link>
          </div>
        )}
        {status === "error" && (
          <div className="rounded-2xl border border-destructive/30 bg-card p-8 shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="mb-2 font-display text-2xl font-bold">Verification Failed</h1>
            <p className="mb-6 text-sm text-muted-foreground">{message}</p>
            <Link href="/" className="btn-gold !px-8 !py-2.5">
              Go Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
