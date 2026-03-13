import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { templatesQueryOptions, sessionQueryOptions } from "~/lib/queries";
import { InvitationPreview } from "~/components/InvitationPreview";
import { ShareModal } from "~/components/ShareModal";
import { InlineAd } from "~/components/AdBanner";

const INV = { groomName:"Abhishek", brideName:"Kanika", groomFamily:"Mrs. Reena & Mr. Rajiv Kapoor", brideFamily:"Mrs. Shalini & Mr. Aakash Mittal", blessingFrom:"Smt. Lata Devi & Sm. Kamal Kapoor", mantra:"ॐ श्री गणेशाय नमः", message:"We are so delighted you are able to join us in celebrating what we hope will be one of the happiest days of our lives.", hashtag:"#AbhishekWedsKanika", weddingDate:"2026-03-11", venue:"Taj Exotica Resort, Goa" };
const EVENTS = [{id:1,name:"Mehendi",date:"Fri, Mar 9",venue:"Taj Exotica",time:"6 PM",icon:"🌿",color:"#4D6B3A"},{id:2,name:"Haldi",date:"Sat, Mar 10",venue:"Taj Exotica",time:"10 AM",icon:"💛",color:"#D4A853"},{id:3,name:"Shaadi",date:"Sun, Mar 11",venue:"Taj Exotica",time:"6 PM",icon:"💍",color:"#C73866"},{id:4,name:"Reception",date:"Mon, Mar 12",venue:"Taj Exotica",time:"7 PM",icon:"🎉",color:"#7A5A1E"}];

export const Route = createFileRoute("/preview")({ component: PreviewPage });

function PreviewPage() {
  const { data: tmpls = [] } = useQuery(templatesQueryOptions());
  const { data: user } = useQuery(sessionQueryOptions());
  const tmpl = tmpls[0] || { id:"beach", gradient:"linear-gradient(135deg,#A67C2E,#D4A853,#FFE49A,#C49A3D)", colors:{primary:"#A67C2E",secondary:"#D4A853",bg:"#FDF8F0",accent:"#F5E6CC",text:"#3A2A10",card:"#FFFDF5"} };
  const [showShare, setShowShare] = useState(false);
  return <div className="pt-[68px] min-h-screen" style={{background:tmpl.colors.bg}}>
    <div className="max-w-lg mx-auto bg-white shadow-gold-xl">
      <InvitationPreview invitation={INV} events={EVENTS} template={tmpl} fullWidth/>
      {/* Inline ad for free users */}
      {(!user || user?.showAds) && <div className="px-5 pb-4"><InlineAd user={user||null}/></div>}
    </div>
    <div className="fixed bottom-6 right-6 flex gap-3 z-50">
      <Link to="/editor" className="px-5 py-3 bg-white rounded-full text-xs font-semibold tracking-[1.5px] uppercase shadow-gold-lg border border-gold-200/20 hover:-translate-y-0.5 transition-all">← Editor</Link>
      <button onClick={()=>setShowShare(true)} className="btn-gold !py-3 shadow-gold-lg">✦ Share Invite</button>
    </div>
    {showShare && <ShareModal groomName="Abhishek" brideName="Kanika" onClose={()=>setShowShare(false)}/>}
  </div>;
}
