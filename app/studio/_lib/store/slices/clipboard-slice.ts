import type { StateCreator } from 'zustand';
import type { StudioStore, StudioNode } from '~/studio/_lib/types';
import { generateId } from '~/studio/_lib/utils/id';
import { getCurrentPageRootIds, setCurrentPageRootIds } from '~/studio/_lib/utils/document';

export const createClipboardSlice: StateCreator<
  StudioStore,
  [['zustand/immer', never]],
  [],
  Pick<StudioStore, 'copiedNodeIds' | 'copiedNodes' | 'copy' | 'paste' | 'cut' | 'pasteStyle'>
> = (set, get) => ({
  copiedNodeIds: [],
  copiedNodes: {},

  copy: () => {
    const { selectedIds, nodes } = get();
    if (selectedIds.length === 0) return;

    const snapshot: Record<string, StudioNode> = {};
    const collectSubtree = (id: string) => {
      const node = nodes[id];
      if (!node) return;
      snapshot[id] = JSON.parse(JSON.stringify(node));
      node.childrenIds.forEach(collectSubtree);
    };
    selectedIds.forEach(collectSubtree);

    set((state) => {
      state.copiedNodeIds = [...selectedIds];
      state.copiedNodes = snapshot;
    });
  },

  paste: (parentId?: string) => {
    const { copiedNodeIds, copiedNodes } = get();
    if (copiedNodeIds.length === 0) return;

    get().pushHistory();
    set((state) => {
      const idMap = new Map<string, string>();

      // Generate new IDs for all copied nodes
      for (const id of Object.keys(copiedNodes)) {
        idMap.set(id, generateId());
      }

      // Clone nodes with new IDs
      for (const [oldId, newId] of idMap) {
        const source = copiedNodes[oldId];
        if (!source) continue;

        const cloned: StudioNode = JSON.parse(JSON.stringify(source));
        cloned.id = newId;
        cloned.version = 0;
        cloned.childrenIds = source.childrenIds
          .map((cid) => idMap.get(cid))
          .filter(Boolean) as string[];

        // Update parent reference
        const newParent = idMap.get(source.parentId ?? '');
        if (newParent) {
          cloned.parentId = newParent;
        } else {
          cloned.parentId = parentId ?? null;
        }

        state.nodes[newId] = cloned;
      }

      // Add top-level pasted nodes to parent or root
      for (const copiedId of copiedNodeIds) {
        const newId = idMap.get(copiedId);
        if (!newId) continue;

        if (parentId && state.nodes[parentId]) {
          state.nodes[newId].parentId = parentId;
          state.nodes[parentId].childrenIds.push(newId);
          state.nodes[parentId].version++;
        } else {
          state.nodes[newId].parentId = null;
          const roots = getCurrentPageRootIds(state);
          roots.push(newId);
          setCurrentPageRootIds(state, roots);
        }
      }

      // Select pasted nodes
      state.selectedIds = copiedNodeIds
        .map((id) => idMap.get(id))
        .filter(Boolean) as string[];
    });
  },

  cut: () => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;
    get().copy();
    get().deleteNodes([...selectedIds]);
  },

  pasteStyle: () => {
    const { copiedNodeIds, copiedNodes, selectedIds } = get();
    if (copiedNodeIds.length === 0 || selectedIds.length === 0) return;

    const sourceNode = copiedNodes[copiedNodeIds[0]];
    if (!sourceNode) return;

    get().pushHistory();
    set((state) => {
      for (const targetId of selectedIds) {
        const target = state.nodes[targetId];
        if (!target) continue;
        target.style = JSON.parse(JSON.stringify(sourceNode.style));
        target.version++;
      }
    });
  },
});
