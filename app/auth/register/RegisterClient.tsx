"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRegister } from "~/lib/queries";
import { AuthShell } from "~/components/auth/AuthShell";
import { Loader2, Lock, Mail, Phone, Sparkles, User } from "lucide-react";

export default function RegisterClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const register = useRegister();
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
    register.mutate(
      { name, email, password, phone: phone || undefined },
      {
        onSuccess: () => router.push("/editor"),
        onError: (err) => setError(err.message),
      }
    );
  };

  return (
    <AuthShell
      side="left"
      eyebrow="Join"
      quote="Begin the rest."
      stats={[
        { v: "3", l: "Free AI credits" },
        { v: "∞", l: "Lifetime access" },
        { v: "0", l: "Software needed" },
      ]}
    >
      <h1 className="section-headline text-4xl md:text-5xl">
        A wedding website, <span className="italic text-shimmer">in minutes.</span>
      </h1>
      <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        Get
        <span className="inline-flex items-center gap-1 font-medium text-primary">
          <Sparkles className="h-3 w-3" /> 3 free AI credits
        </span>
        on signup.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-4">
        <div>
          <label
            htmlFor="reg-name"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              id="reg-name"
              className="input-premium !pl-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-email"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              id="reg-email"
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
            htmlFor="reg-password"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              id="reg-password"
              type="password"
              className="input-premium !pl-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-phone"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Phone <span className="text-muted-foreground/50 normal-case tracking-normal">(optional)</span>
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              id="reg-phone"
              className="input-premium !pl-11"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={register.isPending}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {register.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating
            </span>
          ) : (
            "Begin Your Story"
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium uppercase tracking-[0.18em] text-primary transition-colors hover:opacity-80"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
