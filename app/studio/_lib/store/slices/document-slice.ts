import type { StateCreator } from 'zustand';
import type {
  CSSVariable,
  DesignToken,
  DeviceMode,
  ImageProps,
  LayoutProps,
  NodeType,
  StudioAsset,
  StudioDocumentV1,
  StudioNode,
  StudioStore,
  StyleProps,
  TextProps,
  ThreeDProps,
  TransformProps,
  VectorProps,
} from '~/studio/_lib/types';
import { createNode } from '~/studio/_lib/utils/node-factory';
import {
  createInitialStudioDocument,
  deepMerge,
  getCurrentPageRootIds,
  sanitizeImportedDocument,
  setCurrentPageRootIds,
  toStudioDocument,
} from '~/studio/_lib/utils/document';
import { generateId } from '~/studio/_lib/utils/id';

type Slice = Pick<
  StudioStore,
  | 'nodes'
  | 'components'
  | 'pages'
  | 'activePageId'
  | 'sharedStyles'
  | 'tokens'
  | 'cssVariables'
  | 'assetLibrary'
  | 'documentVersion'
  | 'documentDirty'
  | 'lastSavedAt'
  | 'hydrated'
  | 'addNode'
  | 'deleteNodes'
  | 'updateNode'
  | 'patchNode'
  | 'updateNodeTransform'
  | 'updateNodeLayout'
  | 'updateNodeStyle'
  | 'updateTextProps'
  | 'updateImageProps'
  | 'updateVectorProps'
  | 'updateThreeDProps'
  | 'updateResponsiveProps'
  | 'clearResponsiveProps'
  | 'moveNode'
  | 'duplicateNodes'
  | 'createComponent'
  | 'detachInstance'
  | 'groupNodes'
  | 'ungroupNode'
  | 'addPage'
  | 'deletePage'
  | 'setActivePage'
  | 'renamePage'
  | 'addSharedStyle'
  | 'deleteSharedStyle'
  | 'applySharedStyle'
  | 'addToken'
  | 'updateToken'
  | 'deleteToken'
  | 'addCSSVariable'
  | 'updateCSSVariable'
  | 'deleteCSSVariable'
  | 'addAsset'
  | 'updateAsset'
  | 'deleteAsset'
  | 'hydrateDocument'
  | 'resetDocument'
  | 'exportDocument'
  | 'importDocument'
  | 'markDocumentDirty'
  | 'markDocumentSaved'
  | 'getCurrentPageRootIds'
>;

function applyDocument(state: StudioStore, document: StudioDocumentV1) {
  state.nodes = document.nodes;
  state.components = document.components;
  state.pages = document.pages;
  state.activePageId = document.activePageId;
  state.sharedStyles = document.sharedStyles;
  state.tokens = document.tokens;
  state.cssVariables = document.cssVariables;
  state.assetLibrary = document.assetLibrary;
  state.documentVersion = document.version;
  state.zoom = document.viewport.zoom;
  state.pan = document.viewport.pan;
  state.device = document.viewport.device;
  state.showGrid = document.viewport.showGrid;
  state.breakpoints = document.viewport.breakpoints;
}

function removeFromParentOrPage(state: StudioStore, nodeId: string) {
  const node = state.nodes[nodeId];
  if (!node) return;

  if (node.parentId && state.nodes[node.parentId]) {
    const parent = state.nodes[node.parentId];
    parent.childrenIds = parent.childrenIds.filter((id) => id !== nodeId);
    parent.version++;
    return;
  }

  const roots = getCurrentPageRootIds(state).filter((id) => id !== nodeId);
  setCurrentPageRootIds(state, roots);
}

export const createDocumentSlice: StateCreator<
  StudioStore,
  [['zustand/immer', never]],
  [],
  Slice
