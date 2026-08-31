import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './gameStore';

/**
 * Optimized mood lighting — 3 lights total instead of 13.
 * Main overhead + accent + fill. No shadows on most.
 */
export default function MoodLighting() {
  const mainRef = useRef();
  const roomState = useGameStore((s) => s.roomState);

  useFrame((state) => {
    if (!mainRef.current) return;
    // Subtle breathing on main light only
    const breathe = Math.sin(state.clock.elapsedTime * 0.3) * 0.05 + 0.35;
    mainRef.current.intensity = breathe;
  });

  return (
    <>
      {/* Ambient — base fill */}
      <ambientLight color="#1a1816" intensity={0.12} />

      {/* Main overhead — warm, single shadow caster */}
      <pointLight
        ref={mainRef}
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
