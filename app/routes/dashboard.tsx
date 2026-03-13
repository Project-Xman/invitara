import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { sessionQueryOptions } from "~/lib/queries";
import { RsvpTable } from "~/components/RsvpTable";
import { ShareModal } from "~/components/ShareModal";
import { AnalyticsChart } from "~/components/AnalyticsChart";
import { AdBanner } from "~/components/AdBanner";

// Demo data for dashboard
const DEMO_RSVPS = [
  {id:1,name:"Rahul & Neetha Sharma",guests:4,status:"attending" as const,phone:"+91 98765 43210",eventsAttending:["Shaadi","Reception","Cocktail"],respondedAt:"2026-01-15"},
  {id:2,name:"Priya & Vikram Patel",guests:2,status:"attending" as const,phone:"+91 87654 32109",eventsAttending:["Mehendi","Haldi","Shaadi","Reception"],respondedAt:"2026-01-18"},
  {id:3,name:"Amit Kumar Family",guests:6,status:"attending" as const,phone:"+91 76543 21098",eventsAttending:["Shaadi","Reception"],respondedAt:"2026-01-20"},
  {id:4,name:"Sneha & Arjun Reddy",guests:2,status:"declined" as const,phone:"+91 65432 10987",eventsAttending:[],respondedAt:"2026-01-22"},
  {id:5,name:"Vikram Singh",guests:5,status:"attending" as const,phone:"+91 54321 09876",eventsAttending:["Cocktail","Shaadi","Reception"],respondedAt:"2026-02-01"},
  {id:6,name:"Meera Joshi",guests:1,status:"pending" as const,phone:"+91 43210 98765",eventsAttending:[],respondedAt:null},
  {id:7,name:"Karan & Anjali Mehta",guests:3,status:"attending" as const,phone:"+91 32109 87654",eventsAttending:["Mehendi","Sangeet","Shaadi","Reception"],respondedAt:"2026-02-05"},
  {id:8,name:"Deepak Verma Family",guests:8,status:"attending" as const,phone:"+91 21098 76543",eventsAttending:["Haldi","Shaadi","Reception"],respondedAt:"2026-02-08"},
  {id:9,name:"Sunita Agarwal",guests:2,status:"pending" as const,phone:"+91 10987 65432",eventsAttending:[],respondedAt:null},
  {id:10,name:"Rohit & Preeti Kapoor",guests:4,status:"attending" as const,phone:"+91 09876 54321",eventsAttending:["Sangeet","Cocktail","Shaadi","Reception"],respondedAt:"2026-02-10"},
  {id:11,name:"Anita Deshmukh",guests:3,status:"attending" as const,phone:"+91 98123 45678",eventsAttending:["Shaadi","Reception"],respondedAt:"2026-02-12"},
  {id:12,name:"Nikhil Gupta",guests:5,status:"pending" as const,phone:"+91 87012 34567",eventsAttending:[],respondedAt:null},
];

const EVENTS_BREAKDOWN = [
  {name:"Mehendi",icon:"🌿",color:"#4D6B3A",families:2,guests:5,date:"Mar 9"},
  {name:"Haldi",icon:"💛",color:"#D4A853",families:3,guests:14,date:"Mar 10"},
  {name:"Sangeet",icon:"🎶",color:"#7A6AAB",families:3,guests:9,date:"Mar 10"},
  {name:"Cocktail",icon:"🥂",color:"#A67C2E",families:3,guests:13,date:"Mar 10"},
  {name:"Shaadi",icon:"💍",color:"#C73866",families:7,guests:35,date:"Mar 11"},
  {name:"Reception",icon:"🎉",color:"#7A5A1E",families:7,guests:35,date:"Mar 12"},
];

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { data: user } = useQuery(sessionQueryOptions());
  const [showShare, setShowShare] = useState(false);
  const attending = DEMO_RSVPS.filter(r=>r.status==="attending");
  const totalGuests = attending.reduce((s,r)=>s+r.guests,0);

  const analyticsData = {
    summary: { invite_view: 847, invite_share: 42, rsvp_submit: 12, link_click: 156, qr_scan: 23, ad_click: 8 },
    daily: Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-((13-i)*864e5)).toLocaleDateString("en-IN",{month:"short",day:"numeric"}), views: Math.floor(Math.random()*80)+20 })),
  };

  return <div className="pt-[68px] min-h-screen animate-fade-up"><div className="max-w-[1320px] mx-auto px-6 lg:px-8 py-12">
    <div className="text-center mb-8"><p className="text-[11px] font-semibold tracking-[3px] uppercase text-gold-600/70 mb-2">Dashboard</p><h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Manage Your Invitation</h1></div>

    {/* Ad */}
    {(!user || user?.showAds) && <AdBanner user={user||null} slot="dashboard_top" ad={{id:"credit-sale",title:"Credit Sale!",description:"Get 15 AI generation credits for just ₹249.",ctaText:"Buy Credits →",ctaLink:"/account",gradient:"linear-gradient(135deg,#C73866,#E8668E,#D4A853)",icon:"🎁"}}/>}

    {/* Quick Actions */}
    <div className="flex flex-wrap gap-3 mb-8 justify-center">
      <button className="btn-gold !py-2.5 !px-6 !text-[10px]" onClick={()=>setShowShare(true)}>✨ Share Invite</button>
      <Link to="/editor" className="btn-gold-outline !py-2.5 !px-6 !text-[10px]">Edit Invite</Link>
      <Link to="/preview" className="btn-gold-outline !py-2.5 !px-6 !text-[10px]">Preview</Link>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {[{l:"Total RSVPs",v:DEMO_RSVPS.length,s:"responses",c:"text-gold-700"},{l:"Attending",v:attending.length,s:`${totalGuests} guests`,c:"text-emerald-600"},{l:"Pending",v:DEMO_RSVPS.filter(r=>r.status==="pending").length,s:"awaiting",c:"text-amber-600"},{l:"Declined",v:DEMO_RSVPS.filter(r=>r.status==="declined").length,s:"won't make it",c:"text-red-500"}].map((s,i)=>
        <div key={i} className="bg-white rounded-2xl p-5 border border-gold-200/12 shadow-card"><p className="text-[10px] font-semibold tracking-[2px] uppercase opacity-35 mb-1.5">{s.l}</p><p className={`font-display text-4xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs opacity-35 mt-1">{s.s}</p></div>
      )}
    </div>

    {/* Analytics */}
    <div className="mb-10"><h2 className="font-display text-xl font-bold mb-5">Analytics</h2><AnalyticsChart daily={analyticsData.daily} summary={analyticsData.summary}/></div>

    {/* Event Breakdown */}
    <div className="mb-10"><h2 className="font-display text-xl font-bold mb-5">Event Breakdown</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">{EVENTS_BREAKDOWN.map(ev=><div key={ev.name} className="bg-white rounded-xl p-4 border-l-4 border border-gold-200/10" style={{borderLeftColor:ev.color}}><div className="text-2xl mb-2">{ev.icon}</div><p className="text-[10px] font-semibold tracking-[1.5px] uppercase opacity-40 mb-0.5">{ev.name}</p><p className="font-display text-2xl font-bold" style={{color:ev.color}}>{ev.guests}</p><p className="text-[11px] opacity-35">{ev.families} families</p></div>)}</div>
    </div>

    {/* RSVP Table */}
    <div><h2 className="font-display text-xl font-bold mb-5">Guest Responses</h2><RsvpTable data={DEMO_RSVPS}/></div>
  </div>
  {showShare && <ShareModal groomName="Abhishek" brideName="Kanika" onClose={()=>setShowShare(false)}/>}
  </div>;
}
