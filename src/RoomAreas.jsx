import { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from './gameStore';

// ========================================
// RHYTHM WALL — session history visualization
// ========================================
export const RhythmWall = forwardRef(function RhythmWall({ sessions = [], highlighted }, ref) {
  const linesRef = useRef();

  // Generate session lines from actual data
  const sessionLines = useMemo(() => {
    if (!sessions.length) {
      // Show placeholder marks
      return Array.from({ length: 3 }, (_, i) => ({
        id: i,
        width: 0.3 + Math.random() * 0.4,
        height: 0.15 + Math.random() * 0.15,
        y: -0.8 + i * 0.25,
        color: '#2a2520',
        label: `Session ${i + 1}`,
      }));
    }

    return sessions.slice(-8).map((session, i) => {
      const wpm = Number(session.wpm || 0);
      const pauses = Number(session.pause_frequency || 0);
      const backspace = Number(session.backspace_rate || 0);

      // Generate abstract line shape from metrics
      const lineWidth = Math.min(0.8, Math.max(0.2, wpm * 0.03));
      const lineHeight = 0.1 + pauses * 0.3;
      const irregularity = backspace * 0.5;

      return {
        id: session.id || i,
        width: lineWidth,
        height: lineHeight,
        y: -0.8 + i * 0.25,
        color: irregularity > 0.1 ? '#4a3a2a' : '#c8956c',
        label: `Session ${i + 1}`,
        wpm,
        pauses,
      };
    });
  }, [sessions]);

  return (
    <group ref={ref} position={[-2.9, 1.5, -1]}>
      {/* Wall panel */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.02, 2.5, 1.5]} />
        <meshStandardMaterial color="#0a0908" roughness={0.95} />
      </mesh>

      {/* Section label */}
      <Text
        position={[0.03, 1, 0]}
        fontSize={0.06}
        color="rgba(255,255,255,0.2)"
        anchorX="left"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        YOUR RHYTHM
      </Text>

      {/* Session lines */}
      {sessionLines.map((line, i) => (
        <group key={line.id} position={[0.03, line.y, 0]}>
          {/* Session mark — abstract line */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.01, line.height, line.width]} />
            <meshStandardMaterial
              color={line.color}
              emissive={line.color}
              emissiveIntensity={highlighted ? 0.3 : 0.1}
              roughness={0.7}
            />
          </mesh>

          {/* Small dot at the end */}
          <mesh position={[0, 0, line.width / 2 + 0.02]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[0.008, 16]} />
            <meshStandardMaterial
              color={line.color}
              emissive={line.color}
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      ))}

      {/* Interactive glow */}
      <pointLight
        position={[0.3, 0, 0.5]}
        color="#c8956c"
        intensity={highlighted ? 0.3 : 0.05}
        distance={2}
        decay={2}
      />
    </group>
  );
});

// ========================================
// REFLECTION SPACE — weekly insight display
// ========================================
export const ReflectionSpace = forwardRef(function ReflectionSpace({ insight, highlighted }, ref) {
  const textRef = useRef();

  useFrame((state) => {
    if (textRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 0.3) * 0.02 + 0.15;
      textRef.current.material.opacity = highlighted ? breathe + 0.1 : breathe;
    }
  });

  return (
    <group ref={ref} position={[2.5, 1.5, -1.5]}>
      {/* Floating panel */}
      <mesh ref={textRef} position={[0, 0, 0]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial
          color="#0a0908"
          transparent
          opacity={0.15}
          roughness={0.95}
        />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 0.25, 0.01]}
        fontSize={0.05}
        color="rgba(200,149,108,0.4)"
        anchorX="center"
        anchorY="middle"
        maxWidth={1}
      >
        WHAT WE NOTICED
      </Text>

      {/* Insight text */}
      {insight?.observation ? (
        <Text
          position={[0, -0.05, 0.01]}
          fontSize={0.04}
          color="rgba(255,255,255,0.25)"
          anchorX="center"
          anchorY="middle"
          maxWidth={1}
          lineHeight={1.5}
        >
          {insight.observation}
        </Text>
      ) : (
        <Text
          position={[0, -0.05, 0.01]}
          fontSize={0.035}
          color="rgba(255,255,255,0.12)"
          anchorX="center"
          anchorY="middle"
          maxWidth={1}
        >
          Bhaav is still learning your pattern.
        </Text>
      )}

      {/* Warm glow */}
      <pointLight
        position={[0, 0, 0.3]}
        color="#c8956c"
        intensity={highlighted ? 0.4 : 0.08}
        distance={2}
        decay={2}
      />
    </group>
  );
});

