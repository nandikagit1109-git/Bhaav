import * as THREE from 'three';

/**
 * Optimized mood lighting — 3 lights total, all static.
 * No useFrame hooks. Zero per-frame cost.
 */
export default function MoodLighting() {
  return (
    <>
      {/* Ambient — base fill */}
      <ambientLight color="#1a1816" intensity={0.12} />

      {/* Main overhead — warm */}
      <pointLight
        position={[0.3, 2.6, 0.2]}
        color="#e8c080"
        intensity={0.35}
        distance={7}
        decay={2}
      />

      {/* Fill — cool from behind */}
      <pointLight
        position={[0, 0.8, -1.5]}
        color="#2a3a5a"
        intensity={0.06}
        distance={4}
        decay={2}
      />
    </>
  );
}
