import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { templatesQueryOptions, sessionQueryOptions, plansQueryOptions } from "~/lib/queries";
import { AdBanner } from "~/components/AdBanner";

const CATEGORIES = ["All","Hindu Weddings","Christian Weddings","Sikh Weddings","Muslim Weddings","South-Indian Weddings","Save the Date"];
const features = [
  {icon:"💰",t:"Affordable",d:"Cheaper than printed cards & WhatsApp invites."},{icon:"👴",t:"Elder-Friendly",d:"Large text, clear layouts for every generation."},{icon:"📸",t:"Photo Highlights",d:"Pre-wedding shoot gallery built-in."},
  {icon:"✏️",t:"Instant Edits",d:"Update anytime, even after sharing."},{icon:"🪔",t:"Ritual-Ready",d:"Deity motifs, mantras for every tradition."},{icon:"🔐",t:"Private Events",d:"Separate links per event."},
  {icon:"⏱️",t:"Live Countdown",d:"Builds excitement for your big day."},{icon:"📍",t:"Smart Links",d:"RSVP, maps, Instagram & WhatsApp built-in."},{icon:"🎵",t:"Background Music",d:"Add any MP3 track."},
];
const faqs = [
  {q:"Do I need software to edit?",a:"No — everything is browser-based, fill a form, done in 10 minutes."},
  {q:"Why this over WhatsApp video?",a:"Interactive websites — RSVP, galleries, directions, live updates."},
  {q:"Can I update after sharing?",a:"Yes, changes are instant for everyone."},
  {q:"Is there an expiry?",a:"No, lifetime access once purchased."},
  {q:"Can I add music?",a:"Yes, upload any MP3 file."},
  {q:"How does AI design work?",a:"Describe your dream design, our AI generates custom color palettes and suggestions. Free with Chrome's built-in Gemini Nano, or 1 credit on server."},
];

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const [cat, setCat] = useState("All");
  const { data: tmpls = [] } = useQuery(templatesQueryOptions(cat));
  const { data: user } = useQuery(sessionQueryOptions());
  const { data: plans = [] } = useQuery(plansQueryOptions());
  const [openFaq, setOpenFaq] = useState<number|null>(null);

  return <div className="animate-fade-up">
    {/* HERO */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[68px] bg-dots-gold">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gold-500/[0.06] blur-[80px] top-[-100px] right-[-100px] animate-float"/>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gold-600/[0.05] blur-[70px] bottom-[-50px] left-[-50px] animate-float-d"/>
      <div className="relative z-10 text-center max-w-[900px] px-6">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-gold-500/[0.08] border border-gold-500/[0.12] rounded-full text-xs font-medium text-gold-700 tracking-[1.5px] uppercase mb-8">
          <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse"/>Now with AI Design Generation
        </div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">Website Templates for <span className="text-golden">Wedding Invites</span></h1>
        <p className="font-body text-lg md:text-xl text-cream-800/60 max-w-[560px] mx-auto mb-10 leading-relaxed">Easy-to-customise, effortless to share. AI-powered design. Pick a style, add your story, share in minutes.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/templates" className="btn-gold">Choose a Template</Link>
          <Link to="/preview" className="btn-gold-outline">View Demo</Link>
        </div>
      </div>
    </section>

    {/* AD for free users */}
    {(!user || user.showAds) && <div className="max-w-[1320px] mx-auto px-6 lg:px-8 mt-10"><AdBanner user={user||null} slot="hero_banner" ad={{id:"upgrade",title:"Go Premium ✦",description:"Remove ads, unlock all templates, get AI credits & custom domain.",ctaText:"Upgrade Now",ctaLink:"/pricing",gradient:"linear-gradient(135deg,#A67C2E 0%,#D4A853 50%,#FFD466 100%)",icon:"👑"}}/></div>}

    {/* TEMPLATES */}
    <section className="max-w-[1320px] mx-auto px-6 lg:px-8 py-24">
      <div className="text-center mb-12"><p className="text-[11px] font-semibold tracking-[3px] uppercase text-gold-600/70 mb-3">Templates</p><h2 className="font-display text-4xl md:text-5xl font-bold mb-3">Designed for your Big Day</h2></div>
      <div className="flex flex-wrap gap-2 justify-center mb-10">{CATEGORIES.map(c=><button key={c} onClick={()=>setCat(c)} className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide border ${cat===c?"bg-gold-700 text-white border-gold-700 shadow-gold":"bg-white text-cream-800/50 border-gold-200/25 hover:border-gold-400"}`}>{c}</button>)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{tmpls.map((t: any)=>
        <Link key={t.id} to="/editor" search={{template:t.id}} className="group bg-white rounded-2xl overflow-hidden border border-gold-200/12 transition-all duration-500 hover:-translate-y-2 hover:shadow-gold-lg relative">
          {t.isFree && <span className="absolute top-3 right-3 z-30 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold tracking-[1px] uppercase">Free</span>}
          <div className="h-56 relative overflow-hidden"><div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700" style={{background:t.gradient}}/><div className="absolute inset-0 flex items-center justify-center text-white z-10"><div className="text-center"><h3 className="font-script text-3xl drop-shadow-md">Preview</h3><span className="font-body text-[10px] tracking-[5px] uppercase opacity-60 block mt-1">{t.name}</span></div></div></div>
          <div className="p-5"><div className="text-[9px] font-semibold tracking-[2px] uppercase text-gold-600/45 mb-1">{t.category}</div><div className="flex items-center gap-2 mb-1"><span>{t.emoji}</span><h3 className="font-display text-lg font-semibold">{t.name}</h3></div><p className="text-xs opacity-40 mb-3">{t.description}</p><div className="flex items-center justify-between"><span className="font-display text-lg font-bold text-gold-700">{t.isFree?"Free":"₹"+t.price.toLocaleString("en-IN")}</span><span className="btn-gold !py-1.5 !px-4 !text-[9px]">Customize →</span></div></div>
        </Link>
      )}</div>
    </section>

    {/* FEATURES */}
    <section className="bg-white py-24"><div className="max-w-[1320px] mx-auto px-6 lg:px-8">
      <div className="text-center mb-14"><p className="text-[11px] font-semibold tracking-[3px] uppercase text-gold-600/70 mb-3">Features</p><h2 className="font-display text-4xl md:text-5xl font-bold mb-3">The Wedding Invite, Reinvented</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{features.map((f,i)=><div key={i} className="bg-cream-50 rounded-2xl p-7 border border-gold-200/10 hover:-translate-y-1 hover:shadow-card transition-all"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100/80 to-gold-200/40 flex items-center justify-center text-2xl mb-5">{f.icon}</div><h3 className="font-display text-lg font-semibold mb-2">{f.t}</h3><p className="text-sm opacity-50 leading-relaxed">{f.d}</p></div>)}</div>
    </div></section>

    {/* PRICING */}
    <section className="max-w-[1320px] mx-auto px-6 lg:px-8 py-24" id="pricing"><div className="text-center mb-14"><p className="text-[11px] font-semibold tracking-[3px] uppercase text-gold-600/70 mb-3">Pricing</p><h2 className="font-display text-4xl font-bold mb-3">Simple, Transparent Pricing</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">{(plans as any[]).map((p,i)=><div key={i} className={`rounded-2xl p-7 text-center relative ${p.badge?"bg-white border-2 border-gold-500 shadow-gold-lg scale-[1.02]":"bg-cream-50 border border-gold-200/15"}`}>
        {p.badge&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold-700 text-white rounded-full text-[9px] font-semibold tracking-[1px] uppercase">{p.badge}</div>}
        <h3 className="font-display text-xl font-bold mb-1">{p.name}</h3>
        <div className="font-display text-4xl font-bold text-gold-700 mb-0.5">{p.price===0?"Free":"₹"+p.price.toLocaleString("en-IN")}</div>
        <p className="text-xs opacity-40 mb-1">{p.price===0?"forever":"one-time"}</p>
        {p.showAds && <p className="text-[10px] text-amber-600 font-semibold mb-3">Contains Ads</p>}
        {!p.showAds && p.price>0 && <p className="text-[10px] text-emerald-600 font-semibold mb-3">✓ No Ads + {p.credits} AI Credits</p>}
        <div className="text-left space-y-2 mb-6">{p.features.map((f: string,j: number)=><div key={j} className="flex items-start gap-2 text-xs"><span className="text-gold-600 font-bold mt-0.5">✓</span><span className="opacity-55">{f}</span></div>)}</div>
        <Link to={p.id==="free"?"/auth/register":"/pricing"} className={p.badge?"btn-gold w-full":"btn-gold-outline w-full"}>{p.id==="free"?"Get Started Free":"Choose Plan"}</Link>
      </div>)}</div>
    </section>

    {/* FAQ */}
    <section className="bg-white py-24"><div className="max-w-2xl mx-auto px-6">
      <div className="text-center mb-14"><h2 className="font-display text-4xl font-bold">Questions? Answers.</h2></div>
      {faqs.map((f,i)=><div key={i} className="border-b border-gold-200/12"><button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex items-center justify-between py-5 text-left group"><span className="text-sm font-medium pr-4 group-hover:text-gold-700">{f.q}</span><span className={`text-gold-500 text-lg shrink-0 transition-transform ${openFaq===i?"rotate-45":""}`}>+</span></button><div className={`text-sm opacity-50 leading-relaxed overflow-hidden transition-all ${openFaq===i?"max-h-40 pb-5":"max-h-0"}`}>{f.a}</div></div>)}
    </div></section>

    {/* FOOTER */}
    <footer className="bg-cream-900 text-white py-16 px-6"><div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
      <div><div className="font-script text-3xl text-gold-500 mb-3">Invitara</div><p className="text-sm opacity-40 leading-relaxed">Beautiful, AI-powered wedding invitation websites. Poppins font, golden wedding theme.</p></div>
      <div><h4 className="text-[10px] font-semibold tracking-[2px] uppercase opacity-40 mb-5">Product</h4>{["Templates","Features","Pricing","AI Design","Demo"].map(l=><p key={l} className="text-sm opacity-55 hover:opacity-100 cursor-pointer transition-opacity mb-3">{l}</p>)}</div>
      <div><h4 className="text-[10px] font-semibold tracking-[2px] uppercase opacity-40 mb-5">Support</h4>{["Contact Us","Privacy Policy","Terms","Refund Policy"].map(l=><p key={l} className="text-sm opacity-55 hover:opacity-100 cursor-pointer transition-opacity mb-3">{l}</p>)}</div>
    </div><div className="max-w-[1320px] mx-auto mt-12 pt-8 border-t border-white/8 text-center text-xs opacity-25">© 2026 Invitara. All rights reserved.</div></footer>
  </div>;
}
