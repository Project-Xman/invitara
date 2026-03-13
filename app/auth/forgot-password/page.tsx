"use client";

import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "~/lib/queries";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await forgotPassword.mutateAsync({ email });
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-dots-gold flex min-h-screen items-center justify-center px-6 pt-[68px]">
      <div className="w-full max-w-md animate-fade-up">
        {sent ? (
          <div className="rounded-2xl border border-gold-200/15 bg-white p-8 text-center shadow-card">
            <div className="mb-3 text-4xl">📧</div>
            <h1 className="mb-2 font-display text-2xl font-bold">Check Your Email</h1>
            <p className="mb-6 text-sm opacity-50">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset
              link. Check your inbox.
            </p>
            <Link href="/auth/login" className="btn-gold !px-8 !py-2.5">
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-gold-200/15 bg-white p-8 shadow-card">
            <div className="mb-6 text-center">
              <h1 className="mb-1 font-display text-2xl font-bold">Forgot Password</h1>
              <p className="text-sm opacity-40">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide opacity-50">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gold-200/25 bg-cream-50/60 px-4 py-3 text-sm transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="btn-gold w-full !py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forgotPassword.isPending ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs opacity-40">
              Remember your password?{" "}
              <Link href="/auth/login" className="font-semibold text-gold-700 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
