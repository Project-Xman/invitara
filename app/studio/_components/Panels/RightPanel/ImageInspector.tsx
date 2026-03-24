'use client';

import { useCallback, useRef } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';
import { fileToDataUrl } from '~/studio/_lib/utils/file';

interface ImageInspectorProps {
  node: StudioNode;
}

export function ImageInspector({ node }: ImageInspectorProps) {
  const updateImageProps = useStudioStore((s) => s.updateImageProps);
  const addAsset = useStudioStore((s) => s.addAsset);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateImage = useCallback(
    (patch: Partial<NonNullable<StudioNode['imageProps']>>) => {
      if (!node.imageProps) return;
      updateImageProps(node.id, patch);
    },
    [node, updateImageProps]
  );

  const persistFile = useCallback(async (file: File) => {
    const dataUrl = await fileToDataUrl(file);
    const assetId = addAsset({
      name: file.name,
      type: 'image',
      mimeType: file.type,
      dataUrl,
    });
    updateImage({
      src: dataUrl,
      alt: file.name,
      assetId,
    });
  }, [addAsset, updateImage]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await persistFile(file);
  }, [persistFile]);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    await persistFile(file);
  }, [persistFile]);

  if (node.type !== 'image' || !node.imageProps) return null;

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Image</div>

      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-neutral-700 hover:border-indigo-500 rounded-lg p-4 text-center cursor-pointer transition-colors"
      >
        {node.imageProps.src ? (
          <img src={node.imageProps.src} alt={node.imageProps.alt} className="max-h-24 mx-auto rounded" />
        ) : (
          <div className="text-[11px] text-neutral-500">Click or drop an image here</div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Image URL</span>
        <input
          type="text"
          value={node.imageProps.src}
          onChange={(event) => updateImage({ src: event.target.value, assetId: undefined })}
          placeholder="https://..."
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Alt Text</span>
        <input
          type="text"
          value={node.imageProps.alt}
          onChange={(event) => updateImage({ alt: event.target.value })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Object Fit</span>
        <select
          value={node.imageProps.objectFit}
          onChange={(event) => updateImage({ objectFit: event.target.value as any })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
          <option value="none">None</option>
        </select>
      </label>
    </div>
  );
}
