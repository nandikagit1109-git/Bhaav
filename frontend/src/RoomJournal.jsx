import { useRef, useEffect, useState } from 'react';
import InkLine from './InkLine.jsx';

/**
 * RoomJournal — the writing screen.
 *
 * PERFORMANCE: No 3D canvas here. The previous version rendered a full
 * Three.js scene (RoomShell, Desk, Chair, FloatingPapers, BookShelf,
 * Window, 300 DustParticles with per-frame useFrame) behind the textarea.
 * That caused severe lag during typing because the GPU and CPU were busy
 * rendering 50+ meshes + updating 300 particle positions every frame
 * while the user tried to type.
 *
 * Now: pure CSS + a lightweight SVG ink line. Zero GPU workload.
 */
export default function RoomJournal({ text, setText, onKeyDown, onEnd, savingSession, message, liveMetrics }) {
  const textareaRef = useRef(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Session timer — lightweight, updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const minutes = Math.floor(sessionDuration / 60);
  const seconds = sessionDuration % 60;
  const durationStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px',
        position: 'relative',
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: 'rgba(255,255,255,0.4)',
        }}>bhaav</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Recording indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Inter', sans-serif", fontSize: '8px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
          }}>
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: savingSession ? 'rgba(255,200,100,0.5)' : 'rgba(100,200,100,0.5)',
              animation: savingSession ? 'none' : 'pulse 2s ease-in-out infinite',
            }} />
            {savingSession ? 'saving' : 'recording'}
          </div>

          {/* Session duration */}
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: '9px',
            letterSpacing: '0.1em', color: 'rgba(255,255,255,0.15)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {durationStr}
          </span>
        </div>
      </div>

      {/* Writing area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8vw',
        position: 'relative',
        zIndex: 2,
      }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Begin wherever you are."
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

      {/* Ink line — lightweight SVG, no 3D */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(760px, 90vw)',
        height: '80px',
        zIndex: 1,
      }}>
        <InkLine active={!savingSession} liveMetrics={liveMetrics} />
      </div>

      {/* Bottom controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 32px 24px',
        gap: '24px',
        position: 'relative',
        zIndex: 2,
      }}>
        <button
          onClick={onEnd}
          disabled={savingSession}
          style={{
            background: 'none',
            border: 'none',
            color: savingSession ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: savingSession ? 'default' : 'pointer',
            padding: '12px 24px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => { if (!savingSession) e.target.style.color = 'rgba(255,255,255,0.5)'; }}
          onMouseLeave={(e) => { if (!savingSession) e.target.style.color = 'rgba(255,255,255,0.3)'; }}
        >
          {savingSession ? 'observing your rhythm...' : 'finish'}
        </button>
      </div>

      {/* Privacy indicator */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: '8px',
          letterSpacing: '0.12em', color: 'rgba(255,255,255,0.08)',
        }}>
          🔒 your words stay private
        </span>
      </div>

      {/* Status message */}
      {message && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 2,
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.2)',
          }}>
            {message}
          </p>
        </div>
      )}

      {/* Subtle CSS animation for recording dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
