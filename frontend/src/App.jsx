import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import "./App.css";

import Dashboard from "./Dashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import RoomEntry from "./RoomEntry.jsx";
import MoodRoom from "./MoodRoom.jsx";
import RoomJournal from "./RoomJournal.jsx";
import useGameStore from "./gameStore.js";
import { createUser, submitSession, getAnalysis, getInsight, getCampusPulse } from "./api.js";

// ========================================
// WebGL DETECTION
// ========================================
function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

function App() {
  // =========================================
  // GAME STATE
  // =========================================
  const [page, setPage] = useState("entry");
  const setGameState = useGameStore((s) => s.setGameState);
  const setSessionCount = useGameStore((s) => s.setSessionCount);
  const setAnalysis = useGameStore((s) => s.setAnalysis);
  const setInsight = useGameStore((s) => s.setInsight);
  const setCampusData = useGameStore((s) => s.setCampusData);
  const setSessions = useGameStore((s) => s.setSessions);

  // =========================================
  // SESSION STATE
  // =========================================
  const [text, setText] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [message, setMessage] = useState("");
  const [intervention, setIntervention] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [savingSession, setSavingSession] = useState(false);

  const sessionStart = useRef(null);
  const keystrokes = useRef([]);
  const liveMetricsRef = useRef({ typingSpeed: 0, pauseDuration: 0, backspaceRate: 0, activityLevel: 0 });

  // =========================================
  // WEBGL CHECK
  // =========================================
  const [hasWebGL] = useState(() => detectWebGL());

  // =========================================
  // USER INIT + DATA FETCH
  // =========================================
  useEffect(() => {
    async function init() {
      let userId = localStorage.getItem("bhaav_user_id");
      if (!userId) {
        try {
          const data = await createUser();
          if (data.user_id) {
            localStorage.setItem("bhaav_user_id", data.user_id);
            userId = data.user_id;
          }
        } catch (e) {
          console.error("User creation failed:", e.message);
        }
      }

      if (userId) {
        const [analysisRes, insightRes, campusRes] = await Promise.allSettled([
          getAnalysis(userId),
          getInsight(userId),
          getCampusPulse(),
        ]);

        if (analysisRes.status === "fulfilled") {
          setAnalysis(analysisRes.value);
          setSessions(analysisRes.value.sessions || []);
          setSessionCount(analysisRes.value.session_count || 0);
        }
        if (insightRes.status === "fulfilled") setInsight(insightRes.value);
        if (campusRes.status === "fulfilled") setCampusData(campusRes.value);
      }
    }
    init();
  }, []);

  // =========================================
  // START SESSION
  // =========================================
  const startSession = useCallback(async () => {
    let userId = localStorage.getItem("bhaav_user_id");
    if (!userId) {
      try {
        const data = await createUser();
        if (data.user_id) {
          localStorage.setItem("bhaav_user_id", data.user_id);
          userId = data.user_id;
        }
      } catch (e) { console.error("User creation failed:", e.message); }
    }
    if (!userId) return;

    sessionStart.current = Date.now();
    keystrokes.current = [];
    setText("");
    setIsSessionActive(true);
    setMessage("");
    setPage("journal");
    setGameState("journal");
  }, [setGameState]);

  // =========================================
  // RECORD KEYSTROKE
  // =========================================
  const recordKeystroke = useCallback((event) => {
    if (!isSessionActive) return;

    let keyType = "char";
    if (event.key === "Backspace") keyType = "backspace";
    else if (event.key === " ") keyType = "space";
    else if (event.key === "Enter") keyType = "enter";

    keystrokes.current.push({ key_type: keyType, timestamp_ms: Date.now() });

    // Update live metrics
    const now = Date.now();
    const elapsed = (now - (sessionStart.current || now)) / 1000;
    if (elapsed > 0) {
      const events = keystrokes.current;
      const charCount = events.filter(e => e.key_type === "char" || e.key_type === "space").length;
      const backspaces = events.filter(e => e.key_type === "backspace").length;
      liveMetricsRef.current = {
        typingSpeed: charCount / 5 / (elapsed / 60),
        pauseDuration: 0,
        backspaceRate: events.length > 0 ? backspaces / events.length : 0,
        activityLevel: Math.min(1, charCount / 50),
      };
    }
  }, [isSessionActive]);

  // =========================================
  // END SESSION
  // =========================================
  const endSession = useCallback(async () => {
    if (!isSessionActive || savingSession) return;
    const endTs = Date.now();
    const userId = localStorage.getItem("bhaav_user_id");
    if (!userId || !sessionStart.current) return;

    setSavingSession(true);
    setMessage("Observing your rhythm...");

    try {
      const events = [...keystrokes.current];
      const data = await submitSession({
        user_id: userId,
        start_ts: sessionStart.current,
        end_ts: endTs,
        keystroke_events: events,
      });

      if (data.intervention) setIntervention(data.intervention);
      else setIntervention(null);

      setIsSessionActive(false);
      setSavingSession(false);
      sessionStart.current = null;
      keystrokes.current = [];
      liveMetricsRef.current = { typingSpeed: 0, pauseDuration: 0, backspaceRate: 0, activityLevel: 0 };

      setRefreshKey(v => v + 1);

      // Refresh data
      const [analysisRes, insightRes] = await Promise.allSettled([
        getAnalysis(userId),
        getInsight(userId),
      ]);
      if (analysisRes.status === "fulfilled") {
        setAnalysis(analysisRes.value);
        setSessions(analysisRes.value.sessions || []);
        setSessionCount(analysisRes.value.session_count || 0);
      }
      if (insightRes.status === "fulfilled") setInsight(insightRes.value);

      setPage("room");
      setGameState("world");
    } catch (error) {
      console.error("Session error:", error);
      setSavingSession(false);
      setMessage("Could not save. Please try again.");
    }
  }, [isSessionActive, savingSession, setGameState, setAnalysis, setSessions, setSessionCount, setInsight, setIntervention]);

  // =========================================
  // NAVIGATION
  // =========================================
  const goWorld = useCallback(() => { setPage("room"); setGameState("world"); }, [setGameState]);
  const goDashboard = useCallback(() => { setPage("dashboard"); setGameState("admin"); }, [setGameState]);
  const goAdmin = useCallback(() => { setPage("admin"); setGameState("admin"); }, [setGameState]);

  // =========================================
  // WebGL FALLBACK
  // =========================================
  if (!hasWebGL) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: "'Cormorant Garamond', serif",
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 300, marginBottom: '24px' }}>Bhaav</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
          This experience needs WebGL to enter the room.
        </p>
        <button onClick={goDashboard} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.6)', padding: '12px 24px', cursor: 'pointer',
          fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          Continue without 3D
        </button>
      </div>
    );
  }

  // =========================================
  // RENDER
  // =========================================
  if (page === "entry") {
    return <RoomEntry onBegin={() => { setPage("room"); setGameState("world"); }} />;
  }

  if (page === "room") {
    return (
      <MoodRoom
        onWrite={startSession}
        onDashboard={goDashboard}
        onAnalysis={goDashboard}
        onReflection={goDashboard}
        onSupport={goDashboard}
      />
    );
  }

  if (page === "journal") {
    return (
      <RoomJournal
        text={text}
        setText={setText}
        onKeyDown={recordKeystroke}
        onEnd={endSession}
        savingSession={savingSession}
        message={message}
        liveMetrics={liveMetricsRef.current}
      />
    );
  }

  if (page === "admin") {
    return <AdminDashboard onExit={goDashboard} />;
  }

  return (
    <Dashboard
      key={refreshKey}
      onWrite={startSession}
      onAdmin={goAdmin}
      intervention={intervention}
      onBackToRoom={goWorld}
    />
  );
}

export default App;
