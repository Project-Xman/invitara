"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useResetPassword } from "~/lib/queries";

function ResetPasswordInner() {
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
        <div className="w-full max-w-md animate-fade-up rounded-2xl border border-red-200/30 bg-white p-8 text-center shadow-card">
          <div className="mb-3 text-4xl">❌</div>
          <h1 className="mb-2 font-display text-2xl font-bold">Invalid Link</h1>
          <p className="mb-6 text-sm opacity-50">
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
        <div className="w-full max-w-md animate-fade-up rounded-2xl border border-gold-200/15 bg-white p-8 text-center shadow-card">
          <div className="mb-3 text-4xl">✅</div>
          <h1 className="mb-2 font-display text-2xl font-bold">Password Reset!</h1>
          <p className="mb-6 text-sm opacity-50">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Link href="/auth/login" className="btn-gold !px-8 !py-2.5">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dots-gold flex min-h-screen items-center justify-center px-6 pt-[68px]">
      <div className="w-full max-w-md animate-fade-up">
        <div className="rounded-2xl border border-gold-200/15 bg-white p-8 shadow-card">
          <div className="mb-6 text-center">
            <h1 className="mb-1 font-display text-2xl font-bold">Reset Password</h1>
            <p className="text-sm opacity-40">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide opacity-50">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl border border-gold-200/25 bg-cream-50/60 px-4 py-3 text-sm transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide opacity-50">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-gold-200/25 bg-cream-50/60 px-4 py-3 text-sm transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="btn-gold w-full !py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetPassword.isPending ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

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
