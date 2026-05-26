"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLogin } from "~/lib/queries";
import { AuthShell } from "~/components/auth/AuthShell";
import { Loader2, Lock, Mail } from "lucide-react";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError("");
    }
  }, [error]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.push("/dashboard"),
        onError: (err) => setError(err.message),
      }
    );
  };

  return (
    <AuthShell
      side="right"
      eyebrow="Sign In"
      quote="Welcome back."
      stats={[
        { v: "∞", l: "Lifetime access" },
        { v: "0", l: "Software needed" },
      ]}
    >
      <h1 className="section-headline text-4xl md:text-5xl">
        Continue your <span className="italic text-shimmer">story.</span>
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Sign in to manage invitations, RSVPs, and analytics.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              id="login-email"
              type="email"
              className="input-premium !pl-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              id="login-password"
              type="password"
              className="input-premium !pl-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {login.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing in
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <Link
            href="/auth/forgot-password"
            className="font-display italic transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
          <span>
            No account?{" "}
            <Link
              href="/auth/register"
              className="font-medium uppercase tracking-[0.18em] text-primary transition-colors hover:opacity-80"
            >
              Join
            </Link>
          </span>
        </div>
      </form>
    </AuthShell>
  );
}
