import { useMemo, forwardRef } from 'react';
import * as THREE from 'three';

/**
 * RoomAreas — all interactive zones in the 360° room.
 *
 * BACK WALL  (z=-3.5): RhythmWall + BookShelf
 * LEFT WALL  (x=-4):   SupportDoor + ReflectionSpace
 * RIGHT WALL (x=+4):   AnalysisDisplay + CampusPulse + Window (in RoomObjects)
 * FRONT WALL (z=+3.5): SuggestionCard
 *
 * Each feature is large enough to see and interact with.
 * All emit warm amber glow when looked at.
 */

// ========================================
// RHYTHM WALL — session history bars
// BACK WALL (z = -3.5), center-left
// ========================================
export const RhythmWall = forwardRef(function RhythmWall({ sessions = [], highlighted }, ref) {
  const bars = useMemo(() => {
    const count = Math.min(sessions.length || 0, 8);
    return Array.from({ length: Math.max(count, 1) }, (_, i) => {
      const s = sessions[i] || {};
      const wpm = Number(s.wpm || 15);
      return {
        id: i,
        w: Math.min(0.8, Math.max(0.2, wpm * 0.03)),
        h: 0.12 + (i / Math.max(count, 1)) * 0.4,
        x: -1.2 + i * 0.35,
        color: highlighted ? '#c8956c' : '#4a3520',
      };
    });
  }, [sessions, highlighted]);

  return (
    <group ref={ref} position={[0, 1.5, -3.45]}>
      {/* Background panel — warm dark */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.5, 2.2]} />
        <meshStandardMaterial
          color={highlighted ? '#2a1e14' : '#1e1610'}
          emissive={highlighted ? '#c8956c' : '#000'}
          emissiveIntensity={highlighted ? 0.08 : 0}
          roughness={0.85}
        />
      </mesh>

      {/* Horizontal baseline */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[3, 0.008, 0.005]} />
        <meshStandardMaterial color="#4a3520" emissive="#4a3520" emissiveIntensity={0.15} />
      </mesh>

      {/* Session bars */}
      {bars.map((b) => (
        <mesh key={b.id} position={[b.x, -0.3 + b.h / 2, 0.01]}>
          <boxGeometry args={[0.08, b.h, 0.01]} />
          <meshStandardMaterial
            color={b.color}
            emissive={b.color}
            emissiveIntensity={highlighted ? 0.3 : 0.1}
            roughness={0.6}
          />
        </mesh>
      ))}

      {/* Wall label — thin strip */}
      <mesh position={[0, -0.7, 0]}>
        <planeGeometry args={[2, 0.12]} />
        <meshStandardMaterial color="#1e1610" roughness={0.9} />
      </mesh>
    </group>
  );
});

