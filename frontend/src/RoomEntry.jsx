import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RoomEntry — the landing screen.
 *
 * PERFORMANCE: Removed the 3D Canvas entirely. The previous version rendered
 * a Three.js scene with Drei Text (loading a remote font) just for the
 * entry screen. This caused a 3-5 second black screen while WebGL + font
 * loaded. Now: pure HTML/CSS with fast framer-motion animations.
 */
export default function RoomEntry({ onBegin }) {
  const [beginVisible, setBeginVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    // Begin button appears after 1.5s — content is visible immediately
    const t = setTimeout(() => setBeginVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleBegin = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => onBegin(), 1200);
  }, [transitioning, onBegin]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>

      {/* Bhaav Title — appears immediately, fast fade-in */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.6, 0.05, -0.01, 0.9] }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(80px, 13vw, 170px)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: '#fff',
          position: 'absolute',
          top: '18%',
          left: 0,
          right: 0,
          textAlign: 'center',
          lineHeight: 0.85,
          margin: 0,
        }}
      >
        Bhaav
      </motion.h1>

      {/* Ink Line — lightweight SVG, no 3D */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2, delay: 0.3 }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(700px, 85vw)', height: '120px',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 900 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M 0 50 C 80 25, 160 75, 250 50 C 340 25, 420 75, 500 50 C 580 25, 660 75, 750 50 C 830 25, 880 75, 900 50"
            fill="none" stroke="#c8956c" strokeWidth="1.2" strokeLinecap="round"
          />
          <path
            d="M 0 50 C 100 35, 180 65, 280 48 C 380 31, 460 69, 560 50 C 660 31, 740 69, 900 50"
            fill="none" stroke="#4a7a8a" strokeWidth="0.6" strokeLinecap="round" opacity="0.4"
          />
        </svg>
      </motion.div>

      {/* Sub-headline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '8px',
          fontWeight: 400,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          position: 'absolute',
          bottom: '5vh',
          left: 0,
          right: 0,
          textAlign: 'center',
          margin: 0,
        }}
      >
        a quiet space to notice
      </motion.p>

      {/* [ Begin ] trigger */}
      <AnimatePresence>
        {beginVisible && !transitioning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] }}
            onClick={handleBegin}
            whileHover={{ scale: 1.02, opacity: 0.55 }}
            whileTap={{ scale: 0.98 }}
            style={{
              position: 'absolute',
              bottom: '14vh',
              left: 0,
              right: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '14px 30px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '9px',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: '#fff',
              outline: 'none',
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
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              background: '#000', zIndex: 20,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