> = (set, get) => {
  const initialDocument = createInitialStudioDocument({
    zoom: 1,
    pan: { x: 0, y: 0 },
    device: 'desktop',
    showGrid: true,
    breakpoints: [
      { id: 'desktop', name: 'Desktop', width: 1440 },
      { id: 'tablet', name: 'Tablet', width: 768 },
      { id: 'mobile', name: 'Mobile', width: 375 },
    ],
  });

  return {
    nodes: initialDocument.nodes,
    components: initialDocument.components,
    pages: initialDocument.pages,
    activePageId: initialDocument.activePageId,
    sharedStyles: initialDocument.sharedStyles,
    tokens: initialDocument.tokens,
    cssVariables: initialDocument.cssVariables,
    assetLibrary: initialDocument.assetLibrary,
    documentVersion: initialDocument.version,
    documentDirty: false,
    lastSavedAt: null,
    hydrated: false,

    getCurrentPageRootIds: () => getCurrentPageRootIds(get()),

    markDocumentDirty: () => {
      set((state) => {
        state.documentDirty = true;
      });
    },

    markDocumentSaved: (timestamp = Date.now()) => {
      set((state) => {
        state.documentDirty = false;
        state.lastSavedAt = timestamp;
        state.hydrated = true;
      });
    },

    hydrateDocument: (document) => {
      const safeDocument = sanitizeImportedDocument(document);
      set((state) => {
        applyDocument(state, safeDocument);
        state.documentDirty = false;
        state.lastSavedAt = Date.now();
        state.hydrated = true;
        state.selectedIds = [];
        state.focusedId = null;
      });
    },

    resetDocument: () => {
      const state = get();
      const fresh = createInitialStudioDocument({
        zoom: state.zoom,
        pan: state.pan,
        device: state.device,
        showGrid: state.showGrid,
        breakpoints: state.breakpoints,
      });
      set((draft) => {
        applyDocument(draft, fresh);
        draft.documentDirty = true;
        draft.selectedIds = [];
        draft.focusedId = null;
        draft.hydrated = true;
      });
    },

    exportDocument: () => toStudioDocument(get()),

    importDocument: (document) => {
      get().pushHistory();
      get().hydrateDocument(document);
      get().markDocumentDirty();
    },

    addNode: (type: NodeType, parentId?: string, initialPatch?: Partial<StudioNode>) => {
      const node = createNode(type, parentId ?? null);
      const preparedNode = initialPatch ? deepMerge(node, initialPatch) : node;

      get().pushHistory();
      set((state) => {
        state.nodes[preparedNode.id] = preparedNode;
        if (parentId && state.nodes[parentId]) {
          state.nodes[parentId].childrenIds.push(preparedNode.id);
          state.nodes[parentId].version++;
        } else {
          preparedNode.parentId = null;
          const roots = getCurrentPageRootIds(state);
          roots.push(preparedNode.id);
          setCurrentPageRootIds(state, roots);
        }
        state.documentDirty = true;
      });

      return preparedNode.id;
    },

    deleteNodes: (ids: string[]) => {
      if (ids.length === 0) return;
      get().pushHistory();
      set((state) => {
        const toDelete = new Set<string>();
        const collect = (id: string) => {
          if (toDelete.has(id)) return;
          toDelete.add(id);
          const node = state.nodes[id];
          if (node) {
            node.childrenIds.forEach(collect);
          }
        };
        ids.forEach(collect);

        for (const id of toDelete) {
          removeFromParentOrPage(state, id);
          delete state.nodes[id];
        }

        state.selectedIds = state.selectedIds.filter((id) => !toDelete.has(id));
        state.documentDirty = true;
      });
    },

    updateNode: (id, patch) => {
      set((state) => {
        const node = state.nodes[id];
        if (!node) return;
        state.nodes[id] = deepMerge(node, patch);
        state.nodes[id].version = node.version + 1;
        state.documentDirty = true;
      });
    },

    patchNode: (id, patch) => {
      get().updateNode(id, patch);
    },

    updateNodeTransform: (id, patch) => {
      const node = get().nodes[id];
      if (!node) return;
      get().updateNode(id, {
        transform: deepMerge(node.transform, patch as Partial<TransformProps>),
      });
    },

    updateNodeLayout: (id, patch) => {
      const node = get().nodes[id];
      if (!node) return;
      get().updateNode(id, {
        layout: deepMerge(node.layout, patch as Partial<LayoutProps>),
      });
    },

    updateNodeStyle: (id, patch) => {
      const node = get().nodes[id];
      if (!node) return;
      get().updateNode(id, {
        style: deepMerge(node.style, patch as Partial<StyleProps>),
      });
    },

    updateTextProps: (id, patch) => {
      const node = get().nodes[id];
      if (!node?.textProps) return;
      get().updateNode(id, {
        textProps: deepMerge(node.textProps, patch as Partial<TextProps>),
      });
    },

    updateImageProps: (id, patch) => {
      const node = get().nodes[id];
      if (!node?.imageProps) return;
      get().updateNode(id, {
        imageProps: deepMerge(node.imageProps, patch as Partial<ImageProps>),
      });
    },

    updateVectorProps: (id, patch) => {
      const node = get().nodes[id];
      if (!node?.vectorProps) return;
      get().updateNode(id, {
        vectorProps: deepMerge(node.vectorProps, patch as Partial<VectorProps>),
      });
    },

    updateThreeDProps: (id, patch) => {
      const node = get().nodes[id];
      if (!node?.threeDProps) return;
      get().updateNode(id, {
        threeDProps: deepMerge(node.threeDProps, patch as Partial<ThreeDProps>),
      });
    },

    updateResponsiveProps: (id, device, patch) => {
      const node = get().nodes[id];
      if (!node) return;
      const existing = node.responsive[device] ?? {};
      get().updateNode(id, {
        responsive: {
          ...node.responsive,
          [device]: deepMerge(existing, patch),
        },
      });
    },

    clearResponsiveProps: (id, device) => {
      const node = get().nodes[id];
      if (!node) return;
      const responsive = { ...node.responsive };
      delete responsive[device];
      get().updateNode(id, { responsive });
    },

    moveNode: (id, newParentId, index) => {
      get().pushHistory();
      set((state) => {
        const node = state.nodes[id];
        if (!node) return;

        removeFromParentOrPage(state, id);

        node.parentId = newParentId;
        if (newParentId && state.nodes[newParentId]) {
          const parent = state.nodes[newParentId];
          const safeIndex = Math.max(0, Math.min(index, parent.childrenIds.length));
          parent.childrenIds.splice(safeIndex, 0, id);
          parent.version++;
        } else {
          const roots = getCurrentPageRootIds(state);
          const safeIndex = Math.max(0, Math.min(index, roots.length));
          roots.splice(safeIndex, 0, id);
          setCurrentPageRootIds(state, roots);
        }

        node.version++;
        state.documentDirty = true;
      });
    },

    duplicateNodes: (ids) => {
      if (ids.length === 0) return;
      get().pushHistory();
      set((state) => {
        const cloneSubtree = (nodeId: string, newParentId: string | null): string => {
          const source = state.nodes[nodeId];
          if (!source) return '';
          const newId = generateId();
          const clone = JSON.parse(JSON.stringify(source)) as StudioNode;
          clone.id = newId;
          clone.name = `${clone.name} (copy)`;
          clone.parentId = newParentId;
          clone.version = 0;
          clone.childrenIds = source.childrenIds.map((childId) => cloneSubtree(childId, newId));
          state.nodes[newId] = clone;
          return newId;
        };

        for (const id of ids) {
          const source = state.nodes[id];
          if (!source) continue;
          const newId = cloneSubtree(id, source.parentId);

          if (source.parentId && state.nodes[source.parentId]) {
            const parent = state.nodes[source.parentId];
            const index = parent.childrenIds.indexOf(id);
            parent.childrenIds.splice(index + 1, 0, newId);
            parent.version++;
          } else {
            const roots = getCurrentPageRootIds(state);
            const index = roots.indexOf(id);
            roots.splice(index + 1, 0, newId);
            setCurrentPageRootIds(state, roots);
          }
        }

        state.documentDirty = true;
      });
    },

    createComponent: (nodeId) => {
      const node = get().nodes[nodeId];
      if (!node) return null;

      const definitionId = generateId();
      get().pushHistory();
      set((state) => {
        state.components[definitionId] = {
          id: definitionId,
          name: `${node.name} Component`,
          description: '',
          rootNodeId: nodeId,
          propSchema: {},
        };

        const target = state.nodes[nodeId];
        if (target) {
          target.type = 'component';
          target.componentProps = { componentId: definitionId, overrides: {} };
          target.version++;
        }

        state.documentDirty = true;
      });

      return definitionId;
    },

    detachInstance: (nodeId) => {
      const node = get().nodes[nodeId];
      if (!node?.componentProps) return;
      get().pushHistory();
      set((state) => {
        const target = state.nodes[nodeId];
        if (!target) return;
        target.type = 'frame';
        delete target.componentProps;
        target.version++;
        state.documentDirty = true;
      });
    },

    groupNodes: (ids) => {
      if (ids.length === 0) return '';
      const state = get();
      const firstNode = state.nodes[ids[0]];
      if (!firstNode) return '';

      const groupId = generateId();
      get().pushHistory();
      set((draft) => {
        const group = createNode('frame', firstNode.parentId);
        group.id = groupId;
        group.name = 'Group';
        group.transform.size = { width: 'auto', height: 'auto' };
        group.style.backgroundColor = undefined;
        group.childrenIds = [];

        draft.nodes[groupId] = group;

        if (firstNode.parentId && draft.nodes[firstNode.parentId]) {
          const parent = draft.nodes[firstNode.parentId];
          const indices = ids.map((id) => parent.childrenIds.indexOf(id)).filter((index) => index >= 0);
          const firstIndex = Math.min(...indices);
          parent.childrenIds = parent.childrenIds.filter((id) => !ids.includes(id));
          parent.childrenIds.splice(firstIndex, 0, groupId);
          parent.version++;
        } else {
          const roots = getCurrentPageRootIds(draft);
          const indices = ids.map((id) => roots.indexOf(id)).filter((index) => index >= 0);
          const firstIndex = Math.min(...indices);
          const nextRoots = roots.filter((id) => !ids.includes(id));
          nextRoots.splice(firstIndex, 0, groupId);
          setCurrentPageRootIds(draft, nextRoots);
        }

        for (const id of ids) {
          const node = draft.nodes[id];
          if (!node) continue;
          node.parentId = groupId;
          node.version++;
          group.childrenIds.push(id);
        }

        group.version++;
        draft.selectedIds = [groupId];
        draft.documentDirty = true;
      });

      return groupId;
    },

    ungroupNode: (id) => {
      get().pushHistory();
      set((state) => {
        const group = state.nodes[id];
        if (!group || group.childrenIds.length === 0) return;

        const children = [...group.childrenIds];
        const parentId = group.parentId;

        if (parentId && state.nodes[parentId]) {
          const parent = state.nodes[parentId];
          const groupIndex = parent.childrenIds.indexOf(id);
          parent.childrenIds = parent.childrenIds.filter((childId) => childId !== id);
          parent.childrenIds.splice(groupIndex, 0, ...children);
          parent.version++;
        } else {
          const roots = getCurrentPageRootIds(state);
          const groupIndex = roots.indexOf(id);
          const nextRoots = roots.filter((rootId) => rootId !== id);
          nextRoots.splice(groupIndex, 0, ...children);
          setCurrentPageRootIds(state, nextRoots);
        }

        for (const childId of children) {
          const child = state.nodes[childId];
          if (!child) continue;
          child.parentId = parentId;
          child.version++;
        }

        delete state.nodes[id];
        state.selectedIds = children;
        state.documentDirty = true;
      });
    },

    addPage: (name) => {
      const id = generateId();
      set((state) => {
        state.pages[id] = {
          id,
          name: name ?? `Page ${Object.keys(state.pages).length + 1}`,
          rootIds: [],
        };
        state.activePageId = id;
        state.selectedIds = [];
        state.documentDirty = true;
      });
      return id;
    },

    deletePage: (id) => {
      const pageIds = Object.keys(get().pages);
      if (pageIds.length <= 1) return;
      get().pushHistory();
      set((state) => {
        delete state.pages[id];
        if (state.activePageId === id) {
          state.activePageId = Object.keys(state.pages)[0];
          state.selectedIds = [];
        }
        state.documentDirty = true;
      });
    },

    setActivePage: (id) => {
      if (id === get().activePageId) return;
      get().pushHistory();
      set((state) => {
        if (!state.pages[id]) return;
        state.activePageId = id;
        state.selectedIds = [];
        state.focusedId = null;
        state.documentDirty = true;
      });
    },

    renamePage: (id, name) => {
      set((state) => {
        if (!state.pages[id]) return;
        state.pages[id].name = name;
        state.documentDirty = true;
      });
    },

    addSharedStyle: (name, style) => {
      const id = generateId();
      set((state) => {
        state.sharedStyles[id] = { id, name, style };
        state.documentDirty = true;
      });
      return id;
    },

    deleteSharedStyle: (id) => {
      set((state) => {
        delete state.sharedStyles[id];
        state.documentDirty = true;
      });
    },

    applySharedStyle: (nodeId, styleId) => {
      const sharedStyle = get().sharedStyles[styleId];
      if (!sharedStyle) return;
      get().pushHistory();
      get().updateNodeStyle(nodeId, sharedStyle.style);
    },

    addToken: (name, type, value) => {
      const id = generateId();
      set((state) => {
        state.tokens[id] = { id, name, type, value };
        state.documentDirty = true;
      });
      return id;
    },

    updateToken: (id, value) => {
      set((state) => {
        if (!state.tokens[id]) return;
        state.tokens[id].value = value;
        state.documentDirty = true;
      });
    },

    deleteToken: (id) => {
      set((state) => {
        delete state.tokens[id];
        state.documentDirty = true;
      });
    },

    addCSSVariable: (name, value, type) => {
      const id = generateId();
      set((state) => {
        state.cssVariables[id] = { id, name, value, type };
        state.documentDirty = true;
      });
      return id;
    },

    updateCSSVariable: (id, patch) => {
      set((state) => {
        if (!state.cssVariables[id]) return;
        state.cssVariables[id] = deepMerge(state.cssVariables[id], patch as Partial<CSSVariable>);
        state.documentDirty = true;
      });
    },

    deleteCSSVariable: (id) => {
      set((state) => {
        delete state.cssVariables[id];
        state.documentDirty = true;
      });
    },

    addAsset: (asset) => {
      const id = generateId();
      set((state) => {
        state.assetLibrary[id] = {
          id,
          createdAt: Date.now(),
          ...asset,
        };
        state.documentDirty = true;
      });
      return id;
    },

    updateAsset: (id, patch) => {
      set((state) => {
        if (!state.assetLibrary[id]) return;
        state.assetLibrary[id] = deepMerge(state.assetLibrary[id], patch as Partial<StudioAsset>);
        state.documentDirty = true;
      });
    },

    deleteAsset: (id) => {
      set((state) => {
        delete state.assetLibrary[id];
        for (const node of Object.values(state.nodes)) {
          if (node.imageProps?.assetId === id) {
            node.imageProps.assetId = undefined;
          }
        }
        state.documentDirty = true;
      });
    },
  };
};
