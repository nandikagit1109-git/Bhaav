import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import InkCloud from './InkCloud.jsx';

function Title3D() {
  return (
    <Text
      position={[0, 1.8, 0]}
      fontSize={1.2}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      font="https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjQAllvuQWJ5heb_w.woff2"
      letterSpacing={0.15}
    >
      Bhaav
    </Text>
  );
}

function SubTitle3D() {
  return (
    <Text
      position={[0, -2.5, 0]}
      fontSize={0.12}
      color="rgba(255,255,255,0.3)"
      anchorX="center"
      anchorY="middle"
      font="https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjQAllvuQWJ5heb_w.woff2"
      letterSpacing={0.4}
    >
      a quiet space to notice
    </Text>
  );
}

function Entry3D() {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 3, 12]} />
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 3, 2]} intensity={0.15} color="#4a6fa5" />
      <Title3D />
      <SubTitle3D />
    </>
  );
}

export default function RoomEntry({ onBegin }) {
  const [titleVisible, setTitleVisible] = useState(false);
  const [subVisible, setSubVisible] = useState(false);
  const [beginVisible, setBeginVisible] = useState(false);
  const [beginHovered, setBeginHovered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 500);
    const t2 = setTimeout(() => setSubVisible(true), 2500);
    const t3 = setTimeout(() => setBeginVisible(true), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleBegin = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => onBegin(), 2500);
  }, [transitioning, onBegin]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ position: 'absolute', top: 0, left: 0 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Entry3D />
        </Suspense>
      </Canvas>

      {/* HTML Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Bhaav Title */}
        <AnimatePresence>
          {titleVisible && (
            <motion.h1
              initial={{ filter: 'blur(12px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(80px, 13vw, 170px)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                color: '#fff',
                position: 'absolute',
                top: '18%',
                textAlign: 'center',
                lineHeight: 0.85,
              }}
            >
              Bhaav
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Ink Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.5, ease: [0.6, 0.05, -0.01, 0.9] }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(900px, 92vw)',
            height: 'min(500px, 55vh)',
            pointerEvents: 'none',
          }}
        >
          <InkCloud
            typingSpeed={0.5}
            backspaceRate={0.1}
            pauseFrequency={0.3}
            active={false}
          />
        </motion.div>

        {/* Sub-headline */}
        <AnimatePresence>
          {subVisible && (
            <motion.p
              initial={{ filter: 'blur(8px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '8px',
                fontWeight: 400,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#fff',
                position: 'absolute',
                bottom: '5vh',
                textAlign: 'center',
              }}
            >
              a quiet space to notice
            </motion.p>
          )}
        </AnimatePresence>

        {/* [ Begin ] trigger */}
        <AnimatePresence>
          {beginVisible && !transitioning && (
            <motion.button
              initial={{ filter: 'blur(8px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay: 0, ease: [0.6, 0.05, -0.01, 0.9] }}
              onClick={handleBegin}
              onMouseEnter={() => setBeginHovered(true)}
              onMouseLeave={() => setBeginHovered(false)}
              whileHover={{ scale: 1.02, opacity: 0.55 }}
              whileTap={{ scale: 0.98 }}
              style={{
                position: 'absolute',
                bottom: '14vh',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '14px 30px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '9px',
                fontWeight: 400,
                letterSpacing: beginHovered ? '0.28em' : '0.12em',
                color: '#fff',
                transition: 'letter-spacing 0.6s ease',
                outline: 'none',
                pointerEvents: 'auto',
                zIndex: 10,
              }}
            >
              [ Begin ]
            </motion.button>
          )}
        </AnimatePresence>

        {/* Transition overlay */}
        <AnimatePresence>
          {transitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#000',
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
