import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

/**
 * Intro — The first thing you see.
 * Warm, human, organic. Like a personal letter, not a tech product.
 */

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.9s cubic-bezier(0.25,0.1,0.25,1) ${delay}s, transform 0.9s cubic-bezier(0.25,0.1,0.25,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function Intro({ onBegin }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 2200); return () => clearTimeout(t); }, []);

  return (
    <motion.div
      className="min-h-screen bg-paper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden px-5 md:px-16">
        {/* Soft ambient blobs */}
        <div className="absolute top-[8%] right-[-8%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(43,58,103,0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-[10%] left-[-12%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(26,122,109,0.04) 0%, transparent 60%)", filter: "blur(80px)" }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(193,123,58,0.03) 0%, transparent 60%)", filter: "blur(100px)" }} />

        <div className="max-w-4xl mx-auto w-full relative z-10">
          {/* Tag */}
          <motion.p
            className="mb-8"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7A756E" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
          >
            Bhaav
          </motion.p>

          {/* Headline */}
          <motion.h1
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(2.5rem, 7vw, 5.5rem)", lineHeight: 1.05, letterSpacing: "-0.025em", color: "#1C1B1A", maxWidth: "12ch", marginBottom: "2.5rem" }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Write normally. We'll listen to your{" "}
            <em style={{ fontStyle: "italic", background: "linear-gradient(135deg, #2B3A67, #1A7A6D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>hands</em>.
          </motion.h1>

          {/* Ink line */}
          <motion.div className="w-full max-w-4xl mb-8" style={{ padding: "1rem 0 2rem" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.2 }}
          >
            <svg className="w-full" style={{ height: "clamp(32px, 6vw, 60px)", overflow: "visible" }} viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="inkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2B3A67" />
                  <stop offset="30%" stopColor="#4A7FB5" />
                  <stop offset="55%" stopColor="#1A7A6D" />
                  <stop offset="80%" stopColor="#7B6FA0" />
                  <stop offset="100%" stopColor="#2B3A67" />
                </linearGradient>
              </defs>
              <path
                d="M 0,30 C 40,30 60,28 100,28 C 140,28 160,30 200,32 C 240,34 260,30 300,28 C 340,26 360,30 400,32 C 440,34 460,28 500,24 C 520,22 540,18 560,14 C 570,12 580,14 590,18 C 600,22 610,30 620,34 C 630,38 640,36 650,30 C 660,24 670,18 680,16 C 690,14 700,16 710,20 C 720,24 730,28 750,30 C 770,32 790,30 820,28 C 850,26 880,28 920,30 C 960,32 980,30 1020,30 C 1060,30 1080,28 1120,28 C 1160,28 1180,30 1200,30"
                fill="none" stroke="url(#inkGrad)" strokeWidth="1.5" strokeLinecap="round"
                style={{ strokeDasharray: 1600, strokeDashoffset: 1600, animation: "draw-line 3s cubic-bezier(0.25,0.1,0.25,1) 1.5s forwards" }}
              />
            </svg>
          </motion.div>

          {/* Subtext */}
          <motion.p
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "clamp(0.85rem, 1.3vw, 1rem)", color: "#7A756E", maxWidth: "38ch", lineHeight: 1.75 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 2.0 }}
          >
            Bhaav watches how you type — the pauses, the rhythm, the hesitations — and builds a quiet picture of your pattern over time.{" "}
            <span style={{ color: "#2B3A67", fontWeight: 400 }}>It never reads what you write.</span>
          </motion.p>
        </div>

        {/* Begin button */}
        <div className="flex flex-col items-center pb-12 relative z-10 mt-12">
          <motion.button
            onClick={onBegin}
            className="group relative px-12 py-4 cursor-pointer"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 400, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2B3A67", border: "1px solid rgba(43,58,103,0.2)", borderRadius: "9999px", background: "transparent", transition: "all 0.4s ease" }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 10 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(43,58,103,0.06)" }}
            whileTap={{ scale: 0.97 }}
          >
            Begin
          </motion.button>
          <motion.p className="mt-5" style={{ color: "#B0AAA2", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0 }} animate={{ opacity: ready ? 0.5 : 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          >
            or scroll
          </motion.p>
        </div>
      </section>

      {/* ─── PATTERN PREVIEW ─────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center px-5 md:px-16 py-24" style={{ background: "#FAF7F2" }}>
        <FadeIn>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7A756E", marginBottom: "1rem" }}>
            Something shifts
          </p>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.15, color: "#1C1B1A", marginBottom: "0.75rem" }}>
            It notices what you don't.
          </h2>
          <p style={{ fontWeight: 300, fontSize: "0.9rem", color: "#7A756E", maxWidth: "44ch", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Each point below is one writing session — compared to your own rhythm. The bump means something shifted in how you typed that day.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="rounded-2xl p-6 md:p-8" style={{ background: "#FAF7F2", border: "1px solid #E5E0D8", boxShadow: "0 1px 8px rgba(0,0,0,0.02)" }}>
            <div className="flex justify-between items-baseline mb-4 flex-wrap gap-2">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B0AAA2" }}>
                Deviation from your usual rhythm
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "#4A7FB5" }}>1.42</p>
            </div>
            <svg viewBox="0 0 700 180" className="w-full h-auto">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(43,58,103,0.06)" />
                  <stop offset="100%" stopColor="rgba(43,58,103,0)" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B0AAA2" />
                  <stop offset="30%" stopColor="#2B3A67" />
                  <stop offset="60%" stopColor="#4A7FB5" />
                  <stop offset="100%" stopColor="#B5533C" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="50" y1="30" x2="660" y2="30" stroke="#E5E0D8" strokeWidth="0.5" />
              <line x1="50" y1="80" x2="660" y2="80" stroke="#E5E0D8" strokeWidth="0.5" />
              <line x1="50" y1="130" x2="660" y2="130" stroke="#E5E0D8" strokeWidth="0.5" />
              {/* Baseline */}
              <line x1="50" y1="110" x2="660" y2="110" stroke="rgba(43,58,103,0.06)" strokeDasharray="4 4" />
              <text x="665" y="113" fill="#B0AAA2" fontSize="8" fontFamily="JetBrains Mono, monospace">baseline</text>
              {/* Area */}
              <path d="M 70,110 C 110,110 140,108 180,107 C 220,106 250,109 290,110 C 330,111 360,107 400,105 C 430,103 450,95 480,75 C 500,65 510,55 530,50 C 545,47 555,55 570,70 C 585,85 600,100 620,107 C 640,110 660,110 680,110 L 680,130 L 70,130 Z" fill="url(#areaGrad)" />
              {/* Line */}
              <path d="M 70,110 C 110,110 140,108 180,107 C 220,106 250,109 290,110 C 330,111 360,107 400,105 C 430,103 450,95 480,75 C 500,65 510,55 530,50 C 545,47 555,55 570,70 C 585,85 600,100 620,107 C 640,110 660,110 680,110" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" />
              {/* Points */}
              {[[70,110],[110,110],[140,108],[180,107],[220,106],[250,109],[290,110],[330,111],[360,107],[400,105],[430,103],[450,95],[480,75],[500,65],[510,55],[530,50],[545,47],[555,55],[570,70],[585,85],[600,100],[620,107]].filter((_,i) => i % 3 === 0).map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r={i === 5 ? 3.5 : 2} fill={i === 5 ? "#4A7FB5" : "#2B3A67"} />
              ))}
            </svg>
          </div>
        </FadeIn>
      </section>

      {/* ─── STATS ────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center px-5 md:px-16 py-24">
        <FadeIn>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7A756E", marginBottom: "1rem" }}>
            At a glance
          </p>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", lineHeight: 1.15, marginBottom: "2.5rem", color: "#1C1B1A" }}>
            Your numbers, quietly explained.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Speed", value: "38", unit: "wpm", color: "#2B3A67" },
            { label: "Pauses", value: "11.2", unit: "%", color: "#1A7A6D" },
            { label: "Corrections", value: "7.8", unit: "%", color: "#C17B3A" },
            { label: "Keystroke gap", value: "612", unit: "ms", color: "#7B6FA0" },
            { label: "Deviation", value: "1.42", unit: "", color: "#B5533C" },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08}>
              <div className="rounded-2xl p-5" style={{ background: "#FAF7F2", border: "1px solid #E5E0D8" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "0.75rem" }}>
                  {s.label}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.5rem", fontWeight: 400, color: s.color, lineHeight: 1.2 }}>
                  {s.value}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 300, color: "#B0AAA2", marginLeft: "0.25rem" }}>{s.unit}</span>
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── INSIGHT ──────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center px-5 md:px-16 py-24" style={{ background: "#FAF7F2" }}>
        <FadeIn>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7A756E", marginBottom: "1rem" }}>
            This week
          </p>
          <div className="rounded-2xl p-6 md:p-8 mb-6" style={{ background: "#FAF7F2", borderLeft: "3px solid #2B3A67", border: "1px solid #E5E0D8", borderLeftWidth: "3px", borderLeftColor: "#2B3A67" }}>
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(1rem, 2vw, 1.25rem)", lineHeight: 1.65, color: "#1C1B1A" }}>
              "Your rhythm was a little more hesitant this week — more pauses, slightly slower. Sometimes that means your mind was somewhere else. A walk might help."
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="rounded-2xl p-6 md:p-8" style={{ background: "#F6F3EE", border: "1px solid #E5E0D8" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "0.75rem" }}>
              Try this
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "#7A756E", lineHeight: 1.7 }}>
              Notice when your pauses spike — is it a particular time of day? Try writing 20 minutes earlier tomorrow and see if it feels different.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ─── PRIVACY ──────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center px-5 md:px-16 py-24">
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            <div>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(2rem, 4.5vw, 3.25rem)", lineHeight: 1.1, background: "linear-gradient(135deg, #1C1B1A, #2B3A67)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "0.5rem" }}>
                We read your rhythm.
              </p>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(2rem, 4.5vw, 3.25rem)", lineHeight: 1.1, color: "#E5E0D8" }}>
                Not your words.
              </p>
            </div>
            <div className="pt-2">
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "clamp(0.85rem, 1.2vw, 0.95rem)", color: "#3D3A36", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Bhaav observes typing behavior — timing between keystrokes, frequency of pauses, correction patterns — to build a personal behavioral baseline.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "clamp(0.85rem, 1.2vw, 0.95rem)", color: "#7A756E", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Your actual writing never leaves your device for analysis. The system understands <em>how</em> you type, not <em>what</em> you type.
              </p>
              <div className="rounded-xl p-4" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", background: "linear-gradient(135deg, rgba(43,58,103,0.03), rgba(26,122,109,0.03))", border: "1px solid rgba(43,58,103,0.08)", lineHeight: 1.8, color: "#7A756E" }}>
                This is a self-awareness tool, not a clinical diagnostic. Deviation scores reflect change from your own baseline — never a judgment.
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <footer className="px-5 md:px-16 text-center py-12" style={{ background: "#FAF7F2" }}>
        <div className="h-px w-full mb-8 max-w-4xl mx-auto" style={{ background: "linear-gradient(90deg, transparent, rgba(43,58,103,0.06), transparent)" }} />
        <p style={{ fontSize: "0.7rem", color: "#B0AAA2", fontFamily: "'Inter', sans-serif", marginBottom: "0.5rem" }}>
          Questions?{" "}
          <a href="mailto:hello@bhaav.app" style={{ color: "#2B3A67", textDecoration: "none", borderBottom: "1px solid rgba(43,58,103,0.2)" }}>hello@bhaav.app</a>
        </p>
        <p style={{ fontSize: "0.6rem", color: "#D5D0C8", fontFamily: "'JetBrains Mono', monospace" }}>
          © 2026 Bhaav — a hackathon project. Typing behavior only. Never your words.
        </p>
      </footer>
    </motion.div>
  );
}
