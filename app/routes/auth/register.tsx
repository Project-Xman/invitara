import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useRegister } from "~/lib/queries";

export const Route = createFileRoute("/auth/register")({ component: RegisterPage });

function RegisterPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [phone, setPhone] = useState(""); const [error, setError] = useState("");
  const register = useRegister(); const nav = useNavigate();
  const submit = (e: React.FormEvent) => { e.preventDefault(); setError(""); register.mutate({ name, email, password, phone: phone || undefined }, { onSuccess: () => nav({ to: "/editor" }), onError: (err) => setError(err.message) }); };
  return <div className="min-h-screen pt-[68px] flex items-center justify-center px-6 bg-dots-gold">
    <div className="w-full max-w-md animate-fade-up">
      <div className="text-center mb-8"><div className="text-4xl mb-3">✨</div><h1 className="font-display text-3xl font-bold">Create Account</h1><p className="text-sm opacity-45 mt-1">Get 3 free AI credits on signup!</p></div>
      <form onSubmit={submit} className="bg-white rounded-2xl p-8 border border-gold-200/15 shadow-card space-y-4">
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
        <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">Full Name *</label><input className="input-gold" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required/></div>
        <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">Email *</label><input type="email" className="input-gold" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div>
        <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">Password *</label><input type="password" className="input-gold" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6}/></div>
        <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">Phone (optional)</label><input className="input-gold" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210"/></div>
        <button type="submit" disabled={register.isPending} className="btn-gold w-full !py-3.5 disabled:opacity-50">{register.isPending ? "Creating..." : "Create Account — It's Free"}</button>
        <p className="text-center text-sm opacity-45">Already have an account? <Link to="/auth/login" className="text-gold-700 font-semibold hover:underline">Sign in</Link></p>
      </form>
    </div>
  </div>;
}
