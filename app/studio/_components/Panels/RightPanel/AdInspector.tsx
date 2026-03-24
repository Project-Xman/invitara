'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode, AdProps } from '~/studio/_lib/types';

interface AdInspectorProps {
  node: StudioNode;
}

const AD_SLOTS = ['hero_banner', 'template_sidebar', 'editor_bottom', 'dashboard_top', 'preview_footer', 'between_events'];
const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f97316, #ec4899)',
];

export function AdInspector({ node }: AdInspectorProps) {
  const updateNode = useStudioStore((s) => s.updateNode);

  const updateAd = useCallback(
    (patch: Partial<AdProps>) => {
      if (!node.adProps) return;
      updateNode(node.id, { adProps: { ...node.adProps, ...patch } });
    },
    [node, updateNode]
  );

  if (node.type !== 'ad' || !node.adProps) return null;
  const ad = node.adProps;

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-amber-400 uppercase tracking-wider">Ad Container</div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Ad Slot</span>
        <select value={ad.slot} onChange={(e) => updateAd({ slot: e.target.value })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-amber-500 focus:outline-none">
          {AD_SLOTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Title</span>
        <input type="text" value={ad.adTitle} onChange={(e) => updateAd({ adTitle: e.target.value })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-amber-500 focus:outline-none" />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Description</span>
        <textarea value={ad.adDescription} onChange={(e) => updateAd({ adDescription: e.target.value })} rows={2}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-amber-500 focus:outline-none resize-none" />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">CTA Text</span>
          <input type="text" value={ad.ctaText} onChange={(e) => updateAd({ ctaText: e.target.value })}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:outline-none" />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">CTA Link</span>
          <input type="text" value={ad.ctaLink} onChange={(e) => updateAd({ ctaLink: e.target.value })}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:outline-none" />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Icon (emoji)</span>
        <input type="text" value={ad.icon} onChange={(e) => updateAd({ icon: e.target.value })} maxLength={4}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:outline-none" />
      </label>

      <div className="space-y-1">
        <span className="text-[10px] text-neutral-500">Gradient</span>
        <div className="grid grid-cols-3 gap-1">
          {GRADIENT_PRESETS.map((g, i) => (
            <button key={i} onClick={() => updateAd({ gradient: g })}
              className={`h-6 rounded border transition-all ${ad.gradient === g ? 'border-amber-500 scale-105' : 'border-neutral-700'}`}
              style={{ background: g }} />
          ))}
        </div>
        <input type="text" value={ad.gradient} onChange={(e) => updateAd({ gradient: e.target.value })}
          placeholder="CSS gradient"
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:outline-none mt-1" />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={ad.showDismiss} onChange={() => updateAd({ showDismiss: !ad.showDismiss })}
          className="rounded border-neutral-600 bg-neutral-800 text-amber-500 focus:ring-amber-500" />
        <span className="text-xs text-neutral-300">Show dismiss button</span>
      </label>
    </div>
  );
}