// ========================================
// BOOKSHELF — session archive
// BACK WALL (z = -3.5), left side
// ========================================
export const BookShelfRef = forwardRef(function BookShelfRef({ highlighted }, ref) {
  const books = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: -0.5 + i * 0.18,
      height: 0.25 + i * 0.03,
      color: new THREE.Color().setHSL(0.06 + i * 0.02, 0.3, 0.22 + i * 0.01),
      lean: (i - 2) * 0.015,
    }));
  }, []);

  return (
    <group ref={ref} position={[-2.2, 1.2, -3.45]}>
      {/* Shelf board top */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.4, 0.03, 0.25]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.7} />
      </mesh>
      {/* Shelf board bottom */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.03, 0.25]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.7} />
      </mesh>
      {/* Side boards */}
      <mesh position={[-0.68, 0.175, 0]}>
        <boxGeometry args={[0.03, 0.38, 0.25]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.7} />
      </mesh>
      <mesh position={[0.68, 0.175, 0]}>
        <boxGeometry args={[0.03, 0.38, 0.25]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.7} />
      </mesh>
      {/* Books */}
      {books.map((book) => (
        <mesh key={book.id} position={[book.x, book.height / 2 + 0.02, 0]} rotation={[0, 0, book.lean]}>
          <boxGeometry args={[0.08, book.height, 0.18]} />
          <meshStandardMaterial
            color={book.color}
            emissive={highlighted ? '#c8956c' : '#000'}
            emissiveIntensity={highlighted ? 0.1 : 0}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
});

// ========================================
// SUPPORT DOOR — counselling
// LEFT WALL (x = -4), center
// ========================================
export const SupportDoor = forwardRef(function SupportDoor({ highlighted }, ref) {
  return (
    <group ref={ref} position={[-3.95, 0, -0.5]}>
      {/* Door frame */}
      <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.2, 2.0, 0.06]} />
        <meshStandardMaterial
          color={highlighted ? '#3d2a18' : '#2a1e14'}
          emissive={highlighted ? '#c8956c' : '#000'}
          emissiveIntensity={highlighted ? 0.12 : 0}
          roughness={0.75}
        />
      </mesh>

      {/* Door panel — slightly lighter */}
      <mesh position={[-0.01, 1.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.1, 1.9, 0.03]} />
        <meshStandardMaterial
          color={highlighted ? '#4a3520' : '#342a22'}
          emissive={highlighted ? '#c8956c' : '#000'}
          emissiveIntensity={highlighted ? 0.08 : 0}
          roughness={0.7}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[-0.02, 0.95, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
        <meshStandardMaterial
          color={highlighted ? '#c8956c' : '#8a7050'}
          emissive={highlighted ? '#c8956c' : '#000'}
          emissiveIntensity={highlighted ? 0.3 : 0}
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>

      {/* Warm light above door */}
      <pointLight
        position={[0.1, 2.2, 0]}
        color="#e8b060"
        intensity={highlighted ? 0.8 : 0.2}
        distance={3}
        decay={2}
      />

      {/* Label panel */}
      <mesh position={[0, 2.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 0.12]} />
        <meshStandardMaterial
          color={highlighted ? '#2a1e14' : '#1e1610'}
          emissive={highlighted ? '#c8956c' : '#000'}
          emissiveIntensity={highlighted ? 0.15 : 0}
          roughness={0.85}
        />
      </mesh>
    </group>
  );
});

// ========================================
// REFLECTION SPACE — framed picture
// LEFT WALL (x = -4), right side
// ========================================
export const ReflectionSpace = forwardRef(function ReflectionSpace({ highlighted }, ref) {
  return (
    <group ref={ref} position={[-3.95, 1.5, 1.2]}>
      {/* Frame outer */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.0, 0.8, 0.04]} />
        <meshStandardMaterial
          color={highlighted ? '#4a3520' : '#2a1e14'}
          emissive={highlighted ? '#c8956c' : '#000'}
          emissiveIntensity={highlighted ? 0.1 : 0}
          roughness={0.75}
        />
      </mesh>

      {/* Frame inner — canvas */}
      <mesh position={[-0.025, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.85, 0.65]} />
        <meshStandardMaterial
          color={highlighted ? '#2a2218' : '#1a1410'}
          emissive={highlighted ? '#c8956c' : '#3a2a1a'}
          emissiveIntensity={highlighted ? 0.15 : 0.04}
          roughness={0.9}
        />
      </mesh>

      {/* Decorative line across the frame — abstract art */}
      <mesh position={[-0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.6, 0.008, 0.003]} />
        <meshStandardMaterial
          color="#c8956c"
          emissive="#c8956c"
          emissiveIntensity={highlighted ? 0.5 : 0.15}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
});

// ========================================
// ANALYSIS DISPLAY — data screen
// RIGHT WALL (x = +4), center
// ========================================
export const AnalysisDisplay = forwardRef(function AnalysisDisplay({ highlighted }, ref) {
  return (
    <group ref={ref} position={[3.95, 1.5, 0]}>
      {/* Display frame */}
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[2.0, 1.2, 0.06]} />
        <meshStandardMaterial
          color={highlighted ? '#2a1e14' : '#1a1210'}
          emissive={highlighted ? '#c8956c' : '#000'}
          emissiveIntensity={highlighted ? 0.08 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Screen surface */}
      <mesh position={[-0.035, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.85, 1.05]} />
        <meshStandardMaterial
          color={highlighted ? '#1a2a3a' : '#0e1a28'}
          emissive={highlighted ? '#4a7a8a' : '#1a2a3a'}
          emissiveIntensity={highlighted ? 0.3 : 0.08}
          transparent
          opacity={0.9}
          roughness={0.5}
        />
      </mesh>

      {/* Data bars — visual representation of rhythm */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.04, -0.35 + i * 0.15, -0.6 + i * 0.12]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[0.01, 0.06, 0.3 + i * 0.1]} />
          <meshStandardMaterial
            color={highlighted ? '#4a7a8a' : '#1a2a3a'}
            emissive={highlighted ? '#4a7a8a' : '#000'}
            emissiveIntensity={highlighted ? 0.4 : 0}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Ambient glow when highlighted */}
      {highlighted && (
        <pointLight position={[-0.3, 0, 0]} color="#4a7a8a" intensity={0.4} distance={3} decay={2} />
      )}
    </group>
  );
});

