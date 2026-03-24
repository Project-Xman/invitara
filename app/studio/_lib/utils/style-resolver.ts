import type { StudioNode, DeviceMode, StyleProps, TransformProps, LayoutProps } from '~/studio/_lib/types';

export function resolveNodeStyles(
  node: StudioNode,
  device: DeviceMode
): { style: StyleProps; transform: TransformProps; layout: LayoutProps } {
  if (device === 'desktop') {
    return { style: node.style, transform: node.transform, layout: node.layout };
  }

  const overrides = node.responsive[device];
  if (!overrides) {
    return { style: node.style, transform: node.transform, layout: node.layout };
  }

  // Merge overrides
  const mergedStyle: StyleProps = { ...node.style };
  const mergedTransform: TransformProps = {
    ...node.transform,
    size: { ...node.transform.size },
    position: { ...node.transform.position },
  };
  const mergedLayout: LayoutProps = { ...node.layout, padding: [...node.layout.padding] as [number, number, number, number] };

  // Apply style overrides
  if (overrides.backgroundColor !== undefined) mergedStyle.backgroundColor = overrides.backgroundColor as string;
  if (overrides.opacity !== undefined) mergedStyle.opacity = overrides.opacity as number;
  if (overrides.borderRadius !== undefined) mergedStyle.borderRadius = overrides.borderRadius as [number, number, number, number];
  if (overrides.overflow !== undefined) mergedStyle.overflow = overrides.overflow as StyleProps['overflow'];

  // Apply transform overrides
  if ((overrides as any).size) {
    const sizeOverrides = (overrides as any).size;
    if (sizeOverrides.width !== undefined) mergedTransform.size.width = sizeOverrides.width;
    if (sizeOverrides.height !== undefined) mergedTransform.size.height = sizeOverrides.height;
  }
  if ((overrides as any).position) {
    const posOverrides = (overrides as any).position;
    if (posOverrides.x !== undefined) mergedTransform.position.x = posOverrides.x;
    if (posOverrides.y !== undefined) mergedTransform.position.y = posOverrides.y;
  }

  // Apply layout overrides
  if (overrides.gap !== undefined) mergedLayout.gap = overrides.gap as number;
  if (overrides.padding !== undefined) mergedLayout.padding = overrides.padding as [number, number, number, number];
  if ((overrides as any).mode !== undefined) mergedLayout.mode = (overrides as any).mode;
  if ((overrides as any).direction !== undefined) mergedLayout.direction = (overrides as any).direction;

  return { style: mergedStyle, transform: mergedTransform, layout: mergedLayout };
}
