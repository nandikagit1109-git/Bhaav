import { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from './gameStore';

// ========================================
// DESK
// ========================================
export const Desk = forwardRef(function Desk({ highlighted }, ref) {
  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.4, 0.05, 0.8]} />
        <meshStandardMaterial color="#1a1512" roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.575, 0.4]}>
        <boxGeometry args={[1.4, 0.01, 0.01]} />
        <meshStandardMaterial color="#2a2520" roughness={0.6} />
      </mesh>
      {[[-0.6, 0.3, -0.35], [0.6, 0.3, -0.35], [-0.6, 0.3, 0.35], [0.6, 0.3, 0.35]].map(
        (pos, i) => (
          <mesh key={i} position={pos}>
            <cylinderGeometry args={[0.018, 0.025, 0.6, 8]} />
            <meshStandardMaterial color="#151210" roughness={0.85} />
          </mesh>
        )
      )}
      <mesh position={[0, 0.48, 0.38]}>
        <boxGeometry args={[0.15, 0.008, 0.008]} />
        <meshStandardMaterial color="#2a2520" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
});

// ========================================
// CHAIR
// ========================================
export function Chair() {
  return (
    <group position={[0, 0, 1.3]}>
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.44, 0.04, 0.44]} />
        <meshStandardMaterial color="#181412" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.72, -0.2]}>
        <boxGeometry args={[0.44, 0.55, 0.035]} />
        <meshStandardMaterial color="#181412" roughness={0.85} />
      </mesh>
      {[[-0.17, 0.22, -0.17], [0.17, 0.22, -0.17], [-0.17, 0.22, 0.17], [0.17, 0.22, 0.17]].map(
        (pos, i) => (
          <mesh key={i} position={pos}>
            <cylinderGeometry args={[0.012, 0.015, 0.44, 8]} />
            <meshStandardMaterial color="#100e0c" roughness={0.9} />
          </mesh>
        )
      )}
    </group>
  );
}

// ========================================
// JOURNAL (on desk)
// ========================================
export const Journal = forwardRef(function Journal({ highlighted }, ref) {
  const bodyRef = useRef();
  const matRef = useRef();

  useFrame(() => {
    if (bodyRef.current) {
      const targetY = highlighted ? 0.02 : 0;
      bodyRef.current.position.y += (targetY - bodyRef.current.position.y) * 0.06;
    }
    if (matRef.current) {
      const mat = matRef.current;
      const target = highlighted ? 0.8 : 0.05;
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.06;
    }
  });

  return (
    <group ref={ref} position={[0.15, 0.65, 0]}>
      <group ref={bodyRef}>
        <RoundedBox args={[0.42, 0.04, 0.3]} radius={0.005} smoothness={4} castShadow>
          <meshStandardMaterial
            ref={matRef}
            color="#1a1816"
            roughness={0.85}
            emissive="#4a6fa5"
            emissiveIntensity={0.05}
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
    </group>
  );
});

// ========================================
// DESK LAMP — NO pointLight, just emissive
// ========================================
export const DeskLamp = forwardRef(function DeskLamp({ highlighted }, ref) {
  const shadeRef = useRef();

  useFrame(() => {
    if (shadeRef.current) {
      const target = highlighted ? 0.8 : 0.2;
      shadeRef.current.material.emissiveIntensity += (target - shadeRef.current.material.emissiveIntensity) * 0.04;
    }
  });

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
      <mesh ref={shadeRef} position={[0, 0.35, 0]}>
        <coneGeometry args={[0.08, 0.1, 16, 1, true]} />
        <meshStandardMaterial
          color="#2a2520"
          roughness={0.6}
          emissive="#e8c080"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Warm glow via emissive only — no pointLight */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#e8c080" transparent opacity={highlighted ? 0.08 : 0.02} />
      </mesh>
    </group>
  );
});

