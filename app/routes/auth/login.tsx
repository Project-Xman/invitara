import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useLogin } from "~/lib/queries";

export const Route = createFileRoute("/auth/login")({ component: LoginPage });

function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  const login = useLogin(); const nav = useNavigate();
  const submit = (e: React.FormEvent) => { e.preventDefault(); setError(""); login.mutate({ email, password }, { onSuccess: () => nav({ to: "/dashboard" }), onError: (err) => setError(err.message) }); };
  return <div className="min-h-screen pt-[68px] flex items-center justify-center px-6 bg-dots-gold">
    <div className="w-full max-w-md animate-fade-up">
      <div className="text-center mb-8"><div className="text-4xl mb-3">✦</div><h1 className="font-display text-3xl font-bold">Welcome Back</h1><p className="text-sm opacity-45 mt-1">Sign in to manage your invitations</p></div>
      <form onSubmit={submit} className="bg-white rounded-2xl p-8 border border-gold-200/15 shadow-card space-y-5">
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
        <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">Email</label><input type="email" className="input-gold" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div>
        <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">Password</label><input type="password" className="input-gold" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></div>
        <button type="submit" disabled={login.isPending} className="btn-gold w-full !py-3.5 disabled:opacity-50">{login.isPending ? "Signing in..." : "Sign In"}</button>
        <p className="text-center text-sm opacity-45">Don't have an account? <Link to="/auth/register" className="text-gold-700 font-semibold hover:underline">Sign up</Link></p>
      </form>
    </div>
  </div>;
}
