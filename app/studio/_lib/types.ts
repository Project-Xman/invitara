export type NodeType = 'frame' | 'text' | 'image' | 'component' | '3d' | 'vector' | 'ad';
export type LayoutMode = 'stack' | 'grid' | 'absolute';
export type StackDirection = 'horizontal' | 'vertical';
export type Alignment = 'start' | 'center' | 'end' | 'stretch' | 'space-between';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Size {
  width: number | 'auto' | 'fill';
  height: number | 'auto' | 'fill';
}

export interface LayoutProps {
  mode: LayoutMode;
  direction: StackDirection;
  gap: number;
  padding: [number, number, number, number];
  alignItems: Alignment;
  justifyContent: Alignment;
  gridColumns?: number;
  gridRows?: number;
  wrap?: boolean;
}

export interface StyleProps {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  borderRadius: [number, number, number, number];
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'none';
  boxShadow: string;
  opacity: number;
  mixBlendMode?:
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion';
  backdropBlur?: number;
  filter?: string;
  overflow: 'visible' | 'hidden' | 'scroll';
  cursor?: string;
  innerShadow?: string;
}

export interface TransformProps {
  position: Vector2;
  size: Size;
  rotation: number;
  scale: Vector2;
}

export interface TextProps {
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
  textDecoration: 'none' | 'underline' | 'line-through';
  gradient?: string;
  textShadow?: string;
}

export interface ImageProps {
  src: string;
  alt: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
  assetId?: string;
}

export interface ThreeDProps {
  shape: 'box' | 'sphere' | 'cylinder' | 'torus' | 'model';
  modelUrl?: string;
  color: string;
  metalness: number;
  roughness: number;
  rotation: [number, number, number];
  lightIntensity: number;
  cameraPosition: [number, number, number];
  autoRotate: boolean;
  objects?: Array<{
    shape: 'box' | 'sphere' | 'cylinder' | 'torus';
    color: string;
    position: [number, number, number];
    scale: number;
  }>;
  spotLightEnabled?: boolean;
  spotLightColor?: string;
  spotLightPosition?: [number, number, number];
  environmentPreset?:
    | 'studio'
    | 'sunset'
    | 'dawn'
    | 'night'
    | 'warehouse'
    | 'forest'
    | 'apartment'
    | 'city'
    | 'park'
    | 'lobby';
}

export interface VectorProps {
  shape: 'rectangle' | 'ellipse' | 'line' | 'polygon' | 'star' | 'path';
  fill: string;
  stroke: string;
  strokeWidth: number;
  points?: number;
  innerRadius?: number;
  pathData?: string;
}

export interface AdProps {
  slot: string;
  adTitle: string;
  adDescription: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
  icon: string;
  showDismiss: boolean;
}

export interface CSSVariable {
  id: string;
  name: string;
  value: string;
  type: 'color' | 'size' | 'font' | 'custom';
}

export interface AnimationKeyframe {
  property: 'opacity' | 'x' | 'y' | 'scale' | 'rotate';
  from: number;
  to: number;
  duration: number;
  delay: number;
  ease: string;
}

export interface AnimationProps {
  trigger: 'onMount' | 'onHover' | 'onScroll' | 'onClick';
  keyframes: AnimationKeyframe[];
  loop: boolean;
  scrollOffset?: [number, number];
}

export interface ComponentProps {
  componentId: string;
  overrides: Record<string, unknown>;
}

export interface ResponsiveOverrides {
  tablet?: Partial<TransformProps & LayoutProps & StyleProps>;
  mobile?: Partial<TransformProps & LayoutProps & StyleProps>;
}

export interface StudioNode {
  id: string;
  type: NodeType;
  name: string;
  parentId: string | null;
  childrenIds: string[];
  locked: boolean;
  visible: boolean;
  version: number;
  layout: LayoutProps;
  style: StyleProps;
  transform: TransformProps;
  animation: AnimationProps | null;
  responsive: ResponsiveOverrides;
  constraints?: {
    horizontal: 'left' | 'right' | 'center' | 'stretch' | 'scale';
    vertical: 'top' | 'bottom' | 'center' | 'stretch' | 'scale';
  };
  textProps?: TextProps;
  imageProps?: ImageProps;
  threeDProps?: ThreeDProps;
  componentProps?: ComponentProps;
  vectorProps?: VectorProps;
  adProps?: AdProps;
  variants?: {
    hover?: Partial<StyleProps & TransformProps>;
    pressed?: Partial<StyleProps & TransformProps>;
    focused?: Partial<StyleProps & TransformProps>;
  };
  interactions?: Array<{
    trigger: 'click' | 'hover';
    action: 'navigate' | 'openUrl' | 'scrollTo';
    targetPageId?: string;
    url?: string;
    targetNodeId?: string;
  }>;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  rootNodeId: string;
  propSchema: Record<string, { type: string; default: unknown }>;
}

export interface SharedStyle {
  id: string;
  name: string;
  style: Partial<StyleProps>;
}

export interface DesignToken {
  id: string;
  name: string;
  type: 'color' | 'spacing' | 'fontSize' | 'borderRadius';
  value: string;
}

export interface StudioAsset {
  id: string;
  name: string;
  type: 'image';
  mimeType: string;
  dataUrl: string;
  createdAt: number;
}

export interface StudioPage {
  id: string;
  name: string;
  rootIds: string[];
}

export interface StudioViewportDocument {
  zoom: number;
  pan: Vector2;
  device: DeviceMode;
  showGrid: boolean;
  breakpoints: { id: string; name: string; width: number }[];
}

