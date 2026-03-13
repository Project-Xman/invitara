"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRegister } from "~/lib/queries";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const register = useRegister();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    register.mutate(
      { name, email, password, phone: phone || undefined },
      {
        onSuccess: () => router.push("/editor"),
        onError: (err) => setError(err.message),
      }
    );
  };

  return (
    <div className="bg-dots-gold flex min-h-screen items-center justify-center px-6 pt-[68px]">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">✨</div>
          <h1 className="font-display text-3xl font-bold">Create Account</h1>
          <p className="mt-1 text-sm opacity-45">Get 3 free AI credits on signup!</p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-gold-200/15 bg-white p-8 shadow-card"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
              Full Name *
            </label>
            <input
              className="input-gold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
              Email *
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
              Password *
            </label>
            <input
              type="password"
              className="input-gold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
              Phone (optional)
            </label>
            <input
              className="input-gold"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <button
            type="submit"
            disabled={register.isPending}
            className="btn-gold w-full !py-3.5 disabled:opacity-50"
          >
            {register.isPending ? "Creating..." : "Create Account — It's Free"}
          </button>
          <p className="text-center text-sm opacity-45">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-gold-700 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
