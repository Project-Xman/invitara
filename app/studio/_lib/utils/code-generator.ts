import type { StudioNode, LayoutProps, StyleProps, TransformProps, AnimationProps } from '~/studio/_lib/types';

function indent(code: string, level: number): string {
  const spaces = '  '.repeat(level);
  return code.split('\n').map((line) => (line.trim() ? spaces + line : '')).join('\n');
}

function sizeToString(val: number | 'auto' | 'fill'): string {
  if (val === 'auto') return 'auto';
  if (val === 'fill') return '100%';
  return `${val}px`;
}

function generateTailwindClasses(node: StudioNode): string {
  const classes: string[] = [];
  const { layout, style, transform } = node;

  // Layout
  if (layout.mode === 'stack') {
    classes.push('flex');
    if (layout.direction === 'horizontal') classes.push('flex-row');
    else classes.push('flex-col');
    if (layout.wrap) classes.push('flex-wrap');
  } else if (layout.mode === 'grid') {
    classes.push('grid');
    if (layout.gridColumns) classes.push(`grid-cols-${layout.gridColumns}`);
  } else {
    classes.push('relative');
  }

  // Gap
  if (layout.gap > 0) classes.push(`gap-[${layout.gap}px]`);

  // Alignment
  const alignMap: Record<string, string> = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };
  const justifyMap: Record<string, string> = { start: 'justify-start', center: 'justify-center', end: 'justify-end', 'space-between': 'justify-between' };
  if (alignMap[layout.alignItems]) classes.push(alignMap[layout.alignItems]);
  if (justifyMap[layout.justifyContent]) classes.push(justifyMap[layout.justifyContent]);

  // Overflow
  if (style.overflow === 'hidden') classes.push('overflow-hidden');
  else if (style.overflow === 'scroll') classes.push('overflow-auto');

  return classes.join(' ');
}

function generateInlineStyles(node: StudioNode): Record<string, string> {
  const styles: Record<string, string> = {};
  const { style, transform, layout } = node;

  // Size
  if (typeof transform.size.width === 'number') styles.width = `${transform.size.width}px`;
  else if (transform.size.width === 'fill') styles.width = '100%';
  if (typeof transform.size.height === 'number') styles.height = `${transform.size.height}px`;
  else if (transform.size.height === 'fill') styles.height = '100%';

  // Padding
  const [pt, pr, pb, pl] = layout.padding;
  if (pt || pr || pb || pl) {
    styles.padding = `${pt}px ${pr}px ${pb}px ${pl}px`;
  }

  // Background
  if (style.backgroundColor) styles.backgroundColor = style.backgroundColor;

  // Border radius
  const [tl, tr, br, bl] = style.borderRadius;
  if (tl || tr || br || bl) {
    styles.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
  }

  // Border
  if (style.borderWidth > 0 && style.borderStyle !== 'none') {
    styles.border = `${style.borderWidth}px ${style.borderStyle} ${style.borderColor}`;
  }

  // Shadow
  if (style.boxShadow) styles.boxShadow = style.boxShadow;

  // Opacity
  if (style.opacity < 1) styles.opacity = String(style.opacity);

  // Rotation
  if (transform.rotation !== 0) styles.transform = `rotate(${transform.rotation}deg)`;

  return styles;
}

function styleObjectToString(styles: Record<string, string>): string {
  if (Object.keys(styles).length === 0) return '';
  const entries = Object.entries(styles)
    .map(([key, value]) => `${key}: "${value}"`)
    .join(', ');
  return `{{ ${entries} }}`;
}

function generateAnimationCode(animation: AnimationProps | null): { imports: boolean; props: string } {
  if (!animation || animation.keyframes.length === 0) return { imports: false, props: '' };

  const initial: Record<string, number> = {};
  const animate: Record<string, number> = {};
  let maxDuration = 0;
  let maxDelay = 0;

  for (const kf of animation.keyframes) {
    initial[kf.property] = kf.from;
    animate[kf.property] = kf.to;
    maxDuration = Math.max(maxDuration, kf.duration);
    maxDelay = Math.max(maxDelay, kf.delay);
  }

  const transition: Record<string, unknown> = {
    duration: maxDuration,
    ease: animation.keyframes[0]?.ease ?? 'easeInOut',
  };
  if (maxDelay > 0) transition.delay = maxDelay;
  if (animation.loop) {
    transition.repeat = 'Infinity';
    transition.repeatType = '"reverse"';
  }

  const initialStr = JSON.stringify(initial);
  const animateStr = JSON.stringify(animate);
  const transitionStr = JSON.stringify(transition).replace(/"Infinity"/g, 'Infinity').replace(/'"reverse"'/g, '"reverse"');

  return {
    imports: true,
    props: `\n  initial={${initialStr}}\n  animate={${animateStr}}\n  transition={${transitionStr}}`,
  };
}

