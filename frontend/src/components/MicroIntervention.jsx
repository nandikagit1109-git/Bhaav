import { useState } from "react";

/**
 * MicroIntervention — Gentle breathing exercise or grounding question.
 * Shows when deviation is high. Non-intrusive, optional.
 */

const BREATHING_PHASES = [
  { label: "Breathe in", duration: 4 },
  { label: "Hold", duration: 4 },
  { label: "Breathe out", duration: 6 },
];

const GROUNDING_QUESTIONS = [
  "Name one thing that's okay right now — no need to write it down.",
  "What's one small thing you can see from where you are?",
  "Feel your feet on the ground. What does that feel like?",
  "What's one sound you can hear right now?",
];

export default function MicroIntervention({ onDismiss }) {
  const [mode, setMode] = useState(null); // 'breathe' | 'ground' | null
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathSize, setBreathSize] = useState(1);

  const startBreathing = () => {
    setMode("breathe");
    let phase = 0;
    const cycle = () => {
      setBreathPhase(phase % 3);
      const size = phase % 3 === 0 ? 1.3 : phase % 3 === 1 ? 1.3 : 1;
      setBreathSize(size);
      phase++;
      setTimeout(cycle, BREATHING_PHASES[phase % 3].duration * 1000);
    };
    cycle();
  };

  const startGrounding = () => setMode("ground");

  if (mode === "breathe") {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "#FAF7F2", border: "1px solid #E5E0D8" }}>
        <div
          className="mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            width: "120px", height: "120px",
            background: "linear-gradient(135deg, rgba(43,58,103,0.06), rgba(26,122,109,0.06))",
            transform: `scale(${breathSize})`,
            transition: `transform ${BREATHING_PHASES[breathPhase].duration}s ease-in-out`,
          }}
        >
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "0.85rem", color: "#2B3A67" }}>
            {BREATHING_PHASES[breathPhase].label}
          </span>
        </div>
        <button onClick={() => { setMode(null); onDismiss(); }} className="cursor-pointer" style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#B0AAA2" }}>
          done
        </button>
      </div>
    );
  }

  if (mode === "ground") {
    const q = GROUNDING_QUESTIONS[Math.floor(Math.random() * GROUNDING_QUESTIONS.length)];
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "#FAF7F2", border: "1px solid #E5E0D8" }}>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "1.05rem", color: "#1C1B1A", lineHeight: 1.6, maxWidth: "32ch", margin: "0 auto 1.5rem" }}>
          {q}
        </p>
        <button onClick={() => { setMode(null); onDismiss(); }} className="cursor-pointer" style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#B0AAA2" }}>
          done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: "#FAF7F2", border: "1px solid #E5E0D8" }}>
      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "0.95rem", color: "#1C1B1A", marginBottom: "1rem" }}>
        Your rhythm is a little off today. Want to take a moment?
      </p>
      <div className="flex gap-3 flex-wrap">
        <button onClick={startBreathing} className="px-5 py-2.5 rounded-full cursor-pointer transition-all" style={{ background: "linear-gradient(135deg, #2B3A67, #1A7A6D)", color: "#FAF7F2", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 400, letterSpacing: "0.1em" }}>
          60-second breathe
        </button>
        <button onClick={startGrounding} className="px-5 py-2.5 rounded-full cursor-pointer transition-all" style={{ background: "transparent", color: "#7A756E", border: "1px solid #E5E0D8", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 400, letterSpacing: "0.1em" }}>
          Grounding question
        </button>
        <button onClick={onDismiss} className="px-5 py-2.5 rounded-full cursor-pointer transition-all" style={{ background: "transparent", color: "#D5D0C8", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem" }}>
          not now
        </button>
      </div>
    </div>
  );
}
