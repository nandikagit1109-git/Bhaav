import { forwardRef, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// ========================================
// DESK
// ========================================
export const Desk = forwardRef(function Desk(_props, ref) {
  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.6, 0.04, 0.8]} />
        <meshStandardMaterial color="#4a3520" roughness={0.65} />
      </mesh>
      <mesh position={[-0.7, 0.3, -0.3]}>
        <boxGeometry args={[0.04, 0.6, 0.04]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.65} />
      </mesh>
      <mesh position={[0.7, 0.3, -0.3]}>
        <boxGeometry args={[0.04, 0.6, 0.04]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.65} />
      </mesh>
      <mesh position={[-0.7, 0.3, 0.3]}>
        <boxGeometry args={[0.04, 0.6, 0.04]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.65} />
      </mesh>
      <mesh position={[0.7, 0.3, 0.3]}>
        <boxGeometry args={[0.04, 0.6, 0.04]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.65} />
      </mesh>
    </group>
  );
});

// ========================================
// CHAIR
// ========================================
export function Chair() {
  return (
    <group position={[0, 0.22, 0.6]}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.4, 0.03, 0.4]} />
        <meshStandardMaterial color="#1a1816" roughness={0.85} />
      </mesh>
      <mesh position={[-0.17, -0.05, -0.17]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        <meshStandardMaterial color="#1a1816" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0.17, -0.05, -0.17]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        <meshStandardMaterial color="#1a1816" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[-0.17, -0.05, 0.17]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        <meshStandardMaterial color="#1a1816" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0.17, -0.05, 0.17]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        <meshStandardMaterial color="#1a1816" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.32, -0.18]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.025]} />
        <meshStandardMaterial color="#1a1816" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ========================================
// JOURNAL — NO useFrame, direct prop-based glow
// ========================================
export const Journal = forwardRef(function Journal({ highlighted }, ref) {
  return (
    <group ref={ref} position={[0.15, highlighted ? 0.67 : 0.65, 0]}>
      <RoundedBox args={[0.42, 0.04, 0.3]} radius={0.005} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#1a1816"
          roughness={0.85}
          emissive="#4a6fa5"
          emissiveIntensity={highlighted ? 0.8 : 0.05}
        />
      </RoundedBox>
      <mesh position={[-0.21, 0.002, 0]}>
        <boxGeometry args={[0.004, 0.045, 0.3]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.01, 0.035, 0.28]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.9} />
      </mesh>
    </group>
  );
});

// ========================================
// DESK LAMP — NO useFrame
// ========================================
export const DeskLamp = forwardRef(function DeskLamp({ highlighted }, ref) {
  return (
    <group ref={ref} position={[-0.5, 0.62, -0.2]}>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.03, 16]} />
        <meshStandardMaterial color="#1a1816" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.32, 8]} />
        <meshStandardMaterial color="#2a2520" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <coneGeometry args={[0.08, 0.1, 16, 1, true]} />
        <meshStandardMaterial
          color="#2a2520"
          roughness={0.6}
          emissive="#e8c080"
          emissiveIntensity={highlighted ? 0.8 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#e8b060" transparent opacity={highlighted ? 0.18 : 0.08} />
      </mesh>
    </group>
  );
});

// ========================================
// RADIO — NO useFrame
// ========================================
export const Radio = forwardRef(function Radio({ highlighted }, ref) {
  return (
    <group ref={ref} position={[1.2, 1.25, -1.75]}>
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.14, 0.12]} />
        <meshStandardMaterial color="#1a1512" roughness={0.7} emissive="#4a6fa5" emissiveIntensity={highlighted ? 0.15 : 0} />
      </mesh>
      <mesh position={[0, 0.02, 0.065]}>
        <cylinderGeometry args={[0.02, 0.02, 0.005, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.08, 0.12, 0]}>
        <cylinderGeometry args={[0.002, 0.001, 0.18, 6]} />
        <meshStandardMaterial color="#3a3530" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
});

