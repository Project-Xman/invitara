'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStudioStore } from '~/studio/_lib/store';

export function AnimationTimeline() {
  const animationPanelOpen = useStudioStore((s) => s.animationPanelOpen);
  const toggleAnimationPanel = useStudioStore((s) => s.toggleAnimationPanel);
  const selectedIds = useStudioStore((s) => s.selectedIds);
  const nodes = useStudioStore((s) => s.nodes);
  const updateNode = useStudioStore((s) => s.updateNode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(2);
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  const selectedNode = selectedIds.length === 1 ? nodes[selectedIds[0]] : null;
  const animation = selectedNode?.animation;

  useEffect(() => {
    if (!animation) return;
    const maxDur = animation.keyframes.reduce((max, kf) => Math.max(max, kf.duration + kf.delay), 0);
    if (maxDur > 0) setDuration(maxDur);
  }, [animation]);

  const play = useCallback(() => {
    setIsPlaying(true);
    startTimeRef.current = performance.now() - currentTime * 1000;
    const tick = (now: number) => {
      const elapsed = ((now - startTimeRef.current) / 1000) * speed;
      if (elapsed >= duration) {
        setCurrentTime(0);
        startTimeRef.current = now;
      } else {
        setCurrentTime(elapsed);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [currentTime, duration, speed]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!animationPanelOpen) {
    return (
      <button
        onClick={toggleAnimationPanel}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] text-neutral-500 hover:text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-full transition-colors z-20"
      >
        Show Timeline
      </button>
    );
  }

  return (
    <div className="h-36 border-t border-neutral-800 bg-neutral-900 shrink-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Timeline</span>
          {selectedNode && (
            <span className="text-[10px] text-neutral-500">{selectedNode.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={isPlaying ? pause : play}
            disabled={!animation || animation.keyframes.length === 0}
            className="px-2 py-0.5 text-[11px] bg-neutral-800 hover:bg-neutral-700 rounded disabled:opacity-30 transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="px-1 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 rounded text-neutral-300 focus:outline-none"
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
          <span className="text-[10px] text-neutral-500 tabular-nums w-12">{currentTime.toFixed(2)}s</span>
          <button onClick={toggleAnimationPanel} className="text-neutral-500 hover:text-neutral-300 text-xs">x</button>
        </div>
      </div>

      {/* Timeline body */}
      <div className="flex-1 relative overflow-hidden px-3 py-2">
        {!animation || animation.keyframes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-neutral-600">
            Select a node with animations to view timeline
          </div>
        ) : (
          <>
            {/* Time ruler */}
            <div className="flex items-center h-4 mb-1">
              {Array.from({ length: Math.ceil(duration * 4) + 1 }, (_, i) => i * 0.25).map((t) => (
                <div key={t} className="text-[8px] text-neutral-600 absolute" style={{ left: `${(t / duration) * 100}%` }}>
                  {t.toFixed(1)}s
                </div>
              ))}
            </div>

            {/* Keyframe tracks */}
            {animation.keyframes.map((kf, i) => (
              <div key={i} className="relative h-6 mb-0.5 bg-neutral-800/50 rounded flex items-center">
                <span className="text-[9px] text-neutral-500 pl-1 w-12 shrink-0">{kf.property}</span>
                <div className="flex-1 relative h-full">
                  <div
                    className="absolute h-3 top-1.5 bg-indigo-600/30 rounded"
                    style={{ left: `${(kf.delay / duration) * 100}%`, width: `${(kf.duration / duration) * 100}%` }}
                  />
                  {/* Draggable start dot */}
                  <div
                    className="absolute w-3 h-3 bg-indigo-500 rounded-full top-1.5 -translate-x-1/2 cursor-ew-resize z-10 hover:scale-150 transition-transform"
                    style={{ left: `${(kf.delay / duration) * 100}%` }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const rect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                      const onMove = (me: PointerEvent) => {
                        const ratio = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
                        const newDelay = Math.round(ratio * duration * 100) / 100;
                        if (selectedNode?.animation) {
                          const newKf = [...selectedNode.animation.keyframes];
                          newKf[i] = { ...newKf[i], delay: Math.max(0, newDelay) };
                          updateNode(selectedNode.id, { animation: { ...selectedNode.animation, keyframes: newKf } });
                        }
                      };
                      const onUp = () => {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onUp);
                      };
                      window.addEventListener('pointermove', onMove);
                      window.addEventListener('pointerup', onUp);
                    }}
                  />
                  {/* Draggable end dot */}
                  <div
                    className="absolute w-3 h-3 bg-indigo-400 rounded-full top-1.5 -translate-x-1/2 cursor-ew-resize z-10 hover:scale-150 transition-transform"
                    style={{ left: `${((kf.delay + kf.duration) / duration) * 100}%` }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const rect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                      const onMove = (me: PointerEvent) => {
                        const ratio = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
                        const endTime = ratio * duration;
                        const newDuration = Math.max(0.05, Math.round((endTime - kf.delay) * 100) / 100);
                        if (selectedNode?.animation) {
                          const newKf = [...selectedNode.animation.keyframes];
                          newKf[i] = { ...newKf[i], duration: newDuration };
                          updateNode(selectedNode.id, { animation: { ...selectedNode.animation, keyframes: newKf } });
                        }
                      };
                      const onUp = () => {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onUp);
                      };
                      window.addEventListener('pointermove', onMove);
                      window.addEventListener('pointerup', onUp);
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full -translate-x-1/2" />
            </div>

            {/* Scrub click */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                setCurrentTime(Math.max(0, Math.min(duration, ratio * duration)));
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
