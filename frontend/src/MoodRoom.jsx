import { Suspense, useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';

import FirstPersonControls from './FirstPersonControls.jsx';
import Crosshair from './Crosshair.jsx';
import MoodLighting from './MoodLighting.jsx';
import {
  Desk, Chair, Journal, DeskLamp, WallClock,
  BookShelf, Window, WallArt, PottedPlant, WallLightStrip,
} from './RoomObjects.jsx';
import {
  RhythmWall, SupportRoom, AnalysisZone,
} from './RoomAreas.jsx';
import useGameStore from './gameStore';

// ========================================
// ROOM SHELL — static, no useFrame
// ========================================
function RoomShell() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.85} metalness={0.02} />
      </mesh>
      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[10, 3]} />
        <meshStandardMaterial color="#100e0c" roughness={0.92} />
      </mesh>
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.92} />
      </mesh>
      <mesh position={[4, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.92} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#080606" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ========================================
// DUST PARTICLES — STATIC, no useFrame
// ========================================
// PERFORMANCE: Previous version had 50 particles with per-frame useFrame
// updates. Now purely static — zero per-frame CPU cost.
function DustParticles() {
  const positions = useMemo(() => {
    const count = 30;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = Math.random() * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={30} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#e8d8c0" size={0.004} transparent opacity={0.1} sizeAttenuation />
    </points>
  );
}

// ========================================
// LOADING SCREEN
// ========================================
function LoadingScreen({ progress }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: '#000', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 10,
      transition: 'opacity 0.8s ease', opacity: progress >= 100 ? 0 : 1,
      pointerEvents: progress >= 100 ? 'none' : 'auto',
    }}>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300,
        letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '24px',
      }}>entering the room</p>
      <div style={{
        width: '200px', height: '1px', background: 'rgba(255,255,255,0.08)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${progress}%`, background: 'rgba(255,255,255,0.25)',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.15)', marginTop: '12px',
      }}>{progress}%</p>
    </div>
  );
}

// ========================================
// CENTERED INK WAVE — CSS only, no framer-motion
// ========================================
// PERFORMANCE: Replaced framer-motion infinite animations with CSS.
function CenteredInkWave() {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(700px, 85vw)', height: '120px',
      pointerEvents: 'none', zIndex: 2,
      opacity: 0.4,
      animation: 'inkPulse 6s ease-in-out infinite',
    }}>
      <svg viewBox="0 0 900 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <path
          d="M 0 50 C 80 25, 160 75, 250 50 C 340 25, 420 75, 500 50 C 580 25, 660 75, 750 50 C 830 25, 880 75, 900 50"
          fill="none" stroke="#c8956c" strokeWidth="1.2" strokeLinecap="round"
        />
        <path
          d="M 0 50 C 100 35, 180 65, 280 48 C 380 31, 460 69, 560 50 C 660 31, 740 69, 900 50"
          fill="none" stroke="#4a7a8a" strokeWidth="0.6" strokeLinecap="round" opacity="0.4"
        />
        <circle cx="900" cy="50" r="3" fill="#c8956c" opacity="0.6" />
      </svg>
    </div>
  );
}

// ========================================
// INTERACTION LABEL
// ========================================
function InteractionLabel({ hoveredObject }) {
  if (!hoveredObject) return null;
  const labels = {
    journal: 'write', lamp: 'toggle light',
    clock: 'notice time', bookshelf: 'browse', window: 'look outside',
    rhythmWall: 'explore rhythm', support: 'support', analysis: 'explore data',
  };
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, calc(-50% + 24px))',
      pointerEvents: 'none', textAlign: 'center',
    }}>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
      }}>[E] {labels[hoveredObject] || hoveredObject}</p>
    </div>
  );
}

