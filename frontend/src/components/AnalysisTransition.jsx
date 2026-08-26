import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * AnalysisTransition — A quiet, elegant moment while the insight is prepared.
 * Words appear one at a time, each in its own color.
 */

const STEPS = [
  { text: "Rhythm", color: "#2B3A67" },
  { text: "Pattern", color: "#1A7A6D" },
  { text: "Baseline", color: "#C17B3A" },
  { text: "Insight", color: "#7B6FA0" },
];

export default function AnalysisTransition({ onComplete }) {
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setCurrent(i), (i + 1) * 1200)
    );
    const done = setTimeout(() => onComplete(), STEPS.length * 1200 + 800);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onComplete]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "#F6F3EE" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <AnimatePresence>
          {STEPS.map((step, i) => (
            i <= current && (
              <motion.div
                key={step.text}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="mb-3"
              >
                <span style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontStyle: "italic",
                  color: step.color,
                }}>
                  {step.text}
                </span>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {current >= STEPS.length - 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "#B0AAA2" }}
          >
            preparing your insight...
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
