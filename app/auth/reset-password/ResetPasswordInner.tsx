"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useResetPassword } from "~/lib/queries";
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const resetPassword = useResetPassword();

  if (!token) {
    return (
      <div className="bg-dots-gold flex min-h-screen items-center justify-center px-6 pt-[68px]">
        <div className="w-full max-w-md animate-fade-up rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="mb-2 font-display text-2xl font-bold">Invalid Link</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            This password reset link is invalid or missing a token.
          </p>
          <Link href="/auth/forgot-password" className="btn-gold !px-8 !py-2.5">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      await resetPassword.mutateAsync({ token, password });
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. The link may have expired.");
    }
  };

  if (done) {
    return (
      <div className="bg-dots-gold flex min-h-screen items-center justify-center px-6 pt-[68px]">
        <div className="w-full max-w-md animate-fade-up rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="mb-2 font-display text-2xl font-bold">Password Reset!</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Link href="/auth/login" className="btn-gold !px-8 !py-2.5">
            <ArrowLeft className="h-4 w-4" /> Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dots-gold flex min-h-screen items-center justify-center px-6 pt-[68px]">
      <div className="w-full max-w-md animate-fade-up">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-1 font-display text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-password" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  id="reset-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-gold !pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="reset-confirm" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  id="reset-confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="input-gold !pl-10"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="btn-gold w-full !py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetPassword.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
