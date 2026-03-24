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
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <Canvas />
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
