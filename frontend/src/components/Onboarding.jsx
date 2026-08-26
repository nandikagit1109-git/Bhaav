import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { updatePreferences } from "../services/api";

/**
 * Onboarding — Choose your support level.
 * Cards float in 3D space, responding to mouse movement with parallax.
 * Each card has its own color and idle animation.
 */

const LEVELS = [
  { id: 1, icon: "👁", label: "Just awareness", desc: "Trend line + deviation score. Purely observational — no suggestions or interventions.", color: "#2B3A67" },
  { id: 2, icon: "💡", label: "Insights", desc: "Weekly suggestions and a breathing card when things feel off. Gentle nudges, nothing pushy.", color: "#1A7A6D" },
  { id: 3, icon: "🤝", label: "Connect", desc: "Everything above, plus a one-tap reach-out to someone you trust when patterns shift.", color: "#C17B3A" },
  { id: 4, icon: "💬", label: "Companion", desc: "All features plus a warm AI companion who listens and reflects — never diagnoses.", color: "#7B6FA0" },
];

export default function Onboarding({ onComplete }) {
  const [selected, setSelected] = useState(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const sceneRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  // Touch support
  const handleTouchMove = useCallback((e) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setMouse({
      x: (touch.clientX - rect.left) / rect.width,
      y: (touch.clientY - rect.top) / rect.height,
    });
  }, []);

  const handleContinue = async () => {
    if (!selected) return;
    try {
      await updatePreferences("demo-user", { support_level: selected, onboarding_complete: true });
    } catch {}
    onComplete(selected);
  };

  const tiltX = (mouse.y - 0.5) * 8;
  const tiltY = (mouse.x - 0.5) * -8;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-5 overflow-hidden"
      style={{ background: "#F6F3EE", perspective: "1200px" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      ref={sceneRef}
    >
      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "1rem" }}>
          Welcome to Bhaav
        </p>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", color: "#1C1B1A", marginBottom: "0.5rem" }}>
          How much support do you want?
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "#B0AAA2" }}>
          You can change this anytime — there's no wrong choice.
        </p>
      </div>

      {/* 3D Scene */}
      <div
        className="relative w-full max-w-lg mx-auto"
        style={{
          height: "340px",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: "transform 0.15s ease-out",
        }}
      >
        {LEVELS.map((level, i) => {
          // Position cards in a loose orbital arrangement
          const angle = (i / LEVELS.length) * Math.PI * 2 + Date.now() * 0.0001;
          const radius = 120;
          const baseX = Math.cos(angle + i * 1.5) * radius * 0.6;
          const baseY = (i - 1.5) * 70; // Spread vertically
          const baseZ = Math.sin(angle + i * 1.5) * radius * 0.3;

          // Mouse influence (parallax)
          const px = baseX + (mouse.x - 0.5) * 30 * (1 + i * 0.2);
          const py = baseY + (mouse.y - 0.5) * 20 * (1 + i * 0.15);

          // Depth-based sizing and opacity
          const depth = (baseZ + radius) / (radius * 2); // 0 = far, 1 = near
          const scale = 0.75 + depth * 0.25;
          const opacity = 0.3 + depth * 0.7;
          const isSelected = selected === level.id;

          return (
            <motion.div
              key={level.id}
              className="absolute cursor-pointer"
              style={{
                left: "50%",
                top: "50%",
                width: "140px",
                height: "140px",
                marginLeft: "-70px",
                marginTop: "-70px",
                transform: `translate3d(${px}px, ${py}px, ${baseZ}px) scale(${scale})`,
                opacity,
                zIndex: Math.round(depth * 10),
                transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
              }}
              onClick={() => setSelected(level.id)}
              whileHover={{ scale: scale * 1.05 }}
              whileTap={{ scale: scale * 0.95 }}
            >
              <div
                className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300"
                style={{
                  background: isSelected ? `${level.color}10` : "#FAF7F2",
                  border: `2px solid ${isSelected ? level.color : "#E5E0D8"}`,
                  boxShadow: isSelected
                    ? `0 4px 24px ${level.color}15, 0 0 0 1px ${level.color}20`
                    : "0 2px 8px rgba(0,0,0,0.03)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span style={{ fontSize: "2rem" }}>{level.icon}</span>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  color: isSelected ? level.color : "#7A756E",
                  letterSpacing: "0.05em",
                  textAlign: "center",
                  padding: "0 0.5rem",
                }}>
                  {level.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Description + Continue */}
      <div className="text-center mt-8 relative z-10 min-h-[100px]">
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#7A756E", maxWidth: "36ch", lineHeight: 1.7, margin: "0 auto 1.5rem" }}>
              {LEVELS.find((l) => l.id === selected)?.desc}
            </p>
            <button
              onClick={handleContinue}
              className="px-10 py-3.5 rounded-full cursor-pointer transition-all duration-300"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#FAF7F2",
                background: LEVELS.find((l) => l.id === selected)?.color || "#2B3A67",
                border: "none",
              }}
            >
              Continue
            </button>
          </motion.div>
        )}
        {!selected && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#B0AAA2" }}>
            tap a card to choose
          </p>
        )}
      </div>
    </motion.div>
  );
}