// ========================================
// CAMPUS PULSE — institutional display
// RIGHT WALL (x = +4), right side
// ========================================
export const CampusPulse = forwardRef(function CampusPulse({ highlighted }, ref) {
  return (
    <group ref={ref} position={[3.95, 1.2, 1.8]}>
      {/* Display panel */}
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.0, 0.7, 0.05]} />
        <meshStandardMaterial
          color={highlighted ? '#0a1a2a' : '#0a0e14'}
          emissive={highlighted ? '#4a7a8a' : '#000'}
          emissiveIntensity={highlighted ? 0.2 : 0}
          roughness={0.85}
        />
      </mesh>

      {/* Screen */}
      <mesh position={[-0.03, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.85, 0.55]} />
        <meshStandardMaterial
          color={highlighted ? '#101828' : '#060a10'}
          emissive={highlighted ? '#2a4a5a' : '#000'}
          emissiveIntensity={highlighted ? 0.3 : 0}
          roughness={0.6}
        />
      </mesh>

      {highlighted && (
        <pointLight position={[-0.2, 0, 0]} color="#4a7a8a" intensity={0.3} distance={2} decay={2} />
      )}
    </group>
  );
});

// ========================================
// SUGGESTION CARD — floating note
// FRONT WALL (z = +3.5)
// ========================================
export const SuggestionCard = forwardRef(function SuggestionCard({ highlighted }, ref) {
  return (
    <group ref={ref} position={[0, 1.6, 3.45]}>
      {/* Card background */}
      <mesh rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.03]} />
        <meshStandardMaterial
          color={highlighted ? '#2a1e14' : '#1e1610'}
          emissive={highlighted ? '#c8956c' : '#000'}
          emissiveIntensity={highlighted ? 0.12 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Inner surface — warmer */}
      <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.05, 0.65]} />
        <meshStandardMaterial
          color={highlighted ? '#342820' : '#2a1e14'}
          emissive={highlighted ? '#c8956c' : '#3a2a1a'}
          emissiveIntensity={highlighted ? 0.15 : 0.03}
          roughness={0.85}
        />
      </mesh>

      {/* Decorative line — like a handwritten note */}
      <mesh position={[0, 0.1, -0.03]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.6, 0.005, 0.002]} />
        <meshStandardMaterial
          color="#c8956c"
          emissive="#c8956c"
          emissiveIntensity={highlighted ? 0.4 : 0.1}
        />
      </mesh>
      <mesh position={[0, -0.05, -0.03]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.45, 0.005, 0.002]} />
        <meshStandardMaterial
          color="#c8956c"
          emissive="#c8956c"
          emissiveIntensity={highlighted ? 0.3 : 0.08}
        />
      </mesh>

      {/* Warm glow when approached */}
      {highlighted && (
        <pointLight position={[0, 0, 0.5]} color="#c8956c" intensity={0.5} distance={3} decay={2} />
      )}
    </group>
  );
});

// ========================================
// SESSION MEMORY MARKS
// ========================================
export function SessionMemory({ sessionCount = 0 }) {
  const marks = useMemo(() => {
    return Array.from({ length: Math.min(sessionCount, 6) }, (_, i) => ({
      id: i,
      x: -3.75 + (i % 3) * 0.07,
      y: 0.5 + (i % 4) * 0.45,
      z: -1.4 + (i % 5) * 0.6,
      size: 0.02 + (i % 3) * 0.01,
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
