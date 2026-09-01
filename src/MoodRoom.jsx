import { Suspense, useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';

import FirstPersonControls from './FirstPersonControls.jsx';
import Crosshair from './Crosshair.jsx';
import MoodLighting from './MoodLighting.jsx';
import {
  Desk, Journal, DeskLamp, WallClock,
  Window, FloatingPapers,
} from './RoomObjects.jsx';
import {
  RhythmWall, BookShelfRef, ReflectionSpace, SupportDoor,
  AnalysisDisplay, CampusPulse, SuggestionCard,
} from './RoomAreas.jsx';
import useGameStore from './gameStore';

// ========================================
// ROOM SHELL — full 360° enclosed room
// ========================================
function RoomShell() {
  return (
    <group>
      {/* Floor — warm wood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial color="#3d2e1e" roughness={0.55} metalness={0.02} />
      </mesh>

      {/* Back wall — Rhythm Wall (z = -3.5) */}
      <mesh position={[0, 1.5, -3.5]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#3a3028" roughness={0.75} />
      </mesh>

      {/* Front wall — Suggestion Wall (z = +3.5) */}
      <mesh position={[0, 1.5, 3.5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#342820" roughness={0.75} />
      </mesh>

      {/* Left wall — Support Wall (x = -4) */}
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[7, 3]} />
        <meshStandardMaterial color="#342a22" roughness={0.75} />
      </mesh>

      {/* Right wall — Analysis Wall (x = +4) */}
      <mesh position={[4, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[7, 3]} />
        <meshStandardMaterial color="#3d3028" roughness={0.75} />
      </mesh>

      {/* Ceiling — lighter */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial color="#2a2218" roughness={0.9} />
      </mesh>

      {/* Baseboard trim — back wall */}
      <mesh position={[0, 0.05, -3.48]}>
        <boxGeometry args={[8, 0.1, 0.03]} />
        <meshStandardMaterial color="#2a1e14" roughness={0.7} />
      </mesh>
      {/* Baseboard trim — front wall */}
      <mesh position={[0, 0.05, 3.48]}>
        <boxGeometry args={[8, 0.1, 0.03]} />
        <meshStandardMaterial color="#2a1e14" roughness={0.7} />
      </mesh>
      {/* Baseboard trim — left wall */}
      <mesh position={[-3.98, 0.05, 0]}>
        <boxGeometry args={[0.03, 0.1, 7]} />
        <meshStandardMaterial color="#2a1e14" roughness={0.7} />
      </mesh>
      {/* Baseboard trim — right wall */}
      <mesh position={[3.98, 0.05, 0]}>
        <boxGeometry args={[0.03, 0.1, 7]} />
        <meshStandardMaterial color="#2a1e14" roughness={0.7} />
      </mesh>
    </group>
  );
}


// ========================================
// LOADING SCREEN
// ========================================
function LoadingScreen({ progress }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: '#1a1410', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 10,
      transition: 'opacity 0.8s ease', opacity: progress >= 100 ? 0 : 1,
      pointerEvents: progress >= 100 ? 'none' : 'auto',
    }}>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300,
        letterSpacing: '0.1em', color: 'rgba(200,149,108,0.6)', marginBottom: '24px',
      }}>entering the room</p>
      <div style={{
        width: '200px', height: '1px', background: 'rgba(200,160,120,0.08)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${progress}%`, background: 'rgba(200,160,120,0.25)',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.15em',
        color: 'rgba(200,149,108,0.15)', marginTop: '12px',
      }}>{progress}%</p>
    </div>
  );
}

// ========================================
// CENTERED INK WAVE — CSS only
// ========================================
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
    journal: 'write',
    lamp: 'notice warmth',
    clock: 'notice time',
    bookshelf: 'browse sessions',
    window: 'look outside',
    rhythmWall: 'explore rhythm',
    reflection: 'reflect',
    support: 'support',
    analysis: 'explore data',
    campus: 'campus pulse',
    suggestion: 'notice suggestion',
    door: 'open',
  };
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, calc(-50% + 30px))',
      pointerEvents: 'none', textAlign: 'center',
      background: 'rgba(0,0,0,0.4)', padding: '8px 20px', borderRadius: '4px',
      border: '1px solid rgba(200,149,108,0.15)',
    }}>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: '10px', letterSpacing: '0.25em',
        color: 'rgba(200,149,108,0.7)', textTransform: 'uppercase', margin: 0,
      }}>[E] {labels[hoveredObject] || hoveredObject}</p>
    </div>
  );
}

