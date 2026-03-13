import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { templatesQueryOptions, sessionQueryOptions } from "~/lib/queries";
import { CoupleForm, EventsForm, DetailsForm } from "~/components/EditorForm";
import { InvitationPreview } from "~/components/InvitationPreview";
import { TemplateSwitcher } from "~/components/VirtualTemplateGrid";
import { AIDesignGenerator } from "~/components/AIDesignGenerator";
import { ShareModal } from "~/components/ShareModal";
import { AdBanner, InlineAd } from "~/components/AdBanner";

export const Route = createFileRoute("/editor")({
  validateSearch: (s: Record<string,unknown>) => ({ template: (s.template as string) || "beach" }),
  component: EditorPage,
});

const TABS = ["couple","events","details","style","ai"] as const;
const DEFAULT_EVENTS = [
  {id:1,name:"Mehendi",date:"Friday, March 9th 2026",venue:"Taj Exotica Resort, Goa",time:"6 PM",icon:"🌿",color:"#4D6B3A"},
  {id:2,name:"Haldi",date:"Saturday, March 10th 2026",venue:"Taj Exotica Resort, Goa",time:"10 AM",icon:"💛",color:"#D4A853"},
  {id:3,name:"Shaadi",date:"Sunday, March 11th 2026",venue:"Taj Exotica Resort, Goa",time:"6 PM",icon:"💍",color:"#C73866"},
  {id:4,name:"Reception",date:"Monday, March 12th 2026",venue:"Taj Exotica Resort, Goa",time:"7 PM",icon:"🎉",color:"#7A5A1E"},
];

function EditorPage() {
  const { template: tmplId } = Route.useSearch();
  const { data: allTemplates = [] } = useQuery(templatesQueryOptions());
  const { data: user } = useQuery(sessionQueryOptions());
  const tmpl = allTemplates.find((t: any)=>t.id===tmplId) || allTemplates[0];
  const [tab, setTab] = useState<typeof TABS[number]>("couple");
  const [showShare, setShowShare] = useState(false);
  const [selectedTmpl, setSelectedTmpl] = useState(tmplId);
  const activeTmpl = allTemplates.find((t: any)=>t.id===selectedTmpl) || tmpl || { id:"beach", gradient:"linear-gradient(135deg,#A67C2E,#D4A853)", colors:{primary:"#A67C2E",secondary:"#D4A853",bg:"#FDF8F0",accent:"#F5E6CC",text:"#3A2A10",card:"#FFFDF5"} };

  const [inv, setInv] = useState({
    groomName:"Abhishek", brideName:"Kanika", groomFamily:"Mrs. Reena & Mr. Rajiv Kapoor",
    brideFamily:"Mrs. Shalini & Mr. Aakash Mittal", blessingFrom:"Smt. Lata Devi & Sm. Kamal Kapoor",
    mantra:"ॐ श्री गणेशाय नमः", message:"We are so delighted you are able to join us in celebrating what we hope will be one of the happiest days of our lives.",
    hashtag:"#AbhishekWedsKanika", weddingDate:"2026-03-11", venue:"Taj Exotica Resort, Goa",
    mapLink:"https://maps.google.com", instagramLink:"https://instagram.com", whatsappNumber:"+91 98765 43210",
  });
  const [events, setEvents] = useState(DEFAULT_EVENTS);

  return <>
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-screen pt-[68px]">
      {/* SIDEBAR */}
      <div className="bg-white border-r border-gold-200/12 overflow-y-auto pb-20">
        <div className="flex border-b border-gold-200/12 sticky top-0 z-10 bg-white">
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} className={`flex-1 py-3.5 text-[9px] font-semibold tracking-[1.5px] uppercase border-b-2 ${tab===t?"text-gold-700 border-gold-500":"text-cream-800/30 border-transparent hover:text-cream-800/50"}`}>{t==="ai"?"✨ AI":t}</button>)}
        </div>
        <div className="p-5">
          {tab==="couple" && <CoupleForm defaultValues={inv} onSave={v=>setInv({...inv,...v})}/>}
          {tab==="events" && <EventsForm events={events} onAdd={(e: any)=>setEvents([...events,{...e,id:Date.now()}])} onRemove={(id: number)=>setEvents(events.filter(e=>e.id!==id))}/>}
          {tab==="details" && <DetailsForm defaultValues={inv} onSave={v=>setInv({...inv,...v})}/>}
          {tab==="style" && <div className="space-y-6">
            <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-3">Choose Template</label><TemplateSwitcher templates={allTemplates} activeId={selectedTmpl} onSelect={t=>setSelectedTmpl(t.id)}/></div>
            <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-3">Active</label><div className="p-4 rounded-xl bg-cream-50/60 border border-gold-200/15"><div className="flex items-center gap-2.5 mb-2"><span className="text-xl">{activeTmpl.emoji}</span><h3 className="font-display text-lg font-semibold">{activeTmpl.name}</h3></div><p className="text-xs opacity-45">{activeTmpl.description}</p></div></div>
            <div><label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-3">Colors</label><div className="flex gap-2.5 flex-wrap">{Object.entries(activeTmpl.colors).map(([k,v])=><div key={k} className="text-center"><div className="w-10 h-10 rounded-lg shadow-sm border border-white/50" style={{background:v as string}}/><span className="text-[8px] opacity-25 mt-0.5 block capitalize">{k}</span></div>)}</div></div>
          </div>}
          {tab==="ai" && <AIDesignGenerator user={user||null} onApply={r=>{/* Apply AI result */}}/>}

          {/* Ad in sidebar for free users */}
          {(!user || user.showAds) && tab !== "ai" && <div className="mt-6"><AdBanner user={user||null} slot="editor_bottom" ad={{id:"ai-cta",title:"AI-Powered Designs",description:"Let AI generate unique palettes and suggestions.",ctaText:"Try AI Tab →",ctaLink:"/editor",gradient:"linear-gradient(135deg,#4A3A6B,#7A6AAB,#D4A853)",icon:"✨"}}/></div>}
        </div>
      </div>

      {/* PREVIEW */}
      <div className="hidden lg:flex items-start justify-center bg-cream-200/40 py-10 px-6 overflow-y-auto">
        <div className="phone-frame"><div className="w-[100px] h-[26px] bg-[#1a1a1a] rounded-b-2xl mx-auto relative z-20"/>
          <div className="h-[694px] overflow-y-auto overflow-x-hidden" style={{scrollbarWidth:"none"}}>
            <InvitationPreview invitation={inv} events={events} template={activeTmpl}/>
          </div>
        </div>
      </div>
    </div>

    {/* PUBLISH BAR */}
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gold-200/15 px-6 py-3 flex items-center justify-end gap-3">
      <span className="text-xs opacity-30 mr-auto hidden sm:block">Editing: <span className="font-semibold">{inv.groomName} & {inv.brideName}</span></span>
      <button className="btn-gold !py-2.5 !px-6 !text-[10px]" onClick={()=>setShowShare(true)}>✦ Publish & Share</button>
    </div>
    {showShare && <ShareModal groomName={inv.groomName} brideName={inv.brideName} onClose={()=>setShowShare(false)}/>}
  </>;
}
