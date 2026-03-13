import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Template {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  description: string;
  gradient: string;
  colors: Record<string, string>;
  isFree?: boolean;
}

const EMPTY_OWNED: string[] = [];

export function VirtualTemplateGrid({
  templates,
  onSelect,
  columns = 3,
  ownedIds = EMPTY_OWNED,
  buyingId,
}: {
  templates: Template[];
  onSelect: (t: Template) => void;
  columns?: number;
  ownedIds?: string[];
  buyingId?: string | null;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = Math.ceil(templates.length / columns);
  const virt = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 440,
    overscan: 2,
  });
  const ownedSet = new Set(ownedIds);
  return (
    <div ref={parentRef} className="max-h-[900px] overflow-y-auto rounded-2xl pr-1">
      <div className="relative w-full" style={{ height: `${virt.getTotalSize()}px` }}>
        {virt.getVirtualItems().map((vRow) => {
          const start = vRow.index * columns;
          const items = templates.slice(start, start + columns);
          return (
            <div
              key={vRow.key}
              className="absolute left-0 w-full"
              style={{ top: `${vRow.start}px`, height: `${vRow.size}px` }}
            >
              <div
                className="grid gap-6 pb-6"
                style={{ gridTemplateColumns: `repeat(${columns},1fr)` }}
              >
                {items.map((t) => {
                  const isOwned = t.isFree || ownedSet.has(t.id);
                  const isLoading = buyingId === t.id;
                  const ctaLabel = isLoading
                    ? "Processing…"
                    : isOwned
                      ? "Customize →"
                      : `Buy ₹${t.price.toLocaleString("en-IN")} →`;
                  return (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      className={`border-gold-200/12 group relative overflow-hidden rounded-2xl border bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-gold-lg ${isLoading ? "cursor-wait" : "cursor-pointer"}`}
                      onClick={() => !isLoading && onSelect(t)}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !isLoading) {
                          e.preventDefault();
                          onSelect(t);
                        }
                      }}
                    >
                      {t.isFree && (
                        <span className="absolute right-3 top-3 z-30 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] text-white">
                          Free
                        </span>
                      )}
                      {!t.isFree && isOwned && !t.isFree && (
                        <span className="absolute right-3 top-3 z-30 rounded-full bg-gold-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] text-white">
                          Owned
                        </span>
                      )}
                      <div className="relative h-56 overflow-hidden">
                        <div
                          className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                          style={{ background: t.gradient }}
                        />
                        <div className="absolute inset-0 z-10 flex items-center justify-center text-white">
                          <div className="text-center">
                            <h3 className="font-script text-3xl drop-shadow-md">Preview</h3>
                            <span className="mt-1 block font-body text-[10px] uppercase tracking-[5px] opacity-60">
                              {t.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="mb-1 text-[9px] font-semibold uppercase tracking-[2px] text-gold-600/45">
                          {t.category}
                        </div>
                        <div className="mb-1 flex items-center gap-2">
                          <span>{t.emoji}</span>
                          <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                        </div>
                        <p className="mb-3 text-xs opacity-40">{t.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-display text-lg font-bold text-gold-700">
                            {t.isFree ? "Free" : "₹" + t.price.toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`btn-gold !px-4 !py-1.5 !text-[9px] ${isLoading ? "opacity-60" : ""}`}
                          >
                            {ctaLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TemplateSwitcher({
  templates,
  activeId,
  onSelect,
}: {
  templates: Template[];
  activeId: string;
  onSelect: (t: Template) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-base transition-all hover:scale-105 ${activeId === t.id ? "scale-110 border-gold-500 shadow-gold" : "border-transparent hover:border-gold-300/50"}`}
          style={{ background: t.gradient }}
          title={t.name}
        >
          <span className="drop-shadow-md">{t.emoji}</span>
        </button>
      ))}
    </div>
  );
}
