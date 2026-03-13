import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions, creditsQueryOptions, creditPacksQueryOptions, useLogout } from "~/lib/queries";
import { CreditStore } from "~/components/CreditStore";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: creditData } = useQuery(creditsQueryOptions());
  const { data: packs = [] } = useQuery(creditPacksQueryOptions());
  const logout = useLogout();
  const nav = useNavigate();

  if (!user) return <div className="pt-[68px] min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="font-display text-2xl font-bold mb-4">Please sign in</h2><Link to="/auth/login" className="btn-gold">Sign In</Link></div></div>;

  const planColors: Record<string,string> = { free:"bg-cream-200 text-cream-800", starter:"bg-blue-100 text-blue-700", premium:"bg-gold-200 text-gold-800", royal:"bg-purple-100 text-purple-700" };

  return <div className="pt-[68px] min-h-screen animate-fade-up"><div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
    <div className="text-center mb-10"><p className="text-[11px] font-semibold tracking-[3px] uppercase text-gold-600/70 mb-2">Account</p><h1 className="font-display text-3xl font-bold">Your Account</h1></div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Profile */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gold-200/15">
          <h3 className="font-display text-lg font-bold mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><span className="text-sm opacity-50">Name</span><span className="font-semibold text-sm">{user.name}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm opacity-50">Email</span><span className="font-semibold text-sm">{user.email}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm opacity-50">Phone</span><span className="font-semibold text-sm">{user.phone || "—"}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm opacity-50">Plan</span><span className={`px-3 py-1 rounded-full text-xs font-semibold ${planColors[user.plan]}`}>{user.plan.toUpperCase()}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm opacity-50">Ads</span><span className={`text-sm font-semibold ${user.showAds ? "text-amber-600" : "text-emerald-600"}`}>{user.showAds ? "⚠️ Showing Ads" : "✓ Ad-Free"}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm opacity-50">Since</span><span className="text-sm opacity-60">{new Date(user.createdAt).toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</span></div>
          </div>
        </div>

        {/* Upgrade CTA for free users */}
        {user.plan === "free" && <div className="rounded-2xl p-6 text-white" style={{background:"linear-gradient(135deg,#A67C2E,#D4A853,#FFD466)"}}>
          <h3 className="font-display text-lg font-bold mb-2">Remove Ads & Unlock Everything</h3>
          <p className="text-sm opacity-80 mb-4">Upgrade to any paid plan to remove ads, get bonus AI credits, and unlock all templates.</p>
          <Link to="/pricing" className="inline-block px-6 py-2.5 bg-white text-gold-800 rounded-full text-xs font-semibold tracking-wide shadow-lg hover:-translate-y-0.5 transition-all">View Plans →</Link>
        </div>}

        <button onClick={() => { logout.mutate(); nav({ to: "/" }); }} className="w-full py-3 rounded-xl text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-all">Sign Out</button>
      </div>

      {/* Credits */}
      <CreditStore user={user} packages={packs as any[]} history={(creditData?.history || []) as any[]}/>
    </div>
  </div></div>;
}
