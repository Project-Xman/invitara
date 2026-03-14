"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogin } from "~/lib/queries";
import { Sparkles, Loader2, Mail, Lock } from "lucide-react";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();
  const router = useRouter();

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
    <div className="bg-dots-gold flex min-h-screen items-center justify-center px-6 pt-[68px]">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your invitations</p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-card"
        >
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="login-email" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
              <input
                id="login-email"
                type="email"
                className="input-gold !pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
              <input
                id="login-password"
                type="password"
                className="input-gold !pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={login.isPending}
            className="btn-gold w-full !py-3.5 disabled:opacity-50"
          >
            {login.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/auth/forgot-password" className="hover:text-primary hover:underline">
              Forgot password?
            </Link>
            <span>
              No account?{" "}
              <Link href="/auth/register" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
