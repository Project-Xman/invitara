'use client';

import { useGLTF } from '@react-three/drei';

interface ModelLoaderProps {
  url: string;
  color: string;
  rotation: [number, number, number];
}

export function ModelLoader({ url, color, rotation }: ModelLoaderProps) {
  const { scene } = useGLTF(url);

  // Apply color to all meshes
  scene.traverse((child) => {
    if ((child as any).isMesh) {
      const mesh = child as any;
      if (mesh.material) {
        mesh.material = mesh.material.clone();
        mesh.material.color.set(color);
      }
    }
  });

  return <primitive object={scene} rotation={rotation} scale={1} />;
}