// ========================================
// WALL CLOCK — keep hand rotation (essential)
// ========================================
export const WallClock = forwardRef(function WallClock({ highlighted }, ref) {
  const handRef = useRef();

  useFrame((state) => {
    if (handRef.current) handRef.current.rotation.z = -state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={ref} position={[-2.9, 1.8, -0.5]}>
      <mesh>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial color="#1a1816" roughness={0.8} emissive="#4a6fa5" emissiveIntensity={highlighted ? 0.15 : 0} />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <ringGeometry args={[0.14, 0.16, 32]} />
        <meshStandardMaterial color="#2a2520" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh ref={handRef} position={[0, 0, 0.003]}>
        <boxGeometry args={[0.005, 0.08, 0.002]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <circleGeometry args={[0.008, 16]} />
        <meshStandardMaterial color="#e8e0d5" />
      </mesh>
    </group>
  );
});

// ========================================
// FLOATING PAPERS — STATIC, no useFrame
// PERFORMANCE: Removed per-frame animation.
// ========================================
export function FloatingPapers() {
  const papers = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      pos: [-1.1 + i * 1.1, 0.7 + i * 0.45, -1 + i * 0.45],
      rot: [i * 0.45, i * 0.7, i * 0.25],
    }));
  }, []);

  return (
    <group>
      {papers.map((p) => (
        <mesh key={p.id} position={p.pos} rotation={p.rot}>
          <planeGeometry args={[0.18, 0.24]} />
          <meshStandardMaterial color="#2a2018" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ========================================
// BOOKSHELF — static, no useFrame
// ========================================
export const BookShelf = forwardRef(function BookShelf(_props, ref) {
  const books = useMemo(() => {      return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: -0.4 + i * 0.16,
       height: 0.22 + i * 0.04,
       color: new THREE.Color().setHSL(0.06 + i * 0.025, 0.25, 0.22 + i * 0.015),
       lean: (i - 1.5) * 0.025,
    }));
  }, []);

  return (
    <group ref={ref} position={[0, 1.15, -1.85]}>
      <mesh>
        <boxGeometry args={[1.4, 0.035, 0.28]} />
        <meshStandardMaterial color="#121010" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.4, 0.035, 0.28]} />
        <meshStandardMaterial color="#121010" roughness={0.85} />
      </mesh>
      {books.map((book) => (
        <mesh key={book.id} position={[book.x, book.height / 2 + 0.02, 0]} rotation={[0, 0, book.lean]}>
          <boxGeometry args={[0.08, book.height, 0.18]} />
          <meshStandardMaterial color={book.color} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
});

// ========================================
// WINDOW — NO useFrame
// ========================================
export const Window = forwardRef(function Window({ highlighted }, ref) {
  return (
    <group ref={ref} position={[3.95, 1.4, 0.5]}>
      <mesh>
        <boxGeometry args={[0.05, 1.1, 0.9]} />
        <meshStandardMaterial color="#151210" roughness={0.85} />
      </mesh>
      <mesh position={[0.03, 0, 0]}>
        <boxGeometry args={[0.02, 1.1, 0.015]} />
        <meshStandardMaterial color="#1a1816" roughness={0.8} />
      </mesh>
      <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.02, 0.9, 0.015]} />
        <meshStandardMaterial color="#1a1816" roughness={0.8} />
      </mesh>
      <mesh position={[0.03, 0, 0]}>
        <planeGeometry args={[0.85, 1.05]} />
        <meshStandardMaterial
          color="#0a1628"
          emissive="#1a2a4a"
          emissiveIntensity={highlighted ? 0.5 : 0.2}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
});

// ========================================
// WALL ART — NO useFrame, static emissive
// ========================================
export function WallArt() {
  return (
    <group position={[-2.95, 1.8, 0.5]}>
      <mesh>
        <boxGeometry args={[0.02, 0.7, 0.5]} />
        <meshStandardMaterial color="#2a2520" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0.015, 0, 0]}>
        <planeGeometry args={[0.01, 0.6, 0.4]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
      <mesh position={[0.015, -0.15, 0.1]}>
        <planeGeometry args={[0.01, 0.15, 0.15]} />
        <meshStandardMaterial color="#4a7a8a" emissive="#4a7a8a" emissiveIntensity={0.4} roughness={0.7} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ========================================
// POTTED PLANT — NO useFrame, static
// ========================================
export function PottedPlant() {
  return (
    <group position={[1.8, 0.62, 0.2]}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.05, 0.1, 12]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.01, 12]} />
        <meshStandardMaterial color="#1a1210" roughness={0.95} />
      </mesh>
      <group position={[0, 0.12, 0]}>
        {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.04, 0.05 + i * 0.03, Math.sin(angle) * 0.04]} rotation={[0.3 + i * 0.1, angle, 0.1]}>
            <planeGeometry args={[0.06, 0.08]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#2d5a3a' : '#3a6b4a'} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ========================================
// WALL LIGHT STRIP — NO useFrame, static emissive
// ========================================
export function WallLightStrip() {
  return (
    <group position={[-2.9, 0.3, 0]}>
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.01, 0.02, 4]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={0.8} roughness={0.5} />
      </mesh>
    </group>
  );
}