interface ExportOptions {
  styleMode: 'tailwind' | 'inline';
  includeAnimations: boolean;
}

function generateNodeJSX(
  node: StudioNode,
  nodes: Record<string, StudioNode>,
  level: number,
  hasAnimations: { value: boolean },
  options: ExportOptions
): string {
  const useTailwind = options.styleMode === 'tailwind';
  const classes = useTailwind ? generateTailwindClasses(node) : '';
  const styles = generateInlineStyles(node);
  // When inline-only, merge layout styles too
  if (!useTailwind) {
    const { layout } = node;
    if (layout.mode === 'stack') {
      styles.display = 'flex';
      styles.flexDirection = layout.direction === 'horizontal' ? 'row' : 'column';
      if (layout.gap > 0) styles.gap = `${layout.gap}px`;
      if (layout.alignItems !== 'start') styles.alignItems = layout.alignItems;
      if (layout.justifyContent !== 'start') styles.justifyContent = layout.justifyContent;
    } else if (layout.mode === 'grid') {
      styles.display = 'grid';
      if (layout.gridColumns) styles.gridTemplateColumns = `repeat(${layout.gridColumns}, 1fr)`;
      if (layout.gap > 0) styles.gap = `${layout.gap}px`;
    } else {
      styles.position = 'relative';
    }
    if (node.style.overflow === 'hidden') styles.overflow = 'hidden';
  }
  const styleStr = styleObjectToString(styles);
  const animProps = options.includeAnimations ? generateAnimationCode(node.animation) : { imports: false, props: '' };
  if (animProps.imports) hasAnimations.value = true;

  const tag = animProps.imports ? 'motion.div' : 'div';
  const classAttr = classes ? ` className="${classes}"` : '';
  const styleAttr = styleStr ? ` style={${styleStr}}` : '';
  const animAttr = animProps.props;

  if (node.type === 'text' && node.textProps) {
    const tp = node.textProps;
    const textStyle: Record<string, string> = {
      fontSize: `${tp.fontSize}px`,
      fontFamily: tp.fontFamily,
      fontWeight: String(tp.fontWeight),
      lineHeight: String(tp.lineHeight),
      letterSpacing: `${tp.letterSpacing}px`,
      textAlign: tp.textAlign,
      color: tp.color,
    };
    if (tp.textDecoration !== 'none') textStyle.textDecoration = tp.textDecoration;
    const textStyleStr = styleObjectToString(textStyle);
    const textTag = animProps.imports ? 'motion.p' : 'p';
    return indent(`<${textTag}${animAttr} style={${textStyleStr}}>\n  ${tp.content}\n</${textTag}>`, level);
  }

  if (node.type === 'image' && node.imageProps) {
    const ip = node.imageProps;
    const imgStyle = { ...styles, objectFit: ip.objectFit };
    const imgStyleStr = styleObjectToString(imgStyle as Record<string, string>);
    return indent(`<img src="${ip.src}" alt="${ip.alt}" style={${imgStyleStr}} />`, level);
  }

  if (node.type === 'vector' && node.vectorProps) {
    const vp = node.vectorProps;
    const w = typeof node.transform.size.width === 'number' ? node.transform.size.width : 100;
    const h = typeof node.transform.size.height === 'number' ? node.transform.size.height : 100;
    let shapeJSX = '';
    switch (vp.shape) {
      case 'ellipse':
        shapeJSX = `<ellipse cx={${w / 2}} cy={${h / 2}} rx={${w / 2 - vp.strokeWidth}} ry={${h / 2 - vp.strokeWidth}} fill="${vp.fill}" stroke="${vp.stroke}" strokeWidth={${vp.strokeWidth}} />`;
        break;
      case 'line':
        shapeJSX = `<line x1={0} y1={${h / 2}} x2={${w}} y2={${h / 2}} stroke="${vp.stroke}" strokeWidth={${vp.strokeWidth}} />`;
        break;
      case 'polygon': {
        const sides = vp.points ?? 6;
        const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - vp.strokeWidth;
        const pts = Array.from({ length: sides }, (_, i) => {
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
          return `${Math.round(cx + r * Math.cos(angle))},${Math.round(cy + r * Math.sin(angle))}`;
        }).join(' ');
        shapeJSX = `<polygon points="${pts}" fill="${vp.fill}" stroke="${vp.stroke}" strokeWidth={${vp.strokeWidth}} />`;
        break;
      }
      case 'star': {
        const points = vp.points ?? 5;
        const cx = w / 2, cy = h / 2;
        const outerR = Math.min(w, h) / 2 - vp.strokeWidth;
        const innerR = outerR * (vp.innerRadius ?? 0.4);
        const pts = Array.from({ length: points * 2 }, (_, i) => {
          const angle = (Math.PI * i) / points - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          return `${Math.round(cx + r * Math.cos(angle))},${Math.round(cy + r * Math.sin(angle))}`;
        }).join(' ');
        shapeJSX = `<polygon points="${pts}" fill="${vp.fill}" stroke="${vp.stroke}" strokeWidth={${vp.strokeWidth}} />`;
        break;
      }
      case 'path':
        shapeJSX = vp.pathData ? `<path d="${vp.pathData}" fill="${vp.fill}" stroke="${vp.stroke}" strokeWidth={${vp.strokeWidth}} />` : '';
        break;
      default:
        shapeJSX = `<rect x={${vp.strokeWidth / 2}} y={${vp.strokeWidth / 2}} width={${w - vp.strokeWidth}} height={${h - vp.strokeWidth}} fill="${vp.fill}" stroke="${vp.stroke}" strokeWidth={${vp.strokeWidth}} rx={${node.style.borderRadius[0]}} />`;
    }
    return indent(`<svg width={${w}} height={${h}} viewBox="0 0 ${w} ${h}"${styleAttr}>\n  ${shapeJSX}\n</svg>`, level);
  }

  if (node.type === '3d' && node.threeDProps) {
    hasAnimations.value = true;
    const tp = node.threeDProps;
    const sceneJSX = tp.shape === 'model' && tp.modelUrl
      ? `<primitive object={useGLTF("${tp.modelUrl}").scene} />`
      : `<mesh${tp.autoRotate ? '' : ` rotation={[${tp.rotation.join(', ')}]}`}>
        <${tp.shape === 'box' ? 'boxGeometry args={[1.5, 1.5, 1.5]}' : tp.shape === 'sphere' ? 'sphereGeometry args={[1, 32, 32]}' : tp.shape === 'cylinder' ? 'cylinderGeometry args={[0.7, 0.7, 1.5, 32]}' : 'torusGeometry args={[0.8, 0.3, 16, 32]}'} />
        <meshStandardMaterial color="${tp.color}" metalness={${tp.metalness}} roughness={${tp.roughness}} />
      </mesh>`;

    const wrapper = `<div${classAttr}${styleAttr} data-node="${node.id}">
  <Canvas camera={{ position: [${tp.cameraPosition.join(', ')}], fov: 50 }}>
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 5, 5]} intensity={${tp.lightIntensity}} />
    ${sceneJSX}
    <OrbitControls autoRotate={${tp.autoRotate}} enableZoom={false} />
  </Canvas>
</div>`;
    return indent(wrapper, level);
  } else if (node.type === '3d') {
    return indent(`{/* 3D Object: ${node.name} - Requires @react-three/fiber setup */}\n<div${classAttr}${styleAttr}>\n  {/* Add your 3D scene here */}\n</div>`, level);
  }

  if (node.type === 'component' && node.componentProps) {
    // Export component instances as div with data attribute
    const children = node.childrenIds
      .map((childId) => {
        const child = nodes[childId];
        return child ? generateNodeJSX(child, nodes, level + 1, hasAnimations, options) : '';
      })
      .filter(Boolean)
      .join('\n');
    const componentTag = `<div${classAttr}${styleAttr} data-component="${node.componentProps.componentId}">`;
    if (children) {
      return indent(`{/* Component: ${node.name} */}\n${componentTag}\n${children}\n</div>`, level);
    }
    return indent(`{/* Component: ${node.name} */}\n${componentTag} />`, level);
  }

  // Frame/component with children
  const children = node.childrenIds
    .map((childId) => {
      const child = nodes[childId];
      return child ? generateNodeJSX(child, nodes, level + 1, hasAnimations, options) : '';
    })
    .filter(Boolean)
    .join('\n');

  if (children) {
    return indent(`<${tag}${classAttr}${styleAttr}${animAttr}>\n${children}\n</${tag}>`, level);
  }
  return indent(`<${tag}${classAttr}${styleAttr}${animAttr} />`, level);
}