// ========================================
// WALL COMPASS — shows which wall you face
// ========================================
function WallCompass({ cameraRef }) {
  const [facing, setFacing] = useState('back');

  useEffect(() => {
    const interval = setInterval(() => {
      const cam = cameraRef?.current;
      if (!cam) return;
      const angle = cam.rotation.y % (Math.PI * 2);
      const a = angle < 0 ? angle + Math.PI * 2 : angle;
      if (a < Math.PI * 0.25 || a > Math.PI * 1.75) setFacing('front');
      else if (a < Math.PI * 0.75) setFacing('left');
      else if (a < Math.PI * 1.25) setFacing('back');
      else setFacing('right');
    }, 200);
    return () => clearInterval(interval);
  }, [cameraRef]);

  const wallNames = {
    front: 'Suggestion Wall',
    back: 'Rhythm Wall',
    left: 'Support Wall',
    right: 'Analysis Wall',
  };

  return (
    <div style={{
      position: 'absolute', bottom: '50px', left: '50%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none', textAlign: 'center',
    }}>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: '8px', letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'rgba(200,149,108,0.2)',
      }}>{wallNames[facing]}</p>
    </div>
  );
}

// ========================================
// CAMERA CAPTURE — passes camera to HUD outside Canvas
// ========================================
function CameraCapture({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);
  return null;
}

