import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { getSessions, getInsight, dismiss } from "../services/api";
import TrendChart from "./TrendChart";
import WeatherDisplay from "./WeatherDisplay";
import DeviationDisplay from "./DeviationDisplay";
import Insight from "./Insight";
import MicroIntervention from "./MicroIntervention";
import ReachOut from "./ReachOut";
import Privacy from "./Privacy";

/**
 * Dashboard — Everything you need to see, in one scroll.
 * Warm editorial layout with scroll-triggered reveals.
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
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.8s cubic-bezier(0.25,0.1,0.25,1) ${delay}s, transform 0.8s cubic-bezier(0.25,0.1,0.25,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function Dashboard({ userId, sessionData, deviation, supportLevel, onCompanion, onSettings, onHome }) {
  const [sessions, setSessions] = useState([]);
  const [insight, setInsight] = useState(null);
  const [microIntervention, setMicroIntervention] = useState(false);
  const [reachOut, setReachOut] = useState(null);

  useEffect(() => {
    getSessions(userId).then((r) => setSessions(r.sessions || [])).catch(() => {});
    getInsight(userId).then((r) => setInsight(r)).catch(() => {});
    if (sessionData?.micro_intervention) setMicroIntervention(true);
    if (sessionData?.reach_out && sessionData?.contact) {
      setReachOut(sessionData.contact);
    }
  }, [userId, sessionData]);

  const handleDismissMicro = async () => {
    setMicroIntervention(false);
    try { await dismiss(userId, "micro_intervention"); } catch {}
  };

  const handleDismissReachOut = async () => {
    setReachOut(null);
    try { await dismiss(userId, "reach_out"); } catch {}
  };

  const weather = deviation ? getWeather(deviation.combined_score) : null;

  return (
    <motion.div
      className="min-h-screen"
      style={{ background: "#F6F3EE" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ─── HEADER ──────────────────────────────────── */}
      <header className="px-5 md:px-16 pt-12 pb-6 flex items-center justify-between">
        <button onClick={onHome} className="cursor-pointer" style={{ background: "none", border: "none", padding: 0 }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "1.2rem", background: "linear-gradient(135deg, #2B3A67, #1A7A6D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Bhaav
          </span>
        </button>
        <div className="flex gap-4">
          {supportLevel >= 4 && (
            <button onClick={onCompanion} className="cursor-pointer" style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7A756E" }}>
              Companion
            </button>
          )}
          <button onClick={onSettings} className="cursor-pointer" style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7A756E" }}>
            Settings
          </button>
        </div>
      </header>

      {/* ─── INTRO ───────────────────────────────────── */}
      <section className="px-5 md:px-16 pb-16">
        <FadeIn>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "1rem" }}>
            Your pattern
          </p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1, color: "#1C1B1A", marginBottom: "0.5rem" }}>
            {getOpeningLine()}
          </h1>
        </FadeIn>
      </section>

      {/* ─── WEATHER ─────────────────────────────────── */}
      {weather && (
        <section className="px-5 md:px-16 pb-12">
          <FadeIn>
            <WeatherDisplay weather={weather} deviation={deviation?.combined_score} />
          </FadeIn>
        </section>
      )}

      {/* ─── TREND CHART ─────────────────────────────── */}
      {sessions.length > 0 && (
        <section className="px-5 md:px-16 pb-12" style={{ background: "#FAF7F2", padding: "3rem 1.25rem" }}>
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B0AAA2", marginBottom: "1.5rem" }}>
                Deviation trend
              </p>
              <TrendChart sessions={sessions} />
            </div>
          </FadeIn>
        </section>
      )}

      {/* ─── DEVIATION ───────────────────────────────── */}
      {deviation && (
        <section className="px-5 md:px-16 py-12">
          <FadeIn>
            <DeviationDisplay deviation={deviation} />
          </FadeIn>
        </section>
      )}

      {/* ─── INSIGHT ─────────────────────────────────── */}
      {insight && (
        <section className="px-5 md:px-16 py-12" style={{ background: "#FAF7F2", padding: "3rem 1.25rem" }}>
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <Insight insight={insight} supportLevel={supportLevel} />
            </FadeIn>
          </div>
        </section>
      )}

      {/* ─── MICRO-INTERVENTION ──────────────────────── */}
      {microIntervention && supportLevel >= 2 && (
        <section className="px-5 md:px-16 py-8">
          <MicroIntervention onDismiss={handleDismissMicro} />
        </section>
      )}

      {/* ─── REACH OUT ───────────────────────────────── */}
      {reachOut && supportLevel >= 3 && (
        <section className="px-5 md:px-16 py-8">
          <ReachOut contact={reachOut} onDismiss={handleDismissReachOut} />
        </section>
      )}

      {/* ─── PRIVACY ─────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 md:px-16">
          <Privacy />
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────── */}
      <footer className="px-5 md:px-16 text-center py-10" style={{ background: "#FAF7F2" }}>
        <div className="h-px w-full mb-6 max-w-4xl mx-auto" style={{ background: "linear-gradient(90deg, transparent, rgba(43,58,103,0.06), transparent)" }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#B0AAA2" }}>
          Bhaav is a companion for self-awareness — not a therapist, counselor, or medical professional.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.7rem", color: "#D5D0C8", marginTop: "0.5rem" }}>
          If you're struggling, please also talk to a real person who cares about you.
        </p>
      </footer>
    </motion.div>
  );
}

function getWeather(score) {
  if (score < 0.5) return "calm";
  if (score < 1.0) return "breezy";
  if (score < 1.5) return "overcast";
  if (score < 2.0) return "rainy";
  return "stormy";
}

function getOpeningLine() {
  const lines = [
    "Here's what your hands have been saying.",
    "Your rhythm this week, quietly observed.",
    "Something shifted — here's what we noticed.",
    "A gentle look at your typing pattern.",
    "Your hands tell a story. Here's a page.",
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}
