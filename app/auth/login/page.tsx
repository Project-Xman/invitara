"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogin } from "~/lib/queries";

export default function LoginPage() {
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
          <div className="mb-3 text-4xl">✦</div>
          <h1 className="font-display text-3xl font-bold">Welcome Back</h1>
          <p className="mt-1 text-sm opacity-45">Sign in to manage your invitations</p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-5 rounded-2xl border border-gold-200/15 bg-white p-8 shadow-card"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
              Email
            </label>
            <input
              type="email"
              className="input-gold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
              Password
            </label>
            <input
              type="password"
              className="input-gold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={login.isPending}
            className="btn-gold w-full !py-3.5 disabled:opacity-50"
          >
            {login.isPending ? "Signing in..." : "Sign In"}
          </button>
          <div className="flex items-center justify-between text-sm opacity-45">
            <Link href="/auth/forgot-password" className="hover:underline">
              Forgot password?
            </Link>
            <span>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-semibold text-gold-700 hover:underline">
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
