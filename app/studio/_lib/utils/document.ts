import type {
  StudioDocumentV1,
  StudioNode,
  StudioStore,
  StudioPage,
  StudioViewportDocument,
} from '~/studio/_lib/types';

const DOCUMENT_VERSION = 1 as const;

export function deepMerge<T>(target: T, patch: Partial<T>): T {
  if (!isPlainObject(target) || !isPlainObject(patch)) {
    return patch as T;
  }

  const result = { ...(target as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const current = result[key];
    result[key] = isPlainObject(current) && isPlainObject(value)
      ? deepMerge(current, value)
      : Array.isArray(value)
        ? [...value]
        : value;
  }
  return result as T;
}

export function cloneNode<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createInitialStudioDocument(viewport: StudioViewportDocument): StudioDocumentV1 {
  return {
    version: DOCUMENT_VERSION,
    nodes: {},
    components: {},
    pages: {
      default: {
        id: 'default',
        name: 'Page 1',
        rootIds: [],
      },
    },
    activePageId: 'default',
    sharedStyles: {},
    tokens: {},
    cssVariables: {},
    assetLibrary: {},
    viewport,
  };
}

export function getCurrentPageRootIds(state: Pick<StudioStore, 'pages' | 'activePageId'>): string[] {
  return [...(state.pages[state.activePageId]?.rootIds ?? [])];
}

export function setCurrentPageRootIds(
  state: Pick<StudioStore, 'pages' | 'activePageId'>,
  rootIds: string[]
) {
  const page = state.pages[state.activePageId];
  if (!page) return;
  page.rootIds = rootIds;
}

export function toStudioDocument(state: Pick<
  StudioStore,
  | 'nodes'
  | 'components'
  | 'pages'
  | 'activePageId'
  | 'sharedStyles'
  | 'tokens'
  | 'cssVariables'
  | 'assetLibrary'
  | 'zoom'
  | 'pan'
  | 'device'
  | 'showGrid'
  | 'breakpoints'
>): StudioDocumentV1 {
  return {
    version: DOCUMENT_VERSION,
    nodes: cloneNode(state.nodes),
    components: cloneNode(state.components),
    pages: cloneNode(state.pages),
    activePageId: state.activePageId,
    sharedStyles: cloneNode(state.sharedStyles),
    tokens: cloneNode(state.tokens),
    cssVariables: cloneNode(state.cssVariables),
    assetLibrary: cloneNode(state.assetLibrary),
    viewport: {
      zoom: state.zoom,
      pan: cloneNode(state.pan),
      device: state.device,
      showGrid: state.showGrid,
      breakpoints: cloneNode(state.breakpoints),
    },
  };
}

export function isStudioDocumentV1(value: unknown): value is StudioDocumentV1 {
  if (!isPlainObject(value)) return false;
  const document = value as Partial<StudioDocumentV1>;
  return (
    document.version === DOCUMENT_VERSION &&
    isPlainObject(document.nodes) &&
    isPlainObject(document.pages) &&
    typeof document.activePageId === 'string' &&
    isPlainObject(document.assetLibrary) &&
    isPlainObject(document.viewport)
  );
}

export function sanitizeImportedDocument(document: StudioDocumentV1): StudioDocumentV1 {
  const safePages = Object.keys(document.pages).length > 0
    ? document.pages
    : { default: { id: 'default', name: 'Page 1', rootIds: [] } };
  const safeActivePageId = safePages[document.activePageId] ? document.activePageId : Object.keys(safePages)[0];

  return {
    version: DOCUMENT_VERSION,
    nodes: cloneNode(document.nodes),
    components: cloneNode(document.components),
    pages: cloneNode(safePages),
    activePageId: safeActivePageId,
    sharedStyles: cloneNode(document.sharedStyles),
    tokens: cloneNode(document.tokens),
    cssVariables: cloneNode(document.cssVariables),
    assetLibrary: cloneNode(document.assetLibrary),
    viewport: cloneNode(document.viewport),
  };
}

export function pageRootsContainId(pages: Record<string, StudioPage>, nodeId: string): boolean {
  return Object.values(pages).some((page) => page.rootIds.includes(nodeId));
}

export function ensureNodeBelongsToPage(
  state: Pick<StudioStore, 'pages' | 'activePageId'>,
  nodeId: string,
  index?: number
) {
  const roots = getCurrentPageRootIds(state);
  if (roots.includes(nodeId)) return;
  const insertionIndex = typeof index === 'number' ? index : roots.length;
  roots.splice(insertionIndex, 0, nodeId);
  setCurrentPageRootIds(state, roots);
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
