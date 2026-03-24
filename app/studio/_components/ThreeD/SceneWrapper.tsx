'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type { ThreeDProps } from '~/studio/_lib/types';
import { PrimitiveShapes } from './PrimitiveShapes';
import { ModelLoader } from './ModelLoader';

interface SceneWrapperProps {
  props: ThreeDProps;
}

export function SceneWrapper({ props }: SceneWrapperProps) {
  return (
    <Canvas
      camera={{ position: props.cameraPosition, fov: 50 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={props.lightIntensity} />
      {props.spotLightEnabled && (
        <spotLight
          position={props.spotLightPosition ?? [5, 10, 5]}
          intensity={2}
          color={props.spotLightColor ?? '#ffffff'}
          angle={0.5}
          penumbra={0.5}
        />
      )}
      <Suspense fallback={null}>
        {props.shape === 'model' && props.modelUrl ? (
          <ModelLoader url={props.modelUrl} color={props.color} rotation={props.rotation} />
        ) : (
          <PrimitiveShapes
            shape={props.shape}
            color={props.color}
            metalness={props.metalness}
            roughness={props.roughness}
            rotation={props.rotation}
          />
        )}
        {props.objects?.map((obj, i) => (
          <mesh key={i} position={obj.position} scale={obj.scale}>
            {obj.shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
            {obj.shape === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
            {obj.shape === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 32]} />}
            {obj.shape === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
            <meshStandardMaterial color={obj.color} />
          </mesh>
        ))}
        <Environment preset={props.environmentPreset ?? 'studio'} />
      </Suspense>
      <OrbitControls autoRotate={props.autoRotate} autoRotateSpeed={2} enableZoom={true} />
    </Canvas>
  );
}
