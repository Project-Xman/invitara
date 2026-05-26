'use client';

import { Canvas } from './Canvas/Canvas';
import { TopBar } from './Panels/TopBar/TopBar';
import { LeftPanel } from './Panels/LeftPanel/LeftPanel';
import { RightPanel } from './Panels/RightPanel/RightPanel';
import { useKeyboardShortcuts } from '~/studio/_lib/hooks/use-keyboard-shortcuts';
import { ExportDialog } from './Export/ExportDialog';
import { PreviewMode } from './Preview/PreviewMode';
import { AlignmentGuides } from './Selection/AlignmentGuides';
import { ContextMenu } from './Selection/ContextMenu';
import { AnimationTimeline } from './Animation/AnimationTimeline';
import { useStudioStore } from '~/studio/_lib/store';
import { useStudioPersistence } from '~/studio/_lib/hooks/use-studio-persistence';

export function StudioShell() {
  useKeyboardShortcuts();
  useStudioPersistence();
  const previewMode = useStudioStore((s) => s.previewMode);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <div className="relative flex flex-1 flex-col">
          {/* Cinematic canvas backdrop */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{ background: 'oklch(0.05 0.005 270)' }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.84 0.10 88 / 0.06), transparent 70%)',
              }}
            />
            <div className="relative h-full">
              <Canvas />
            </div>
          </div>
          <AnimationTimeline />
        </div>
        <RightPanel />
      </div>
      <AlignmentGuides />
      <ContextMenu />
      {previewMode && <PreviewMode />}
      <ExportDialog />
    </div>
  );
}