export function generateReactCode(
  nodes: Record<string, StudioNode>,
  rootIds: string[],
  options: ExportOptions = { styleMode: 'tailwind', includeAnimations: true }
): string {
  const hasAnimations = { value: false };

  const jsxParts = rootIds
    .map((id) => {
      const node = nodes[id];
      return node ? generateNodeJSX(node, nodes, 2, hasAnimations, options) : '';
    })
    .filter(Boolean)
    .join('\n');

  const imports = ['"use client";', '', 'import React from "react";'];
  if (hasAnimations.value) {
    imports.push('import { motion } from "framer-motion";');
  }

  // Feature 5: 3D imports
  const has3D = rootIds.some((id) => {
    const check = (nid: string): boolean => {
      const n = nodes[nid];
      if (!n) return false;
      if (n.type === '3d') return true;
      return n.childrenIds.some(check);
    };
    return check(id);
  });
  if (has3D) {
    imports.push('import { Canvas } from "@react-three/fiber";');
    imports.push('import { OrbitControls } from "@react-three/drei";');
  }

  // Feature 3: Responsive CSS generation
  const responsiveNodes = rootIds.flatMap((id) => {
    const collect = (nid: string): string[] => {
      const n = nodes[nid];
      if (!n) return [];
      const has = n.responsive?.tablet || n.responsive?.mobile;
      const children = n.childrenIds.flatMap(collect);
      return has ? [nid, ...children] : children;
    };
    return collect(id);
  });

  let responsiveCSS = '';
  if (responsiveNodes.length > 0) {
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];
    for (const nid of responsiveNodes) {
      const n = nodes[nid];
      if (!n) continue;
      if (n.responsive?.tablet) {
        const overrides = n.responsive.tablet as Record<string, any>;
        const rules: string[] = [];
        if (overrides.size?.width !== undefined) rules.push(`width: ${overrides.size.width}px`);
        if (overrides.size?.height !== undefined) rules.push(`height: ${overrides.size.height}px`);
        if (overrides.backgroundColor) rules.push(`background-color: ${overrides.backgroundColor}`);
        if (overrides.gap !== undefined) rules.push(`gap: ${overrides.gap}px`);
        if (rules.length) tabletRules.push(`  [data-node="${nid}"] { ${rules.join('; ')}; }`);
      }
      if (n.responsive?.mobile) {
        const overrides = n.responsive.mobile as Record<string, any>;
        const rules: string[] = [];
        if (overrides.size?.width !== undefined) rules.push(`width: ${overrides.size.width}px`);
        if (overrides.size?.height !== undefined) rules.push(`height: ${overrides.size.height}px`);
        if (overrides.backgroundColor) rules.push(`background-color: ${overrides.backgroundColor}`);
        if (overrides.gap !== undefined) rules.push(`gap: ${overrides.gap}px`);
        if (rules.length) mobileRules.push(`  [data-node="${nid}"] { ${rules.join('; ')}; }`);
      }
    }
    if (tabletRules.length || mobileRules.length) {
      responsiveCSS = '\nconst responsiveStyles = `\n';
      if (tabletRules.length) responsiveCSS += `@media (max-width: 768px) {\n${tabletRules.join('\n')}\n}\n`;
      if (mobileRules.length) responsiveCSS += `@media (max-width: 375px) {\n${mobileRules.join('\n')}\n}\n`;
      responsiveCSS += '`;\n';
    }
  }

  const responsiveStyleTag = responsiveCSS
    ? '\n      <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />'
    : '';

  return `${imports.join('\n')}
${responsiveCSS}
export default function GeneratedComponent() {
  return (
    <div>${responsiveStyleTag}
${jsxParts}
    </div>
  );
}
`;
}
