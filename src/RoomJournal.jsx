import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import MoodLighting from './MoodLighting.jsx';
import { Desk, Chair, FloatingPapers, BookShelf, Window, WallArt, PottedPlant, WallLightStrip } from './RoomObjects.jsx';
import InkLine from './InkLine.jsx';
import useGameStore from './gameStore';

// ========================================
// ROOM SHELL (shared)
// ========================================
function RoomShell() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.85} metalness={0.02} />
      </mesh>
      <mesh position={[0, 1.5, -2]} receiveShadow>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#100e0c" roughness={0.92} />
      </mesh>
      <mesh position={[-3, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.92} />
      </mesh>
      <mesh position={[3, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#0e0c0a" roughness={0.92} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#080606" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ========================================
// DUST PARTICLES
// ========================================
function DustParticles() {
  const ref = useRef();
  const count = 300;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = Math.random() * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.08 + i * 0.5) * 0.0003;
      arr[i * 3] += Math.cos(t * 0.05 + i * 0.3) * 0.0001;
      if (arr[i * 3 + 1] > 3) arr[i * 3 + 1] = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#e8d8c0" size={0.004} transparent opacity={0.12} sizeAttenuation />
    </points>
  );
}

// ========================================
// ROOM JOURNAL VIEW
// ========================================
export default function RoomJournal({ text, setText, onKeyDown, onEnd, savingSession, message, liveMetrics }) {
  const roomState = useGameStore((s) => s.roomState);
  const sessionActive = useGameStore((s) => s.sessionActive);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {/* 3D Background — static camera, no controls */}
      <Canvas
        camera={{ position: [0, 1.6, 2.5], fov: 55, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#050404']} />
          <fog attach="fog" args={['#050404', 1.5, 7]} />
          <MoodLighting />
          <RoomShell />
          <Desk highlighted={false} />
          <Chair />
          <WallArt />
          <PottedPlant />
          <WallLightStrip />
          <FloatingPapers clutterLevel={roomState.clutterLevel} />
          <BookShelf clutterLevel={roomState.clutterLevel} highlighted={false} />
          <Window moodLevel={roomState.clutterLevel} highlighted={false} />
          <DustParticles />
        </Suspense>
      </Canvas>

      {/* Writing Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            pointerEvents: 'auto',
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '18px',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            bhaav
          </span>
        </div>

        {/* Writing area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8vw',
            pointerEvents: 'auto',
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Begin wherever you are."
            autoFocus
            style={{
              width: 'min(850px, 100%)',
              height: '48vh',
              minHeight: '300px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              textAlign: 'center',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(30px, 4vw, 56px)',
              fontWeight: 300,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              caretColor: '#ffffff',
            }}
          />
        </div>

        {/* Bottom controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0 32px 24px',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={onEnd}
            disabled={savingSession}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: '12px 24px',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.3)')}
          >
            {savingSession ? 'saving...' : 'finish'}
          </button>
        </div>

        {/* Ink line */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(760px, 90vw)',
            height: '80px',
            pointerEvents: 'auto',
          }}
        >
          <InkLine active={sessionActive} liveMetrics={liveMetrics} />
        </div>

        {/* Status */}
        {message && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '9px',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
