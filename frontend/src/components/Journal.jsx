import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { submitSession } from "../services/api";

/**
 * Journal — A warm, private writing space.
 * Captures keystroke behavior while you write freely.
 * Shows a gentle rhythm visualizer in real-time.
 */

export default function Journal({ userId, onDone }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const keystrokes = useRef([]);
  const startTime = useRef(null);
  const textareaRef = useRef(null);
  const intervalRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (!startTime.current) {
      startTime.current = Date.now();
      setStarted(true);
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);
    }
    keystrokes.current.push({
      key_type: e.key === "Backspace" ? "backspace" : e.key === " " ? "space" : "key",
      timestamp: Date.now(),
    });
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleSubmit = async () => {
    if (text.trim().length < 5 || submitting) return;
    setSubmitting(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Add final keystroke
    keystrokes.current.push({ key_type: "end", timestamp: Date.now() });

    const sessionId = `session-${Date.now()}`;
    const sessionData = {
      user_id: userId,
      session_id: sessionId,
      start_ts: startTime.current || Date.now(),
      end_ts: Date.now(),
      keystroke_events: keystrokes.current,
    };

    try {
      const result = await submitSession(sessionData);
      onDone(result);
    } catch (err) {
      console.error(err);
      // Still proceed to dashboard
      onDone({ features: {}, baseline_available: false });
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col px-5 md:px-16 py-12 md:py-20"
      style={{ background: "#F6F3EE" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full mb-10">
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "0.75rem" }}>
          Your journal
        </p>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#1C1B1A", marginBottom: "0.5rem" }}>
          Just write. We'll watch the rhythm.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "#7A756E" }}>
          Don't think about it — just type naturally. We're listening to how you type, not what you type.
        </p>
      </div>

      {/* Writing area */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        <div className="relative flex-1" style={{ minHeight: "300px" }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing here..."
            className="w-full h-full resize-none outline-none"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
              lineHeight: 1.9,
              color: "#3D3A36",
              background: "transparent",
              border: "none",
              padding: "0",
              minHeight: "300px",
            }}
          />
          {/* Rhythm line */}
          {started && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: "linear-gradient(90deg, #2B3A67, #1A7A6D, #4A7FB5)" }}
              initial={{ scaleX: 0, transformOrigin: "left" }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-8 pb-8">
          <div className="flex items-center gap-4">
            {started && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#B0AAA2" }}
              >
                {formatTime(elapsed)}
              </motion.span>
            )}
            {started && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#B0AAA2" }}
              >
                {keystrokes.current.length} keystrokes
              </motion.span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={text.trim().length < 5 || submitting}
            className="px-8 py-3 rounded-full cursor-pointer transition-all duration-300"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: text.trim().length >= 5 && !submitting ? "#FAF7F2" : "#B0AAA2",
              background: text.trim().length >= 5 && !submitting ? "#2B3A67" : "#E5E0D8",
              border: "none",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Analyzing..." : "Done writing"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
