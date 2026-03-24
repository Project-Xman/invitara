'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode, ThreeDProps } from '~/studio/_lib/types';

interface ThreeDInspectorProps {
  node: StudioNode;
}

const SHAPES = ['box', 'sphere', 'cylinder', 'torus', 'model'] as const;

export function ThreeDInspector({ node }: ThreeDInspectorProps) {
  const updateThreeDProps = useStudioStore((s) => s.updateThreeDProps);

  const update3D = useCallback(
    (patch: Partial<ThreeDProps>) => {
      if (!node.threeDProps) return;
      updateThreeDProps(node.id, patch);
    },
    [node, updateThreeDProps]
  );

  if (node.type !== '3d' || !node.threeDProps) return null;

  const props = node.threeDProps;

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">3D Properties</div>

      {/* Shape */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Shape</span>
        <select
          value={props.shape}
          onChange={(e) => update3D({ shape: e.target.value as ThreeDProps['shape'] })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none capitalize"
        >
          {SHAPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      {/* Model URL */}
      {props.shape === 'model' && (
        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">Model URL (.glb)</span>
          <input
            type="text"
            value={props.modelUrl ?? ''}
            onChange={(e) => update3D({ modelUrl: e.target.value })}
            placeholder="https://example.com/model.glb"
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
      )}

      {/* Color */}
      <label className="flex items-center gap-2">
        <input
          type="color"
          value={props.color}
          onChange={(e) => update3D({ color: e.target.value })}
          className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
        />
        <div>
          <span className="text-[10px] text-neutral-500">Color</span>
          <div className="text-xs text-neutral-300">{props.color}</div>
        </div>
      </label>

      {/* Material */}
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Metalness</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={props.metalness}
            onChange={(e) => update3D({ metalness: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Roughness</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={props.roughness}
            onChange={(e) => update3D({ roughness: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </label>
      </div>

      {/* Rotation */}
      <div className="space-y-1">
        <span className="text-[10px] text-neutral-500">Rotation (radians)</span>
        <div className="grid grid-cols-3 gap-1">
          {(['X', 'Y', 'Z'] as const).map((axis, i) => (
            <label key={axis} className="space-y-0.5">
              <span className="text-[9px] text-neutral-600 block text-center">{axis}</span>
              <input
                type="number"
                step={0.1}
                value={props.rotation[i]}
                onChange={(e) => {
                  const newRot = [...props.rotation] as [number, number, number];
                  newRot[i] = parseFloat(e.target.value) || 0;
                  update3D({ rotation: newRot });
                }}
                className="w-full px-1.5 py-1 text-[11px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-center focus:border-indigo-500 focus:outline-none"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Light intensity */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Light Intensity</span>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={props.lightIntensity}
          onChange={(e) => update3D({ lightIntensity: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </label>

      {/* Environment */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Environment</span>
        <select
          value={props.environmentPreset ?? 'studio'}
          onChange={(e) => update3D({ environmentPreset: e.target.value as any })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        >
          {['studio', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'city', 'park', 'lobby'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>

      {/* Spotlight */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={props.spotLightEnabled ?? false}
          onChange={() => update3D({ spotLightEnabled: !props.spotLightEnabled })}
          className="rounded border-neutral-600 bg-neutral-800 text-indigo-500 focus:ring-indigo-500"
        />
        <span className="text-xs text-neutral-300">Spotlight</span>
      </label>

      {/* Auto-rotate */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={props.autoRotate}
          onChange={() => update3D({ autoRotate: !props.autoRotate })}
          className="rounded border-neutral-600 bg-neutral-800 text-indigo-500 focus:ring-indigo-500"
        />
        <span className="text-xs text-neutral-300">Auto-rotate</span>
      </label>

      {/* Additional Objects */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500">Scene Objects</span>
          <button
            onClick={() => {
              const objects = props.objects ?? [];
              update3D({
                objects: [...objects, { shape: 'box', color: '#22c55e', position: [1.5, 0, 0], scale: 0.5 }],
              });
            }}
            className="text-[10px] text-indigo-400 hover:text-indigo-300"
          >
            + Add
          </button>
        </div>
        {props.objects?.map((obj, i) => (
          <div key={i} className="p-1.5 bg-neutral-800 rounded space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neutral-500 capitalize">{obj.shape} #{i + 1}</span>
              <button
                onClick={() => {
                  const objects = [...(props.objects ?? [])];
                  objects.splice(i, 1);
                  update3D({ objects });
                }}
                className="text-[9px] text-neutral-600 hover:text-red-400"
              >
                x
              </button>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={obj.shape}
                onChange={(e) => {
                  const objects = [...(props.objects ?? [])];
                  objects[i] = { ...objects[i], shape: e.target.value as any };
                  update3D({ objects });
                }}
                className="flex-1 px-1 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none"
              >
                <option value="box">Box</option>
                <option value="sphere">Sphere</option>
                <option value="cylinder">Cylinder</option>
                <option value="torus">Torus</option>
              </select>
              <input
                type="color"
                value={obj.color}
                onChange={(e) => {
                  const objects = [...(props.objects ?? [])];
                  objects[i] = { ...objects[i], color: e.target.value };
                  update3D({ objects });
                }}
                className="w-5 h-5 rounded border border-neutral-600 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