// ========================================
// MAIN MOOD ROOM — OPTIMIZED
// ========================================
export default function MoodRoom({ onWrite, onDashboard }) {
  const hoveredObject = useGameStore((s) => s.hoveredObject);
  const sessions = useGameStore((s) => s.sessions);
  const sessionCount = useGameStore((s) => s.sessionCount);
  const analysis = useGameStore((s) => s.analysis);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Refs for interactable objects
  const journalRef = useRef();
  const lampRef = useRef();
  const clockRef = useRef();
  const bookshelfRef = useRef();
  const windowRef = useRef();
  const rhythmWallRef = useRef();
  const supportRef = useRef();
  const analysisRef = useRef();

  // Loading simulation
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setLoading(false), 600);
      }
      setLoadProgress(Math.min(100, Math.round(progress)));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Interactable definitions
  const interactables = useMemo(() => [
    { id: 'journal', ref: journalRef, maxDistance: 3 },
    { id: 'lamp', ref: lampRef, maxDistance: 3 },
    { id: 'clock', ref: clockRef, maxDistance: 4 },
    { id: 'bookshelf', ref: bookshelfRef, maxDistance: 4 },
    { id: 'window', ref: windowRef, maxDistance: 4 },
    { id: 'rhythmWall', ref: rhythmWallRef, maxDistance: 4 },
    { id: 'support', ref: supportRef, maxDistance: 4 },
    { id: 'analysis', ref: analysisRef, maxDistance: 4 },
  ], []);

  // E-key interaction
  const handleInteract = useCallback((objectId) => {
    switch (objectId) {
      case 'journal': onWrite(); break;
      case 'analysis': onDashboard?.(); break;
      case 'support': onDashboard?.(); break;
      default: break;
    }
  }, [onWrite, onDashboard]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {loading && <LoadingScreen progress={loadProgress} />}

      <Canvas
        camera={{ position: [0, 1.6, 2.5], fov: 55, near: 0.1, far: 50 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', top: 0, left: 0 }}
        onCreated={() => setLoadProgress(100)}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#050404']} />
          <fog attach="fog" args={['#050404', 1.5, 8]} />

          <FirstPersonControls
            moveSpeed={2.8}
            friction={6}
            breathFrequency={0.4}
            breathAmplitude={0.008}
            initialPosition={[0, 1.6, 2.5]}
            bounds={{ minX: -3.8, maxX: 3.8, minZ: -2.8, maxZ: 2.8 }}
          />

          <Crosshair interactables={interactables} onInteract={handleInteract} />
          <MoodLighting />
          <RoomShell />

          {/* Core interactables */}
          <Desk highlighted={false} />
          <Chair />
          <Journal ref={journalRef} highlighted={hoveredObject === 'journal'} />
          <DeskLamp ref={lampRef} highlighted={hoveredObject === 'lamp'} />
          <PottedPlant />

          {/* Data areas */}
          <RhythmWall ref={rhythmWallRef} sessions={sessions} highlighted={hoveredObject === 'rhythmWall'} />
          <AnalysisZone ref={analysisRef} analysis={analysis} highlighted={hoveredObject === 'analysis'} />
          <SupportRoom ref={supportRef} highlighted={hoveredObject === 'support'} />

          {/* Decor — all static, zero useFrame */}
          <WallClock ref={clockRef} highlighted={hoveredObject === 'clock'} />
          <BookShelf ref={bookshelfRef} highlighted={hoveredObject === 'bookshelf'} />
          <Window ref={windowRef} highlighted={hoveredObject === 'window'} />
          <WallArt />
          <WallLightStrip />
          <DustParticles />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
      }}>
        <CenteredInkWave />
        <InteractionLabel hoveredObject={hoveredObject} />

        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 32px', pointerEvents: 'auto',
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '18px',
            fontWeight: 300, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.4)',
          }}>bhaav</span>
          <button onClick={onDashboard} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
            fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', cursor: 'pointer', padding: '8px 0',
          }}>dashboard</button>
        </div>

        <div style={{
          position: 'absolute', bottom: '32px', left: 0, right: 0, textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: '8px', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.08)',
          }}>click to look · wasd to move · e to interact · esc to release</p>
        </div>
      </div>

      {/* CSS for ink pulse animation */}
      <style>{`
        @keyframes inkPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
