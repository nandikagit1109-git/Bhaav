import { useRef, useMemo, forwardRef } from 'react';
import * as THREE from 'three';

/**
 * RoomAreas — all interactive zones in the room.
 *
 * PERFORMANCE: Removed ALL Drei Text components. Each Drei Text creates
 * a canvas texture + canvas mesh which is very expensive. Replaced with
 * simple colored meshes. Total meshes reduced from ~48 to ~15.
 */

// ========================================
// RHYTHM WALL — session history (minimal)
// ========================================
export const RhythmWall = forwardRef(function RhythmWall({ sessions = [], highlighted }, ref) {
  const bars = useMemo(() => {
    const count = Math.min(sessions.length || 3, 6);
    return Array.from({ length: count }, (_, i) => {
      const s = sessions[i] || {};
      const wpm = Number(s.wpm || 15);
      return {
        id: i,
        w: Math.min(0.6, Math.max(0.15, wpm * 0.025)),
        h: 0.08 + Math.random() * 0.15,
        y: -0.6 + i * 0.2,
        color: highlighted ? '#c8956c' : '#3a2a1a',
      };
    });
  }, [sessions, highlighted]);

  return (
    <group ref={ref} position={[-2.9, 1.5, -1]}>
      <mesh>
        <planeGeometry args={[0.02, 2]} />
        <meshStandardMaterial color="#1a1410" roughness={0.9} />
      </mesh>
      {bars.map((b) => (
        <mesh key={b.id} position={[0.03, b.y, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.01, b.h, b.w]} />
          <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.15} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
});

// ========================================
// REFLECTION SPACE — minimal
// ========================================
export const ReflectionSpace = forwardRef(function ReflectionSpace({ insight, highlighted }, ref) {
  return (
    <group ref={ref} position={[2.5, 1.5, -1.5]}>
      <mesh>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial
          color={highlighted ? '#2a1e14' : '#1a1410'}
          emissive={highlighted ? '#c8956c' : '#000000'}
          emissiveIntensity={highlighted ? 0.1 : 0}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
});

// ========================================
// SUPPORT ROOM — minimal
// ========================================
export const SupportRoom = forwardRef(function SupportRoom({ highlighted }, ref) {
  return (
    <group ref={ref} position={[-2, 1.2, 1]}>
      <mesh>
        <boxGeometry args={[0.6, 1.4, 0.04]} />
        <meshStandardMaterial
          color={highlighted ? '#2a2018' : '#1a1410'}
          emissive={highlighted ? '#c8956c' : '#000000'}
          emissiveIntensity={highlighted ? 0.15 : 0}
          roughness={0.85}
        />
      </mesh>
    </group>
  );
});

// ========================================
// ANALYSIS ZONE — minimal
// ========================================
export const AnalysisZone = forwardRef(function AnalysisZone({ analysis, highlighted }, ref) {
  return (
    <group ref={ref} position={[0, 1.5, -1.8]}>
      <mesh>
        <planeGeometry args={[2.5, 0.8]} />
        <meshStandardMaterial
          color={highlighted ? '#2a1e14' : '#1a1410'}
          emissive={highlighted ? '#c8956c' : '#000000'}
          emissiveIntensity={highlighted ? 0.08 : 0}
          transparent
          opacity={0.3}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
});

// ========================================
// CAMPUS PULSE — minimal
// ========================================
export const CampusPulse = forwardRef(function CampusPulse({ campusData, highlighted }, ref) {
  return (
    <group ref={ref} position={[2.5, 1.2, 1]}>
      <mesh>
        <boxGeometry args={[0.5, 0.35, 0.04]} />
        <meshStandardMaterial
          color={highlighted ? '#0a1a2a' : '#0a0e14'}
          emissive={highlighted ? '#4a7a8a' : '#000000'}
          emissiveIntensity={highlighted ? 0.15 : 0}
          roughness={0.85}
        />
      </mesh>
    </group>
  );
});

// ========================================
// SUGGESTION OBJECT — minimal
// ========================================
export const SuggestionObject = forwardRef(function SuggestionObject({ suggestion, highlighted }, ref) {
  if (!suggestion) return null;
  return (
    <group ref={ref} position={[1.5, 1.0, -0.5]}>
      <mesh>
        <planeGeometry args={[0.12, 0.16]} />
        <meshStandardMaterial
          color="#1a1410"
          emissive={highlighted ? '#c8956c' : '#3a2a1a'}
          emissiveIntensity={highlighted ? 0.4 : 0.1}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
});

// ========================================
// SESSION MEMORY MARKS — reduced to 6
// ========================================
export function SessionMemory({ sessionCount = 0 }) {
  const marks = useMemo(() => {
    return Array.from({ length: Math.min(sessionCount, 6) }, (_, i) => ({
      id: i,
      x: -2.8 + Math.random() * 0.2,
      y: 0.5 + Math.random() * 2,
      z: -1.5 + Math.random() * 3,
      size: 0.02 + Math.random() * 0.02,
    }));
  }, [sessionCount]);

  if (!marks.length) return null;

  return (
    <group>
      {marks.map((mark) => (
        <mesh key={mark.id} position={[mark.x, mark.y, mark.z]}>
          <sphereGeometry args={[mark.size, 4, 4]} />
          <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={0.2} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
