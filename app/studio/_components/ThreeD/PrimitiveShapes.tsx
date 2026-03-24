'use client';

import { useRef } from 'react';
import type { Mesh } from 'three';

interface PrimitiveShapesProps {
  shape: 'box' | 'sphere' | 'cylinder' | 'torus' | 'model';
  color: string;
  metalness: number;
  roughness: number;
  rotation: [number, number, number];
}

export function PrimitiveShapes({ shape, color, metalness, roughness, rotation }: PrimitiveShapesProps) {
  const meshRef = useRef<Mesh>(null);

  const material = (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
    />
  );

  const geometryMap = {
    box: <boxGeometry args={[1.5, 1.5, 1.5]} />,
    sphere: <sphereGeometry args={[1, 32, 32]} />,
    cylinder: <cylinderGeometry args={[0.7, 0.7, 1.5, 32]} />,
    torus: <torusGeometry args={[0.8, 0.3, 16, 32]} />,
    model: null,
  };

  const geometry = geometryMap[shape];
  if (!geometry) return null;

  return (
    <mesh ref={meshRef} rotation={rotation}>
      {geometry}
      {material}
    </mesh>
  );
}