// ========================================
// RADIO
// ========================================
export const Radio = forwardRef(function Radio({ highlighted }, ref) {
  const bodyRef = useRef();

  useFrame(() => {
    if (!bodyRef.current) return;
    const mat = bodyRef.current.material;
    const target = highlighted ? 0.15 : 0;
    mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.05;
  });

  return (
    <group ref={ref} position={[1.2, 1.25, -1.75]}>
      <mesh ref={bodyRef} castShadow>
        <boxGeometry args={[0.2, 0.14, 0.12]} />
        <meshStandardMaterial color="#1a1512" roughness={0.7} emissive="#4a6fa5" emissiveIntensity={0} />
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
// WALL CLOCK
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
// FLOATING PAPERS — optimized, fewer updates
// ========================================
export function FloatingPapers({ clutterLevel = 0 }) {
  const groupRef = useRef();
  const papers = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      pos: [(Math.random() - 0.5) * 3, 0.5 + Math.random() * 2, (Math.random() - 0.5) * 2 - 1],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      speed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const p = papers[i];
      if (!p) return;
      const amp = 0.1 + clutterLevel * 0.5;
      child.position.y = p.pos[1] + Math.sin(t * p.speed + p.phase) * amp;
    });
  });

  return (
    <group ref={groupRef}>
      {papers.map((p) => (
        <mesh key={p.id} position={p.pos} rotation={p.rot}>
          <planeGeometry args={[0.18, 0.24]} />
          <meshStandardMaterial color="#1a1816" side={THREE.DoubleSide} transparent opacity={0.25 + clutterLevel * 0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ========================================
// BOOKSHELF — no pointLight
// ========================================
export const BookShelf = forwardRef(function BookShelf({ clutterLevel = 0, highlighted }, ref) {
  const books = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: -0.4 + i * 0.16,
      height: 0.22 + Math.random() * 0.18,
      color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 0.15, 0.12 + Math.random() * 0.08),
      lean: (Math.random() - 0.5) * 0.08,
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
// WINDOW — no pointLight
// ========================================
export const Window = forwardRef(function Window({ moodLevel = 0, highlighted }, ref) {
  const paneRef = useRef();

  useFrame(() => {
    if (paneRef.current) {
      const target = highlighted ? 0.5 : 0.2;
      paneRef.current.material.emissiveIntensity += (target - paneRef.current.material.emissiveIntensity) * 0.04;
    }
  });

  return (
    <group ref={ref} position={[2.85, 1.4, -0.5]}>
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
      <mesh ref={paneRef} position={[0.03, 0, 0]}>
        <planeGeometry args={[0.85, 1.05]} />
        <meshStandardMaterial color="#0a1628" emissive="#1a2a4a" emissiveIntensity={0.2} transparent opacity={0.4} />
      </mesh>
    </group>
  );
});

// ========================================
// WALL ART — no pointLight, just emissive
// ========================================
export function WallArt() {
  const canvasRef = useRef();

  useFrame((state) => {
    if (canvasRef.current) {
      canvasRef.current.material.emissiveIntensity = Math.sin(state.clock.elapsedTime * 0.3) * 0.05 + 0.3;
    }
  });

  return (
    <group position={[-2.95, 1.8, 0.5]}>
      <mesh>
        <boxGeometry args={[0.02, 0.7, 0.5]} />
        <meshStandardMaterial color="#2a2520" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh ref={canvasRef} position={[0.015, 0, 0]}>
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
// POTTED PLANT
// ========================================
export function PottedPlant() {
  const leavesRef = useRef();

  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    }
  });

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
      <group ref={leavesRef} position={[0, 0.12, 0]}>
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
// WALL LIGHT STRIP — emissive only, no pointLight
// ========================================
export function WallLightStrip() {
  const stripRef = useRef();

  useFrame((state) => {
    if (stripRef.current) {
      stripRef.current.material.emissiveIntensity = Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + 0.8;
    }
  });

  return (
    <group position={[-2.9, 0.3, 0]}>
      <mesh ref={stripRef} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.01, 0.02, 4]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={1} roughness={0.5} />
      </mesh>
    </group>
  );
}