export interface StudioDocumentV1 {
  version: 1;
  pages: Record<string, StudioPage>;
  activePageId: string;
  nodes: Record<string, StudioNode>;
  components: Record<string, ComponentDefinition>;
  sharedStyles: Record<string, SharedStyle>;
  tokens: Record<string, DesignToken>;
  cssVariables: Record<string, CSSVariable>;
  assetLibrary: Record<string, StudioAsset>;
  viewport: StudioViewportDocument;
}

export interface DocumentState {
  nodes: Record<string, StudioNode>;
  components: Record<string, ComponentDefinition>;
  pages: Record<string, StudioPage>;
  activePageId: string;
  sharedStyles: Record<string, SharedStyle>;
  tokens: Record<string, DesignToken>;
  cssVariables: Record<string, CSSVariable>;
  assetLibrary: Record<string, StudioAsset>;
  documentVersion: StudioDocumentV1['version'];
  documentDirty: boolean;
  lastSavedAt: number | null;
  hydrated: boolean;
}

export interface SelectionState {
  selectedIds: string[];
  hoveredId: string | null;
  focusedId: string | null;
}

export interface HistoryEntry {
  document: StudioDocumentV1;
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxSize: number;
}

export interface ViewportState {
  zoom: number;
  pan: Vector2;
  device: DeviceMode;
  showGrid: boolean;
  breakpoints: { id: string; name: string; width: number }[];
}

export interface UIState {
  leftPanel: 'insert' | 'layers' | 'components' | 'assets' | 'tokens' | 'history' | 'variables';
  rightPanelOpen: boolean;
  animationPanelOpen: boolean;
  activeTool: 'select' | 'frame' | 'text' | 'hand' | 'rectangle' | 'ellipse' | 'line' | 'pen';
  exportDialogOpen: boolean;
  previewMode: boolean;
}

export interface ClipboardState {
  copiedNodeIds: string[];
  copiedNodes: Record<string, StudioNode>;
}

export interface DocumentActions {
  addNode: (type: NodeType, parentId?: string, initialPatch?: Partial<StudioNode>) => string;
  deleteNodes: (ids: string[]) => void;
  updateNode: (id: string, patch: Partial<StudioNode>) => void;
  patchNode: (id: string, patch: Partial<StudioNode>) => void;
  updateNodeTransform: (id: string, patch: Partial<TransformProps>) => void;
  updateNodeLayout: (id: string, patch: Partial<LayoutProps>) => void;
  updateNodeStyle: (id: string, patch: Partial<StyleProps>) => void;
  updateTextProps: (id: string, patch: Partial<TextProps>) => void;
  updateImageProps: (id: string, patch: Partial<ImageProps>) => void;
  updateVectorProps: (id: string, patch: Partial<VectorProps>) => void;
  updateThreeDProps: (id: string, patch: Partial<ThreeDProps>) => void;
  updateResponsiveProps: (
    id: string,
    device: Extract<DeviceMode, 'tablet' | 'mobile'>,
    patch: Partial<TransformProps & LayoutProps & StyleProps>
  ) => void;
  clearResponsiveProps: (id: string, device: Extract<DeviceMode, 'tablet' | 'mobile'>) => void;
  moveNode: (id: string, newParentId: string | null, index: number) => void;
  duplicateNodes: (ids: string[]) => void;
  createComponent: (nodeId: string) => string | null;
  detachInstance: (nodeId: string) => void;
  groupNodes: (ids: string[]) => string;
  ungroupNode: (id: string) => void;
  addPage: (name?: string) => string;
  deletePage: (id: string) => void;
  setActivePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  addSharedStyle: (name: string, style: Partial<StyleProps>) => string;
  deleteSharedStyle: (id: string) => void;
  applySharedStyle: (nodeId: string, styleId: string) => void;
  addToken: (name: string, type: DesignToken['type'], value: string) => string;
  updateToken: (id: string, value: string) => void;
  deleteToken: (id: string) => void;
  addCSSVariable: (name: string, value: string, type: CSSVariable['type']) => string;
  updateCSSVariable: (id: string, patch: Partial<CSSVariable>) => void;
  deleteCSSVariable: (id: string) => void;
  addAsset: (asset: Omit<StudioAsset, 'id' | 'createdAt'>) => string;
  updateAsset: (id: string, patch: Partial<StudioAsset>) => void;
  deleteAsset: (id: string) => void;
  hydrateDocument: (document: StudioDocumentV1) => void;
  resetDocument: () => void;
  exportDocument: () => StudioDocumentV1;
  importDocument: (document: StudioDocumentV1) => void;
  markDocumentDirty: () => void;
  markDocumentSaved: (timestamp?: number) => void;
  getCurrentPageRootIds: () => string[];
}

export interface SelectionActions {
  select: (ids: string[], append?: boolean) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  setFocused: (id: string | null) => void;
}

export interface HistoryActions {
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export interface ViewportActions {
  setZoom: (zoom: number) => void;
  setPan: (pan: Vector2) => void;
  setDevice: (device: DeviceMode) => void;
  toggleGrid: () => void;
  addBreakpoint: (name: string, width: number) => void;
  removeBreakpoint: (id: string) => void;
}

export interface UIActions {
  setLeftPanel: (panel: UIState['leftPanel']) => void;
  toggleRightPanel: () => void;
  toggleAnimationPanel: () => void;
  setActiveTool: (tool: UIState['activeTool']) => void;
  setExportDialogOpen: (open: boolean) => void;
  togglePreview: () => void;
}

export interface ClipboardActions {
  copy: () => void;
  paste: (parentId?: string) => void;
  cut: () => void;
  pasteStyle: () => void;
}

export type StudioStore = DocumentState &
  DocumentActions &
  SelectionState &
  SelectionActions &
  HistoryState &
  HistoryActions &
  ViewportState &
  ViewportActions &
  UIState &
  UIActions &
  ClipboardState &
  ClipboardActions;
