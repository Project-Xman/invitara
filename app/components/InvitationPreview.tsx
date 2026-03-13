import { useState, useEffect } from "react";

interface Template { id: string; gradient: string; colors: { primary: string; secondary: string; bg: string; accent: string; text: string; card: string } }
interface WeddingEvent { id: number; name: string; date: string|null; venue: string|null; time: string|null; icon: string; color: string }
interface InvData { groomName: string; brideName: string; groomFamily?: string|null; brideFamily?: string|null; blessingFrom?: string|null; mantra?: string|null; message?: string|null; hashtag?: string|null; weddingDate?: Date|string|null; venue?: string|null }

export function InvitationPreview({ invitation: inv, events, template: t, fullWidth }: { invitation: InvData; events: WeddingEvent[]; template: Template; fullWidth?: boolean }) {
  const tc = t.colors;
  const [cd, setCd] = useState({d:0,h:0,m:0,s:0});
  useEffect(() => {
    const timer = setInterval(() => {
      const target = inv.weddingDate ? new Date(inv.weddingDate).getTime() : Date.now() + 864e5;
      const diff = Math.max(0, target - Date.now());
      setCd({d:Math.floor(diff/864e5),h:Math.floor(diff%864e5/36e5),m:Math.floor(diff%36e5/6e4),s:Math.floor(diff%6e4/1e3)});
    }, 1000);
    return () => clearInterval(timer);
  }, [inv.weddingDate]);
  const dateStr = inv.weddingDate ? new Date(inv.weddingDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}) : "Date TBD";
  return <div className={fullWidth?"max-w-lg mx-auto":""} style={{background:tc.bg,fontFamily:"'Poppins',sans-serif"}}>
    {/* Hero */}
    <div className="relative min-h-[460px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{background:t.gradient}} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/40" />
      <div className="absolute top-5 left-5 w-14 h-14 border-t-2 border-l-2 border-white/25" /><div className="absolute top-5 right-5 w-14 h-14 border-t-2 border-r-2 border-white/25" /><div className="absolute bottom-5 left-5 w-14 h-14 border-b-2 border-l-2 border-white/25" /><div className="absolute bottom-5 right-5 w-14 h-14 border-b-2 border-r-2 border-white/25" />
      <div className="relative z-10 text-center text-white px-6 py-16">
        <p className="text-[10px] tracking-[6px] uppercase opacity-50 mb-6 font-medium">You're Cordially Invited</p>
        <h1 className="font-script text-[52px] leading-none drop-shadow-lg">{inv.groomName}</h1>
        <div className="flex items-center justify-center gap-4 my-3"><span className="w-12 h-px bg-white/30"/><span className="font-body text-sm tracking-[8px] uppercase opacity-80">Weds</span><span className="w-12 h-px bg-white/30"/></div>
        <h1 className="font-script text-[52px] leading-none drop-shadow-lg">{inv.brideName}</h1>
        <div className="mt-8 pt-6 border-t border-white/20"><p className="font-body text-xs tracking-[3px] uppercase opacity-60">{dateStr}</p><p className="font-body text-xs tracking-[2px] uppercase opacity-40 mt-1">{inv.venue||""}</p></div>
      </div>
    </div>
    {/* Blessings */}
    <div className="text-center px-6 py-12" style={{background:tc.card}}>
      <p className="text-lg mb-3" style={{color:tc.secondary}}>{inv.mantra||"ॐ श्री गणेशाय नमः"}</p>
      <div className="text-4xl mb-4">🙏</div>
      <p className="font-body text-sm opacity-50">With the heavenly blessings of</p>
      <p className="font-display text-base font-semibold mt-2" style={{color:tc.primary}}>{inv.blessingFrom||""}</p>
      <div className="flex items-center justify-center gap-4 my-5"><span className="w-8 h-px" style={{background:tc.secondary+"40"}}/><span className="text-xs tracking-[6px] uppercase font-semibold" style={{color:tc.secondary}}>INVITE</span><span className="w-8 h-px" style={{background:tc.secondary+"40"}}/></div>
      <p className="font-body text-sm opacity-50">You to join us in the wedding celebrations of</p>
      <p className="font-display text-2xl font-bold mt-3" style={{color:tc.primary}}>{inv.groomName} <span className="font-body text-base opacity-30">&</span> {inv.brideName}</p>
      {inv.groomFamily && <p className="font-body text-xs opacity-40 mt-3">Son of {inv.groomFamily}</p>}
      {inv.brideFamily && <p className="font-body text-xs opacity-40 mt-1">Daughter of {inv.brideFamily}</p>}
    </div>
    {/* Events */}
    <div className="px-5 py-10">
      <h2 className="font-display text-2xl font-bold text-center mb-1" style={{color:tc.primary}}>Celebrations</h2>
      <p className="font-body text-sm text-center opacity-40 mb-8">Join us for these special moments</p>
      <div className="space-y-3">{events.map(ev => <div key={ev.id} className="rounded-2xl overflow-hidden border" style={{borderColor:ev.color+"18",background:tc.card}}>
        <div className="flex items-center gap-3.5 p-4"><div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{background:ev.color+"10"}}>{ev.icon}</div><div className="flex-1"><h3 className="font-display text-base font-semibold">{ev.name}</h3><p className="text-[11px] opacity-40 mt-0.5">📅 {ev.date} · 🕐 {ev.time}</p><p className="text-[11px] opacity-40">📍 {ev.venue}</p></div></div>
        <div className="py-2.5 text-[10px] font-semibold tracking-[1.5px] uppercase text-center" style={{color:ev.color,borderTop:`1px solid ${ev.color}0D`,background:ev.color+"05"}}>📍 See the Route</div>
      </div>)}</div>
    </div>
    {/* Message */}
    {inv.message && <div className="text-center px-6 py-10" style={{background:tc.card}}><p className="text-[10px] tracking-[5px] uppercase font-semibold mb-4" style={{color:tc.secondary}}>A Message from the Couple</p><p className="font-body text-sm leading-[1.9] opacity-55 max-w-md mx-auto">{inv.message}</p></div>}
    {/* Gallery placeholder */}
    <div className="px-5 py-10"><h2 className="font-display text-xl font-bold text-center mb-6" style={{color:tc.primary}}>Our Moments</h2><div className="grid grid-cols-2 gap-2.5">{["📸","💕","✨","🌅"].map((e,i)=><div key={i} className="aspect-[3/4] rounded-xl flex items-center justify-center text-3xl" style={{background:tc.accent+"55"}}>{e}</div>)}</div></div>
    {/* Things to Know */}
    <div className="px-5 py-10" style={{background:tc.card}}>
      <h2 className="font-display text-xl font-bold text-center mb-6" style={{color:tc.primary}}>Things to Know</h2>
      {[{icon:"#️⃣",title:"Hashtag",desc:inv.hashtag||""},{icon:"🌤️",title:"Weather",desc:"Check forecast"},{icon:"🅿️",title:"Parking",desc:"Valet at venue"},{icon:"🏨",title:"Stay",desc:"Nearby lodging"}].map((item,i)=><div key={i} className="flex gap-3.5 py-3.5" style={{borderBottom:i<3?`1px solid ${tc.text}08`:"none"}}><span className="text-xl w-8 text-center shrink-0">{item.icon}</span><div><p className="font-semibold text-sm">{item.title}</p><p className="text-xs opacity-40">{item.desc}</p></div></div>)}
    </div>
    {/* RSVP */}
    <div className="text-center px-6 py-10"><div className="text-4xl mb-3">💌</div><h2 className="font-display text-xl font-bold mb-2" style={{color:tc.primary}}>RSVP</h2><button className="w-full py-3.5 rounded-full text-sm font-semibold tracking-[2px] uppercase text-white shadow-gold" style={{background:tc.primary}}>💬 RSVP on WhatsApp</button></div>
    {/* Countdown */}
    <div className="text-center px-6 py-10" style={{background:tc.card}}>
      <h2 className="font-display text-xl font-bold mb-6" style={{color:tc.primary}}>The Countdown Begins</h2>
      <div className="flex justify-center gap-3">{[{v:cd.d,l:"Days"},{v:cd.h,l:"Hours"},{v:cd.m,l:"Mins"},{v:cd.s,l:"Secs"}].map((u,i)=><div key={i} className="text-center"><div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-2xl font-bold" style={{background:tc.primary+"0A",color:tc.primary}}>{String(u.v).padStart(2,"0")}</div><span className="text-[9px] tracking-[2px] uppercase opacity-35 font-medium block mt-1">{u.l}</span></div>)}</div>
    </div>
    {/* Footer */}
    <div className="text-center px-6 py-12" style={{background:tc.accent+"18"}}>
      <div className="font-script text-3xl mb-2" style={{color:tc.primary}}>{inv.groomName} & {inv.brideName}</div>
      <p className="font-body text-xs opacity-35">We look forward to celebrating with you!</p>
      <p className="text-[10px] opacity-15 mt-6 tracking-[1px]">Made with ♥ by Invitara</p>
    </div>
  </div>;
}
