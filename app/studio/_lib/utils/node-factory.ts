import type { NodeType, StudioNode, TextProps, ImageProps, ThreeDProps, VectorProps, AdProps } from '~/studio/_lib/types';
import { DEFAULT_LAYOUT, DEFAULT_STYLE, DEFAULT_TRANSFORM } from '~/studio/_lib/constants';
import { generateId } from './id';

const NODE_NAMES: Record<NodeType, string> = {
  frame: 'Frame',
  text: 'Text',
  image: 'Image',
  component: 'Component',
  '3d': '3D Object',
  vector: 'Vector',
  ad: 'Ad Container',
};

const DEFAULT_TEXT_PROPS: TextProps = {
  content: 'Type something',
  fontSize: 16,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: 'left',
  color: '#000000',
  textDecoration: 'none',
};

const DEFAULT_IMAGE_PROPS: ImageProps = {
  src: '',
  alt: 'Image',
  objectFit: 'cover',
};

const DEFAULT_AD_PROPS: AdProps = {
  slot: 'hero_banner',
  adTitle: 'Your Ad Title',
  adDescription: 'Ad description goes here',
  ctaText: 'Learn More',
  ctaLink: '#',
  gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  icon: '✨',
  showDismiss: true,
};

const DEFAULT_VECTOR_PROPS: VectorProps = {
  shape: 'rectangle',
  fill: '#6366f1',
  stroke: '#4f46e5',
  strokeWidth: 2,
};

const DEFAULT_3D_PROPS: ThreeDProps = {
  shape: 'box',
  color: '#6366f1',
  metalness: 0.1,
  roughness: 0.8,
  rotation: [0, 0, 0],
  lightIntensity: 1,
  cameraPosition: [3, 3, 3],
  autoRotate: true,
};

let nodeCounter: Record<NodeType, number> = {
  frame: 0,
  text: 0,
  image: 0,
  component: 0,
  '3d': 0,
  vector: 0,
  ad: 0,
};

export function createNode(type: NodeType, parentId: string | null = null): StudioNode {
  nodeCounter[type]++;

  const node: StudioNode = {
    id: generateId(),
    type,
    name: `${NODE_NAMES[type]} ${nodeCounter[type]}`,
    parentId,
    childrenIds: [],
    locked: false,
    visible: true,
    version: 0,
    layout: { ...DEFAULT_LAYOUT },
    style: { ...DEFAULT_STYLE },
    transform: {
      ...DEFAULT_TRANSFORM,
      size: type === 'frame'
        ? { width: 300, height: 200 }
        : type === 'text'
          ? { width: 'auto', height: 'auto' }
          : type === 'image'
            ? { width: 200, height: 200 }
            : type === '3d'
              ? { width: 300, height: 300 }
              : type === 'vector'
                ? { width: 100, height: 100 }
                : { width: 'auto', height: 'auto' },
    },
    animation: null,
    responsive: {},
  };

  if (type === 'text') {
    node.textProps = { ...DEFAULT_TEXT_PROPS };
  } else if (type === 'image') {
    node.imageProps = { ...DEFAULT_IMAGE_PROPS };
  } else if (type === '3d') {
    node.threeDProps = { ...DEFAULT_3D_PROPS };
  } else if (type === 'vector') {
    node.vectorProps = { ...DEFAULT_VECTOR_PROPS };
  } else if (type === 'ad') {
    node.adProps = { ...DEFAULT_AD_PROPS };
    node.transform.size = { width: 'fill', height: 'auto' };
    node.style.backgroundColor = undefined;
  } else if (type === 'frame') {
    node.style.backgroundColor = '#ffffff';
  }

  return node;
}

export function resetNodeCounters() {
  nodeCounter = { frame: 0, text: 0, image: 0, component: 0, '3d': 0, vector: 0, ad: 0 };
}
