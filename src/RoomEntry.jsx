import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RoomEntry — warm, inviting, home-like landing screen.
 * Pure HTML/CSS with gentle animations. No 3D.
 */
export default function RoomEntry({ onBegin }) {
  const [beginVisible, setBeginVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBeginVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleBegin = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => onBegin(), 1000);
  }, [transitioning, onBegin]);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #0f0b08 0%, #1a1410 30%, #221a12 60%, #1a1410 100%)',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Warm ambient glow — top center (ceiling lamp feel) */}
      <div style={{
        position: 'absolute', top: '-15%', left: '25%',
        width: '50%', height: '55%',
        background: 'radial-gradient(ellipse, rgba(240,200,122,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Warm ambient glow — center (desk lamp feel) */}
      <div style={{
        position: 'absolute', top: '40%', left: '15%',
        width: '70%', height: '35%',
        background: 'radial-gradient(ellipse, rgba(200,149,108,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle warm gradient band at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(to top, rgba(200,149,108,0.04) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Bhaav Title — warm cream */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(80px, 13vw, 170px)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: '#f0e6d8',
          position: 'absolute',
          top: '18%',
          left: 0, right: 0,
          textAlign: 'center',
          lineHeight: 0.85,
          margin: 0,
        }}
      >
        Bhaav
      </motion.h1>

      {/* Tagline — warm, inviting */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.4, ease: [0.6, 0.05, 0.01, 0.9] }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(16px, 2.5vw, 24px)',
          fontWeight: 300,
          letterSpacing: '0.04em',
          color: 'rgba(200,160,120,0.5)',
          position: 'absolute',
          top: '35%',
          left: 0, right: 0,
          textAlign: 'center',
          margin: 0,
        }}
      >
        a private space for your writing rhythm
      </motion.p>

      {/* Ink Line — warm amber */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2.5, delay: 0.3 }}
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
            fill="none" stroke="#d4a870" strokeWidth="0.6" strokeLinecap="round" opacity="0.35"
          />
        </svg>
      </motion.div>

      {/* Bottom message — warm and welcoming */}
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
          color: 'rgba(200,160,120,0.4)',
          position: 'absolute',
          bottom: '8vh',
          left: 0, right: 0,
          textAlign: 'center',
          margin: 0,
        }}
      >
        your words stay private · only your rhythm is observed
      </motion.p>

      {/* [ Begin ] — warm amber text */}
      <AnimatePresence>
        {beginVisible && !transitioning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
            onClick={handleBegin}
            whileHover={{ scale: 1.02, opacity: 0.6 }}
            whileTap={{ scale: 0.98 }}
            style={{
              position: 'absolute',
              bottom: '14vh',
              left: 0, right: 0,
              background: 'none',
              border: '1px solid rgba(200,149,108,0.3)',
              borderRadius: '100px',
              cursor: 'pointer',
              padding: '14px 40px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '9px',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: '#c8956c',
              outline: 'none',
              margin: '0 auto',
              display: 'block',
              width: 'fit-content',
            }}
          >
            [ begin ]
          </motion.button>
        )}
      </AnimatePresence>

      {/* Transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              background: '#0f0b08', zIndex: 20,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