// ========================================
// SUPPORT ROOM — counseling access
// ========================================
export const SupportRoom = forwardRef(function SupportRoom({ highlighted }, ref) {
  const glowRef = useRef();

  useFrame((state) => {
    if (glowRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 0.25) * 0.05 + 0.15;
      glowRef.current.intensity = highlighted ? breathe + 0.1 : breathe;
    }
  });

  return (
    <group ref={ref} position={[-2, 1.2, 1]}>
      {/* Door frame */}
      <mesh>
        <boxGeometry args={[0.8, 1.8, 0.05]} />
        <meshStandardMaterial color="#121010" roughness={0.9} />
      </mesh>

      {/* Door panel */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.7, 1.7]} />
        <meshStandardMaterial
          color="#0e0c0a"
          roughness={0.85}
          emissive="#c8956c"
          emissiveIntensity={highlighted ? 0.15 : 0.03}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.6, 0.04]}
        fontSize={0.04}
        color="rgba(255,255,255,0.15)"
        anchorX="center"
        anchorY="middle"
      >
        SUPPORT
      </Text>

      {/* Warm glow from inside */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0.3]}
        color="#e8c080"
        intensity={0.15}
        distance={3}
        decay={2}
      />
    </group>
  );
});

// ========================================
// ANALYSIS ZONE — walk-through data
// ========================================
export const AnalysisZone = forwardRef(function AnalysisZone({ analysis, highlighted }, ref) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      if (child.userData?.float) {
        child.position.y = child.userData.baseY +
          Math.sin(state.clock.elapsedTime * 0.3 + i * 0.5) * 0.02;
      }
    });
  });

  const metrics = useMemo(() => {
    if (!analysis?.comparison) return [];
    const c = analysis.comparison;
    return [
      { label: 'TYPING SPEED', value: `${Number(c.wpm?.current || 0).toFixed(1)}`, unit: 'WPM', baseline: `${Number(c.wpm?.baseline || 0).toFixed(1)}` },
      { label: 'PAUSING', value: `${Number(c.pause_frequency?.current || 0).toFixed(1)}`, unit: '/min', baseline: `${Number(c.pause_frequency?.baseline || 0).toFixed(1)}` },
      { label: 'REVISING', value: `${Number((c.backspace_rate?.current || 0) * 100).toFixed(1)}`, unit: '%', baseline: `${Number((c.backspace_rate?.baseline || 0) * 100).toFixed(1)}` },
      { label: 'DEVIATION', value: `${Number(c.combined_z || 0).toFixed(2)}`, unit: '', baseline: '' },
    ];
  }, [analysis]);

  return (
    <group ref={ref} position={[0, 1.5, -1.8]}>
      <group ref={groupRef}>
        {/* Floating metrics */}
        {metrics.map((metric, i) => (
          <group
            key={metric.label}
            position={[-1.2 + i * 0.8, 0, 0]}
            userData={{ float: true, baseY: 0 }}
          >
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.035}
              color="rgba(200,149,108,0.3)"
              anchorX="center"
              anchorY="middle"
            >
              {metric.label}
            </Text>
            <Text
              position={[0, 0, 0]}
              fontSize={0.08}
              color="rgba(255,255,255,0.4)"
              anchorX="center"
              anchorY="middle"
            >
              {metric.value}
            </Text>
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.03}
              color="rgba(255,255,255,0.15)"
              anchorX="center"
              anchorY="middle"
            >
              {metric.unit} {metric.baseline ? `· baseline ${metric.baseline}` : ''}
            </Text>
          </group>
        ))}
      </group>

      {/* Ambient glow */}
      <pointLight
        position={[0, 0, 0.5]}
        color="#4a7a8a"
        intensity={highlighted ? 0.3 : 0.08}
        distance={3}
        decay={2}
      />
    </group>
  );
});

