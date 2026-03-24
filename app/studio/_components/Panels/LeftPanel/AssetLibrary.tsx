'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { fileToDataUrl } from '~/studio/_lib/utils/file';

export function AssetLibrary() {
  const assets = useStudioStore((s) => Object.values(s.assetLibrary).sort((a, b) => b.createdAt - a.createdAt));
  const addAsset = useStudioStore((s) => s.addAsset);
  const deleteAsset = useStudioStore((s) => s.deleteAsset);
  const addNode = useStudioStore((s) => s.addNode);
  const updateImageProps = useStudioStore((s) => s.updateImageProps);
  const select = useStudioStore((s) => s.select);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'));
    for (const file of files) {
      const dataUrl = await fileToDataUrl(file);
      addAsset({
        name: file.name,
        type: 'image',
        mimeType: file.type,
        dataUrl,
      });
    }
    if (fileRef.current) fileRef.current.value = '';
  }, [addAsset]);

  const insertAsImage = useCallback((assetId: string) => {
    const asset = useStudioStore.getState().assetLibrary[assetId];
    if (!asset) return;
    const newId = addNode('image');
    updateImageProps(newId, {
      src: asset.dataUrl,
      alt: asset.name,
      objectFit: 'cover',
      assetId,
    });
    select([newId]);
  }, [addNode, updateImageProps, select]);

  const clearAll = useCallback(() => {
    const store = useStudioStore.getState();
    for (const asset of Object.values(store.assetLibrary)) {
      deleteAsset(asset.id);
    }
  }, [deleteAsset]);

  const assetCount = assets.length;

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 py-2 text-[11px] text-indigo-400 hover:text-indigo-300 border border-dashed border-neutral-700 hover:border-indigo-500 rounded-lg transition-colors"
        >
          + Upload Images
        </button>
        {assetCount > 0 && (
          <button
            onClick={clearAll}
            className="ml-2 px-2 py-2 text-[10px] text-neutral-500 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />

      {assetCount === 0 ? (
        <div className="p-3 text-xs text-neutral-500">No assets yet. Upload images above.</div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {assets.map((asset) => (
            <div key={asset.id} className="relative group">
              <button
                onClick={() => insertAsImage(asset.id)}
                className="w-full aspect-square rounded overflow-hidden border border-neutral-700 hover:border-indigo-500 transition-colors"
              >
                <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  deleteAsset(asset.id);
                }}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-neutral-900/80 rounded-full text-[9px] text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                x
              </button>
              <span className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-neutral-900/80 text-[8px] text-neutral-400 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {asset.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
