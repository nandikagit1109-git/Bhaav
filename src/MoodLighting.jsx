import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './gameStore';

/**
 * Graffico-style baked cinematic lighting.
 * Warm, soft, directional — with mood-reactive color shifts.
 */
export default function MoodLighting() {
  const mainLightRef = useRef();
  const ambientRef = useRef();
  const accentRef = useRef();
  const fillRef = useRef();

  const roomState = useGameStore((s) => s.roomState);

  const targets = useRef({
    intensity: 0.4,
    ambient: 0.08,
    warmth: 0.3,
  });

  useFrame((state, delta) => {
    const { lightingIntensity, roomWarmth } = roomState;
    const t = state.clock.elapsedTime;

    targets.current.intensity = lightingIntensity;
    targets.current.ambient = 0.06 + roomWarmth * 0.06;
    targets.current.warmth = roomWarmth;

    // Main overhead — warm, soft, cinematic
    if (mainLightRef.current) {
      mainLightRef.current.intensity +=
        (targets.current.intensity - mainLightRef.current.intensity) * delta * 2;

      const warmHue = THREE.MathUtils.lerp(0.08, 0.55, targets.current.warmth);
      mainLightRef.current.color.setHSL(warmHue, 0.25, 0.45);
    }

    // Ambient — very subtle base fill
    if (ambientRef.current) {
      ambientRef.current.intensity +=
        (targets.current.ambient - ambientRef.current.intensity) * delta * 2;
    }

    // Accent — warm side light, gentle breathing
    if (accentRef.current) {
      const breathe = Math.sin(t * 0.3) * 0.03 + 0.12;
      accentRef.current.intensity = breathe;
    }

    // Fill — very subtle cool fill from behind
    if (fillRef.current) {
      fillRef.current.intensity = 0.04 + Math.sin(t * 0.2) * 0.01;
    }
  });

  return (
    <>
      {/* Ambient base */}
      <ambientLight ref={ambientRef} color="#1a1816" intensity={0.08} />

      {/* Main overhead — warm, slightly off-center like a pendant lamp */}
      <pointLight
        ref={mainLightRef}
        position={[0.3, 2.6, 0.2]}
        color="#e8c080"
        intensity={0.4}
        distance={7}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
      />

      {/* Accent — warm side light */}
      <pointLight
        ref={accentRef}
        position={[-2, 1.8, 0.5]}
        color="#e8a860"
        intensity={0.12}
        distance={5}
        decay={2}
      />

      {/* Fill — cool fill from behind */}
      <pointLight
        ref={fillRef}
        position={[0, 0.8, -1.5]}
        color="#2a3a5a"
        intensity={0.04}
        distance={4}
        decay={2}
      />

      {/* Subtle directional for shadow definition */}
      <directionalLight
        position={[2, 3, 1]}
        color="#e8d0b0"
        intensity={0.08}
        castShadow={false}
      />
    </>
  );
}