// ========================================
// CAMPUS PULSE — institutional view
// ========================================
export const CampusPulse = forwardRef(function CampusPulse({ campusData, highlighted }, ref) {
  const glowRef = useRef();

  useFrame((state) => {
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.4) * 0.1 + 0.2;
      glowRef.current.intensity = highlighted ? pulse + 0.15 : pulse;
    }
  });

  const hasData = campusData && !campusData.insufficient_data;

  return (
    <group ref={ref} position={[2.5, 1.2, 1]}>
      {/* Terminal/screen */}
      <mesh>
        <boxGeometry args={[0.6, 0.4, 0.04]} />
        <meshStandardMaterial color="#0a0908" roughness={0.9} />
      </mesh>

      {/* Screen content */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.55, 0.35]} />
        <meshStandardMaterial
          color={hasData ? '#0a1628' : '#0a0908'}
          emissive={hasData ? '#4a7a8a' : '#1a1816'}
          emissiveIntensity={highlighted ? 0.4 : 0.15}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.3, 0.03]}
        fontSize={0.035}
        color="rgba(255,255,255,0.15)"
        anchorX="center"
        anchorY="middle"
      >
        CAMPUS PULSE
      </Text>

      {hasData ? (
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.06}
          color="rgba(74,122,138,0.5)"
          anchorX="center"
          anchorY="middle"
        >
          {campusData.participant_count} participants
        </Text>
      ) : (
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.03}
          color="rgba(255,255,255,0.1)"
          anchorX="center"
          anchorY="middle"
        >
          PRIVACY THRESHOLD NOT MET
        </Text>
      )}

      <pointLight ref={glowRef} position={[0, 0, 0.2]} color="#4a7a8a" intensity={0.2} distance={2} decay={2} />
    </group>
  );
});

// ========================================
// SUGGESTION OBJECT — floating paper
// ========================================
export const SuggestionObject = forwardRef(function SuggestionObject({ suggestion, highlighted }, ref) {
  const paperRef = useRef();

  useFrame((state) => {
    if (paperRef.current) {
      paperRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
      paperRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  if (!suggestion) return null;

  return (
    <group ref={ref} position={[1.5, 1.0, -0.5]}>
      <group ref={paperRef}>
        {/* Floating paper */}
        <mesh>
          <planeGeometry args={[0.15, 0.2]} />
          <meshStandardMaterial
            color="#1a1816"
            emissive="#c8956c"
            emissiveIntensity={highlighted ? 0.4 : 0.1}
            roughness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Text on paper */}
        <Text
          position={[0, 0, 0.005]}
          fontSize={0.015}
          color="rgba(200,149,108,0.3)"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.12}
          lineHeight={1.3}
        >
          {suggestion}
        </Text>
      </group>

      <pointLight
        position={[0, 0, 0.1]}
        color="#c8956c"
        intensity={highlighted ? 0.3 : 0.05}
        distance={1.5}
        decay={2}
      />
    </group>
  );
});

// ========================================
// SESSION MEMORY MARKS — room evolution
// ========================================
export function SessionMemory({ sessionCount = 0 }) {
  const marks = useMemo(() => {
    return Array.from({ length: Math.min(sessionCount, 12) }, (_, i) => ({
      id: i,
      x: -2.8 + Math.random() * 0.2,
      y: 0.5 + Math.random() * 2,
      z: -1.5 + Math.random() * 3,
      size: 0.02 + Math.random() * 0.03,
      color: new THREE.Color().setHSL(
        0.08 + Math.random() * 0.05,
        0.3 + Math.random() * 0.2,
        0.2 + Math.random() * 0.1
      ),
    }));
  }, [sessionCount]);

  return (
    <group>
      {marks.map((mark) => (
        <mesh key={mark.id} position={[mark.x, mark.y, mark.z]}>
          <sphereGeometry args={[mark.size, 8, 8]} />
          <meshStandardMaterial
            color={mark.color}
            emissive={mark.color}
            emissiveIntensity={0.3}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
