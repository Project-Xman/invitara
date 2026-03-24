'use client';

import { useEffect } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { isStudioDocumentV1 } from '~/studio/_lib/utils/document';
import { clearStudioDocument, loadStudioDocument, saveStudioDocument } from '~/studio/_lib/utils/persistence';

export function useStudioPersistence() {
  useEffect(() => {
    let cancelled = false;

    void loadStudioDocument()
      .then((document) => {
        if (cancelled || !document || !isStudioDocumentV1(document)) {
          useStudioStore.getState().markDocumentSaved();
          return;
        }

        useStudioStore.getState().hydrateDocument(document);
        useStudioStore.getState().markDocumentSaved();
      })
      .catch(() => {
        useStudioStore.getState().markDocumentSaved();
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let saving = false;
    let pending = false;

    const scheduleSave = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void flushSave();
      }, 250);
    };

    const flushSave = async () => {
      if (saving) {
        pending = true;
        return;
      }

      const state = useStudioStore.getState();
      if (!state.hydrated || !state.documentDirty) return;

      saving = true;
      pending = false;
      const snapshot = state.exportDocument();
      const savedSignature = JSON.stringify(snapshot);

      try {
        await saveStudioDocument(snapshot);
        const currentSignature = JSON.stringify(useStudioStore.getState().exportDocument());
        if (currentSignature === savedSignature) {
          useStudioStore.getState().markDocumentSaved();
        } else {
          pending = true;
        }
      } finally {
        saving = false;
        const latestState = useStudioStore.getState();
        if (pending || latestState.documentDirty) {
          pending = false;
          scheduleSave();
        }
      }
    };

    const unsubscribe = useStudioStore.subscribe((state) => {
      if (!state.hydrated || !state.documentDirty) return;
      if (saving) {
        pending = true;
        return;
      }
      scheduleSave();
    });

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return {
    clearPersistedDocument: clearStudioDocument,
  };
}
