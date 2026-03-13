import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { templatesQueryOptions } from "~/lib/queries";
import { VirtualTemplateGrid } from "~/components/VirtualTemplateGrid";

const CATS = ["All","Hindu Weddings","Christian Weddings","Sikh Weddings","Muslim Weddings","South-Indian Weddings","Save the Date"];

export const Route = createFileRoute("/templates")({ component: TemplatesPage });

function TemplatesPage() {
  const [cat, setCat] = useState("All");
  const { data: tmpls = [] } = useQuery(templatesQueryOptions(cat));
  const nav = useNavigate();
  return <div className="pt-[68px] min-h-screen"><div className="max-w-[1320px] mx-auto px-6 lg:px-8 py-16">
    <div className="text-center mb-12 animate-fade-up"><p className="text-[11px] font-semibold tracking-[3px] uppercase text-gold-600/70 mb-3">All Templates</p><h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Choose Your <span className="text-golden">Perfect Design</span></h1><p className="font-body text-lg text-cream-800/50">{tmpls.length} handcrafted templates</p></div>
    <div className="flex flex-wrap gap-2 justify-center mb-10">{CATS.map(c=><button key={c} onClick={()=>setCat(c)} className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide border ${cat===c?"bg-gold-700 text-white border-gold-700 shadow-gold":"bg-white text-cream-800/50 border-gold-200/25 hover:border-gold-400"}`}>{c}</button>)}</div>
    <VirtualTemplateGrid templates={tmpls} onSelect={t=>nav({to:"/editor",search:{template:t.id}})} columns={3}/>
  </div></div>;
}
