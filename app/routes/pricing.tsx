import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { plansQueryOptions, sessionQueryOptions } from "~/lib/queries";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
  const { data: plans = [] } = useQuery(plansQueryOptions());
  const { data: user } = useQuery(sessionQueryOptions());
  return <div className="pt-[68px] min-h-screen animate-fade-up"><div className="max-w-[1320px] mx-auto px-6 lg:px-8 py-20">
    <div className="text-center mb-14"><p className="text-[11px] font-semibold tracking-[3px] uppercase text-gold-600/70 mb-3">Pricing</p><h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Choose Your Plan</h1><p className="font-body text-lg text-cream-800/50 max-w-md mx-auto">One purchase. Lifetime access. No hidden costs. Free plan includes ads.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-16">
      {(plans as any[]).map((p, i) => {
        const isActive = user?.plan === p.id;
        return <div key={i} className={`rounded-2xl p-7 text-center relative ${p.badge?"bg-white border-2 border-gold-500 shadow-gold-lg scale-[1.02]":"bg-white border border-gold-200/15"}`}>
          {p.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold-700 text-white rounded-full text-[9px] font-semibold tracking-[1px] uppercase">{p.badge}</div>}
          {isActive && <div className="absolute -top-3 right-4 px-3 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-semibold">Current</div>}
          <h3 className="font-display text-xl font-bold mb-1">{p.name}</h3>
          <div className="font-display text-4xl font-bold text-gold-700 mb-0.5">{p.price===0?"Free":"₹"+p.price.toLocaleString("en-IN")}</div>
          <p className="text-xs opacity-40 mb-1">{p.price===0?"forever":"one-time"}</p>
          {p.showAds ? <p className="text-[10px] text-amber-600 font-semibold mb-4">⚠️ Contains Ads</p> : p.price > 0 ? <p className="text-[10px] text-emerald-600 font-semibold mb-4">✓ Ad-Free + {p.credits} AI Credits</p> : <div className="mb-4"/>}
          <div className="text-left space-y-2.5 mb-6">{p.features.map((f: string, j: number)=><div key={j} className="flex items-start gap-2 text-xs"><span className="text-gold-600 font-bold mt-0.5">✓</span><span className="opacity-55">{f}</span></div>)}</div>
          {isActive ? <button disabled className="w-full py-3 rounded-full text-sm font-semibold bg-cream-100 text-cream-700 border border-gold-200/20">Current Plan</button>
          : <Link to={user ? "/account" : "/auth/register"} className={`block w-full text-center py-3 rounded-full text-sm font-semibold tracking-wide transition-all ${p.badge ? "bg-gold-700 text-white shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5" : "border-2 border-gold-500 text-gold-700 hover:bg-gold-700 hover:text-white"}`}>
            {p.id === "free" ? "Get Started Free" : `Choose ${p.name}`}
          </Link>}
        </div>;
      })}
    </div>

    {/* Comparison */}
    <div className="max-w-3xl mx-auto"><h2 className="font-display text-2xl font-bold text-center mb-8">Free vs Paid</h2>
      <div className="bg-white rounded-2xl border border-gold-200/15 overflow-hidden">
        <table className="w-full"><thead><tr className="bg-cream-50/60"><th className="text-left px-6 py-4 text-xs font-semibold tracking-[1.5px] uppercase opacity-40">Feature</th><th className="px-4 py-4 text-xs font-semibold tracking-[1.5px] uppercase opacity-40 text-center">Free</th><th className="px-4 py-4 text-xs font-semibold tracking-[1.5px] uppercase text-gold-700 text-center">✦ Paid</th></tr></thead>
        <tbody>{[
          ["Templates","2 Free","All / Purchase Individual"],["Events","Up to 2","Unlimited"],["Ads","Yes, shown","No ads"],["AI Credits","3 on signup","5-50 bonus"],
          ["RSVP Dashboard","Basic","Full + Analytics"],["Custom Domain","✗","✓"],["Music","✗","✓"],["Priority Support","✗","✓"],
        ].map(([f,free,paid],i)=><tr key={i} className="border-t border-gold-200/8"><td className="px-6 py-3 text-sm font-medium">{f}</td><td className="px-4 py-3 text-sm text-center opacity-50">{free}</td><td className="px-4 py-3 text-sm text-center font-semibold text-gold-700">{paid}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </div></div>;
}
