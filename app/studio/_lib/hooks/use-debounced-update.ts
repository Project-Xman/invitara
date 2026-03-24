'use client';

import { useCallback, useRef } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

export function useDebouncedUpdate() {
  const updateNode = useStudioStore((s) => s.updateNode);
  const pushHistory = useStudioStore((s) => s.pushHistory);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPushedRef = useRef(false);

  const debouncedUpdate = useCallback(
    (id: string, patch: Partial<StudioNode>) => {
      if (!hasPushedRef.current) {
        pushHistory();
        hasPushedRef.current = true;
      }
      updateNode(id, patch);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        hasPushedRef.current = false;
      }, 500);
    },
    [updateNode, pushHistory]
  );

  return debouncedUpdate;
}
