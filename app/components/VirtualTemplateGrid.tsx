import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Template { id: string; name: string; category: string; price: number; emoji: string; description: string; gradient: string; colors: Record<string,string>; isFree?: boolean }

export function VirtualTemplateGrid({ templates, onSelect, columns = 3 }: { templates: Template[]; onSelect: (t: Template) => void; columns?: number }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = Math.ceil(templates.length / columns);
  const virt = useVirtualizer({ count: rows, getScrollElement: () => parentRef.current, estimateSize: () => 440, overscan: 2 });
  return <div ref={parentRef} className="max-h-[900px] overflow-y-auto rounded-2xl pr-1">
    <div className="relative w-full" style={{ height: `${virt.getTotalSize()}px` }}>
      {virt.getVirtualItems().map(vRow => {
        const start = vRow.index * columns;
        const items = templates.slice(start, start + columns);
        return <div key={vRow.key} className="absolute left-0 w-full" style={{ top: `${vRow.start}px`, height: `${vRow.size}px` }}>
          <div className="grid gap-6 pb-6" style={{ gridTemplateColumns: `repeat(${columns},1fr)` }}>
            {items.map(t => <div key={t.id} className="group bg-white rounded-2xl overflow-hidden border border-gold-200/12 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-gold-lg relative" onClick={() => onSelect(t)}>
              {t.isFree && <span className="absolute top-3 right-3 z-30 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold tracking-[1px] uppercase">Free</span>}
              <div className="h-56 relative overflow-hidden"><div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{background:t.gradient}}/><div className="absolute inset-0 flex items-center justify-center text-white z-10"><div className="text-center"><h3 className="font-script text-3xl drop-shadow-md">Preview</h3><span className="font-body text-[10px] tracking-[5px] uppercase opacity-60 block mt-1">{t.name}</span></div></div></div>
              <div className="p-5"><div className="text-[9px] font-semibold tracking-[2px] uppercase text-gold-600/45 mb-1">{t.category}</div><div className="flex items-center gap-2 mb-1"><span>{t.emoji}</span><h3 className="font-display text-lg font-semibold">{t.name}</h3></div><p className="text-xs opacity-40 mb-3">{t.description}</p><div className="flex items-center justify-between"><span className="font-display text-lg font-bold text-gold-700">{t.isFree?"Free":"₹"+t.price.toLocaleString("en-IN")}</span><span className="btn-gold !py-1.5 !px-4 !text-[9px]">Customize →</span></div></div>
            </div>)}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

export function TemplateSwitcher({ templates, activeId, onSelect }: { templates: Template[]; activeId: string; onSelect: (t: Template) => void }) {
  return <div className="flex flex-wrap gap-2">{templates.map(t => <button key={t.id} onClick={()=>onSelect(t)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-base transition-all border-2 hover:scale-105 ${activeId===t.id?"border-gold-500 shadow-gold scale-110":"border-transparent hover:border-gold-300/50"}`} style={{background:t.gradient}} title={t.name}><span className="drop-shadow-md">{t.emoji}</span></button>)}</div>;
}
