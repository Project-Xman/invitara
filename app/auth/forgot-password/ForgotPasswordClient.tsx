"use client";

import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "~/lib/queries";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordClient() {
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
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 font-display text-2xl font-bold">Check Your Email</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              If an account exists for <strong className="text-foreground">{email}</strong>, we&apos;ve sent a password reset
              link. Check your inbox.
            </p>
            <Link href="/auth/login" className="btn-gold !px-8 !py-2.5">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="mb-1 font-display text-2xl font-bold">Forgot Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-gold !pl-10"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
              )}

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="btn-gold w-full !py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forgotPassword.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
