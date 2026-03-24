'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode, AnimationKeyframe, AnimationProps } from '~/studio/_lib/types';

interface AnimationInspectorProps {
  node: StudioNode;
}

const PROPERTIES = ['opacity', 'x', 'y', 'scale', 'rotate'] as const;
const TRIGGERS = ['onMount', 'onHover', 'onScroll', 'onClick'] as const;
const EASING_OPTIONS = ['easeInOut', 'easeIn', 'easeOut', 'linear', 'spring'] as const;

const DEFAULT_KEYFRAME: AnimationKeyframe = {
  property: 'opacity',
  from: 0,
  to: 1,
  duration: 0.5,
  delay: 0,
  ease: 'easeInOut',
};

export function AnimationInspector({ node }: AnimationInspectorProps) {
  const updateNode = useStudioStore((s) => s.updateNode);

  const setAnimation = useCallback(
    (animation: AnimationProps | null) => {
      updateNode(node.id, { animation });
    },
    [node.id, updateNode]
  );

  const addAnimation = useCallback(() => {
    setAnimation({
      trigger: 'onMount',
      keyframes: [{ ...DEFAULT_KEYFRAME }],
      loop: false,
    });
  }, [setAnimation]);

  const updateTrigger = useCallback(
    (trigger: AnimationProps['trigger']) => {
      if (!node.animation) return;
      setAnimation({ ...node.animation, trigger });
    },
    [node.animation, setAnimation]
  );

  const toggleLoop = useCallback(() => {
    if (!node.animation) return;
    setAnimation({ ...node.animation, loop: !node.animation.loop });
  }, [node.animation, setAnimation]);

  const updateKeyframe = useCallback(
    (index: number, patch: Partial<AnimationKeyframe>) => {
      if (!node.animation) return;
      const newKeyframes = [...node.animation.keyframes];
      newKeyframes[index] = { ...newKeyframes[index], ...patch };
      setAnimation({ ...node.animation, keyframes: newKeyframes });
    },
    [node.animation, setAnimation]
  );

  const addKeyframe = useCallback(() => {
    if (!node.animation) return;
    setAnimation({
      ...node.animation,
      keyframes: [...node.animation.keyframes, { ...DEFAULT_KEYFRAME }],
    });
  }, [node.animation, setAnimation]);

  const removeKeyframe = useCallback(
    (index: number) => {
      if (!node.animation) return;
      const newKeyframes = node.animation.keyframes.filter((_, i) => i !== index);
      if (newKeyframes.length === 0) {
        setAnimation(null);
      } else {
        setAnimation({ ...node.animation, keyframes: newKeyframes });
      }
    },
    [node.animation, setAnimation]
  );

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 uppercase tracking-wider">Animation</span>
        {node.animation ? (
          <button
            onClick={() => setAnimation(null)}
            className="text-[10px] text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={addAnimation}
            className="text-[10px] text-indigo-400 hover:text-indigo-300"
          >
            + Add
          </button>
        )}
      </div>

      {node.animation && (
        <div className="space-y-3">
          {/* Trigger */}
          <label className="block space-y-1">
            <span className="text-[10px] text-neutral-500">Trigger</span>
            <select
              value={node.animation.trigger}
              onChange={(e) => updateTrigger(e.target.value as AnimationProps['trigger'])}
              className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          {/* Scroll Offset (when trigger is onScroll) */}
          {node.animation.trigger === 'onScroll' && (
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-[10px] text-neutral-500">Start Offset</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={node.animation.scrollOffset?.[0] ?? 0}
                  onChange={(e) => {
                    const start = parseFloat(e.target.value) || 0;
                    const end = node.animation!.scrollOffset?.[1] ?? 1;
                    setAnimation({ ...node.animation!, scrollOffset: [start, end] });
                  }}
                  className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] text-neutral-500">End Offset</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={node.animation.scrollOffset?.[1] ?? 1}
                  onChange={(e) => {
                    const start = node.animation!.scrollOffset?.[0] ?? 0;
                    const end = parseFloat(e.target.value) || 1;
                    setAnimation({ ...node.animation!, scrollOffset: [start, end] });
                  }}
                  className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
                />
              </label>
            </div>
          )}

          {/* Loop */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={node.animation.loop}
              onChange={toggleLoop}
              className="rounded border-neutral-600 bg-neutral-800 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-xs text-neutral-300">Loop</span>
          </label>

          {/* Keyframes */}
          <div className="space-y-2">
            {node.animation.keyframes.map((kf, i) => (
              <div key={i} className="p-2 bg-neutral-800 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">Keyframe {i + 1}</span>
                  <button
                    onClick={() => removeKeyframe(i)}
                    className="text-[10px] text-neutral-500 hover:text-red-400"
                  >
                    x
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <label className="space-y-0.5">
                    <span className="text-[9px] text-neutral-600">Property</span>
                    <select
                      value={kf.property}
                      onChange={(e) => updateKeyframe(i, { property: e.target.value as AnimationKeyframe['property'] })}
                      className="w-full px-1.5 py-1 text-[11px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
                    >
                      {PROPERTIES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[9px] text-neutral-600">Ease</span>
                    <select
                      value={kf.ease}
                      onChange={(e) => updateKeyframe(i, { ease: e.target.value })}
                      className="w-full px-1.5 py-1 text-[11px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
                    >
                      {EASING_OPTIONS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Easing curve preview */}
                    <div className="col-span-2">
                      <svg width="100%" height="24" viewBox="0 0 100 24" className="bg-neutral-900 rounded">
                        <path
                          d={kf.ease === 'linear' ? 'M 5 20 L 95 4' :
                             kf.ease === 'easeIn' ? 'M 5 20 C 40 20, 60 5, 95 4' :
                             kf.ease === 'easeOut' ? 'M 5 20 C 30 19, 60 4, 95 4' :
                             kf.ease === 'easeInOut' ? 'M 5 20 C 30 20, 70 4, 95 4' :
                             'M 5 20 C 5 4, 50 20, 95 4'}
                          fill="none"
                          stroke="#818cf8"
                          strokeWidth={1.5}
                        />
                      </svg>
                    </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <label className="space-y-0.5">
                    <span className="text-[9px] text-neutral-600">From</span>
                    <input
                      type="number"
                      step={0.1}
                      value={kf.from}
                      onChange={(e) => updateKeyframe(i, { from: parseFloat(e.target.value) || 0 })}
                      className="w-full px-1.5 py-1 text-[11px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-center focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[9px] text-neutral-600">To</span>
                    <input
                      type="number"
                      step={0.1}
                      value={kf.to}
                      onChange={(e) => updateKeyframe(i, { to: parseFloat(e.target.value) || 0 })}
                      className="w-full px-1.5 py-1 text-[11px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-center focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[9px] text-neutral-600">Duration</span>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      value={kf.duration}
                      onChange={(e) => updateKeyframe(i, { duration: parseFloat(e.target.value) || 0.3 })}
                      className="w-full px-1.5 py-1 text-[11px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-center focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[9px] text-neutral-600">Delay</span>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      value={kf.delay}
                      onChange={(e) => updateKeyframe(i, { delay: parseFloat(e.target.value) || 0 })}
                      className="w-full px-1.5 py-1 text-[11px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-center focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              onClick={addKeyframe}
              className="w-full py-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 border border-dashed border-neutral-700 rounded hover:border-indigo-500 transition-colors"
            >
              + Add Keyframe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
