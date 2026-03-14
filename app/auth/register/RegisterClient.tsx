"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRegister } from "~/lib/queries";
import { UserPlus, Loader2, Mail, Lock, User, Phone } from "lucide-react";

export default function RegisterClient() {
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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Get 3 free AI credits on signup!</p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-card"
        >
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="reg-name" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
              <input
                id="reg-name"
                className="input-gold !pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="reg-email" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
              <input
                id="reg-email"
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
            <label htmlFor="reg-password" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
              <input
                id="reg-password"
                type="password"
                className="input-gold !pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
          </div>
          <div>
            <label htmlFor="reg-phone" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
              Phone (optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
              <input
                id="reg-phone"
                className="input-gold !pl-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={register.isPending}
            className="btn-gold w-full !py-3.5 disabled:opacity-50"
          >
            {register.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Creating...
              </span>
            ) : (
              "Create Account -- It's Free"
            )}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