// ========================================
// MAIN MOOD ROOM — 360° with features on every wall
// ========================================
//
// LAYOUT:
//   FRONT (z=+3.5)  = Suggestion Wall  — SuggestionCard
//   BACK  (z=-3.5)  = Rhythm Wall      — RhythmWall + BookShelf
//   LEFT  (x=-4)    = Support Wall     — SupportDoor + ReflectionSpace
//   RIGHT (x=+4)    = Analysis Wall    — AnalysisDisplay + CampusPulse + Window
//   CENTER          = Writing Desk     — Desk + Journal + DeskLamp + Clock
//
export default function MoodRoom({ onWrite, onDashboard, onAnalysis, onReflection, onSupport }) {
  const hoveredObject = useGameStore((s) => s.hoveredObject);
  const analysis = useGameStore((s) => s.analysis);
  const insight = useGameStore((s) => s.insight);
  const campusData = useGameStore((s) => s.campusData);
  const sessions = useGameStore((s) => s.sessions);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const cameraRef = useRef(null);

  // Refs for interactable objects
  const journalRef = useRef();
  const lampRef = useRef();
  const clockRef = useRef();
  const bookshelfRef = useRef();
  const windowRef = useRef();
  const rhythmWallRef = useRef();
  const reflectionRef = useRef();
  const supportRef = useRef();
  const analysisRef = useRef();
  const campusRef = useRef();
  const suggestionRef = useRef();

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

  // Interactable definitions — generous distances
  const interactables = useMemo(() => [
    { id: 'journal', ref: journalRef, maxDistance: 5 },
    { id: 'lamp', ref: lampRef, maxDistance: 5 },
    { id: 'clock', ref: clockRef, maxDistance: 5 },
    { id: 'bookshelf', ref: bookshelfRef, maxDistance: 5 },
    { id: 'window', ref: windowRef, maxDistance: 5 },
    { id: 'rhythmWall', ref: rhythmWallRef, maxDistance: 5 },
    { id: 'reflection', ref: reflectionRef, maxDistance: 5 },
    { id: 'support', ref: supportRef, maxDistance: 5 },
    { id: 'analysis', ref: analysisRef, maxDistance: 5 },
    { id: 'campus', ref: campusRef, maxDistance: 5 },
    { id: 'suggestion', ref: suggestionRef, maxDistance: 5 },
  ], []);

  // E-key interaction — all features connected to correct pages
  const handleInteract = useCallback((objectId) => {
    switch (objectId) {
      case 'journal':    onWrite(); break;
      case 'lamp':       break; // decorative
      case 'clock':      break; // decorative
      case 'bookshelf':  onDashboard?.(); break;
      case 'window':     break; // decorative
      case 'rhythmWall': onDashboard?.(); break;
      case 'reflection': onReflection?.() || onDashboard?.(); break;
      case 'support':    onSupport?.() || onDashboard?.(); break;
      case 'analysis':   onAnalysis?.() || onDashboard?.(); break;
      case 'campus':     onDashboard?.(); break;
      case 'suggestion': onDashboard?.(); break;
      default: break;
    }
  }, [onWrite, onAnalysis, onReflection, onSupport, onDashboard]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1e1610', position: 'relative' }}>
      {loading && <LoadingScreen progress={loadProgress} />}

      <Canvas
        camera={{ position: [0, 1.6, 2], fov: 60, near: 0.1, far: 50 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', top: 0, left: 0 }}
        onCreated={() => setLoadProgress(100)}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#1e1610']} />
          <fog attach="fog" args={['#1e1610', 4, 16]} />

          <FirstPersonControls
            moveSpeed={2.8}
            friction={6}
            breathFrequency={0.4}
            breathAmplitude={0.008}
            initialPosition={[0, 1.6, 2]}
            bounds={{ minX: -3.5, maxX: 3.5, minZ: -3, maxZ: 3 }}
          />

          <CameraCapture cameraRef={cameraRef} />
          <Crosshair interactables={interactables} onInteract={handleInteract} />
          <MoodLighting />
          <RoomShell />

          {/* ========================================
              CENTER — Writing Desk
              ======================================== */}
          <Desk highlighted={false} />
          <Journal ref={journalRef} highlighted={hoveredObject === 'journal'} />
          <DeskLamp ref={lampRef} highlighted={hoveredObject === 'lamp'} />
          <WallClock ref={clockRef} highlighted={hoveredObject === 'clock'} />

          {/* ========================================
              BACK WALL (z = -3.5) — RHYTHM WALL
              Session history + BookShelf
              ======================================== */}
          <RhythmWall
            ref={rhythmWallRef}
            sessions={sessions}
            highlighted={hoveredObject === 'rhythmWall'}
          />
          <BookShelfRef
            ref={bookshelfRef}
            highlighted={hoveredObject === 'bookshelf'}
          />

          {/* ========================================
              LEFT WALL (x = -4) — SUPPORT WALL
              Counselling door + Reflection space
              ======================================== */}
          <SupportDoor
            ref={supportRef}
            highlighted={hoveredObject === 'support'}
          />
          <ReflectionSpace
            ref={reflectionRef}
            insight={insight}
            highlighted={hoveredObject === 'reflection'}
          />

          {/* ========================================
              RIGHT WALL (x = +4) — ANALYSIS WALL
              Data display + Campus Pulse + Window
              ======================================== */}
          <AnalysisDisplay
            ref={analysisRef}
            analysis={analysis}
            highlighted={hoveredObject === 'analysis'}
          />
          <CampusPulse
            ref={campusRef}
            campusData={campusData}
            highlighted={hoveredObject === 'campus'}
          />
          <Window ref={windowRef} highlighted={hoveredObject === 'window'} />

          {/* ========================================
              FRONT WALL (z = +3.5) — SUGGESTION WALL
              ======================================== */}
          <SuggestionCard
            ref={suggestionRef}
            suggestion={insight?.suggestion}
            highlighted={hoveredObject === 'suggestion'}
          />

          {/* ========================================
              DECOR
              ======================================== */}
          <FloatingPapers />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
      }}>
        <CenteredInkWave />
        <InteractionLabel hoveredObject={hoveredObject} />

        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 32px', pointerEvents: 'auto',
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '18px',
            fontWeight: 300, letterSpacing: '-0.02em', color: 'rgba(200,149,108,0.5)',
          }}>bhaav</span>
          <button onClick={onDashboard} style={{
            background: 'none', border: 'none', color: 'rgba(200,149,108,0.25)',
            fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', cursor: 'pointer', padding: '8px 0',
          }}>dashboard</button>
        </div>

        {/* Controls hint */}
        <div style={{
          position: 'absolute', bottom: '32px', left: 0, right: 0, textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: '8px', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(200,149,108,0.15)',
          }}>click to look · wasd to move · e to interact · esc to release</p>
        </div>

        {/* Wall indicator */}
        <WallCompass cameraRef={cameraRef} />
      </div>

      <style>{`
        @keyframes inkPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
