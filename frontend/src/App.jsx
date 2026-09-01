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
  const setSessionActive = useGameStore((s) => s.setSessionActive);
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
  const keystrokeCounters = useRef({ charCount: 0, backspaceCount: 0, totalCount: 0 });

  // =========================================
  // WEBGL CHECK
  // =========================================
  const [hasWebGL] = useState(() => detectWebGL());

  // =========================================
  // USER INIT + DATA FETCH
  // =========================================
  // Handles fresh backend deployments (e.g. Render) where the old
  // localStorage user ID no longer exists in the database.
  useEffect(() => {
    async function init() {
      let userId = localStorage.getItem("bhaav_user_id");

      // If we have a stored user, verify it exists on the backend
      if (userId) {
        try {
          const analysisRes = await getAnalysis(userId);
          setAnalysis(analysisRes);
          setSessions(analysisRes.sessions || []);
          setSessionCount(analysisRes.session_count || 0);
        } catch (e) {
          // User not found on backend — clear stale ID and create new
          if (e.message && e.message.includes("not found")) {
            localStorage.removeItem("bhaav_user_id");
            userId = null;
          }
        }
      }

      // No valid user — create one
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

      // Fetch remaining data if we have a valid user
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
    keystrokeCounters.current = { charCount: 0, backspaceCount: 0, totalCount: 0 };
    setText("");
    setIsSessionActive(true);
    setSessionActive(true);
    setMessage("");
    setPage("journal");
    setGameState("journal");
  }, [setGameState, setSessionActive]);

  // =========================================
  // RECORD KEYSTROKE
  // =========================================
  // PERFORMANCE: Uses O(1) running counters instead of Array.filter()
  // on every keystroke. The old code iterated the entire events array
  // twice per keystroke — O(n) per keystroke, causing increasing lag.
  const recordKeystroke = useCallback((event) => {
    if (!isSessionActive) return;

    let keyType = "char";
    if (event.key === "Backspace") keyType = "backspace";
    else if (event.key === " ") keyType = "space";
    else if (event.key === "Enter") keyType = "enter";

    keystrokes.current.push({ key_type: keyType, timestamp_ms: Date.now() });

    // O(1) counter updates instead of O(n) Array.filter
    const counters = keystrokeCounters.current;
    counters.totalCount++;
    if (keyType === "char" || keyType === "space") counters.charCount++;
    if (keyType === "backspace") counters.backspaceCount++;

    // Update live metrics — O(1) computation
    const now = Date.now();
    const elapsed = (now - (sessionStart.current || now)) / 1000;
    if (elapsed > 0) {
      liveMetricsRef.current = {
        typingSpeed: counters.charCount / 5 / (elapsed / 60),
        pauseDuration: 0,
        backspaceRate: counters.totalCount > 0 ? counters.backspaceCount / counters.totalCount : 0,
        activityLevel: Math.min(1, counters.charCount / 50),
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

    // Capture refs before clearing
    const savedStart = sessionStart.current;
    const savedEvents = [...keystrokes.current];

    // Reset session state immediately
    setIsSessionActive(false);
    setSessionActive(false);
    sessionStart.current = null;
    keystrokes.current = [];
    keystrokeCounters.current = { charCount: 0, backspaceCount: 0, totalCount: 0 };
    liveMetricsRef.current = { typingSpeed: 0, pauseDuration: 0, backspaceRate: 0, activityLevel: 0 };

    // Navigate to room immediately — don't block on save
    setPage("room");
    setGameState("world");

    // Save session in background (non-blocking)
    try {
      const data = await submitSession({
        user_id: userId,
        start_ts: savedStart,
        end_ts: endTs,
        keystroke_events: savedEvents,
      });

      if (data.intervention) setIntervention(data.intervention);
      else setIntervention(null);

      setRefreshKey(v => v + 1);

      // Refresh data in background — fire and forget
      Promise.allSettled([
        getAnalysis(userId),
        getInsight(userId),
      ]).then(([analysisRes, insightRes]) => {
        if (analysisRes.status === "fulfilled") {
          setAnalysis(analysisRes.value);
          setSessions(analysisRes.value.sessions || []);
          setSessionCount(analysisRes.value.session_count || 0);
        }
        if (insightRes.status === "fulfilled") setInsight(insightRes.value);
      }).catch(() => {});

    } catch (error) {
      console.error("Session save error:", error);
      // Still show message but user is already in the room
      setMessage("Session could not be saved.");
    }
  }, [isSessionActive, savingSession, setGameState, setSessionActive, setAnalysis, setSessions, setSessionCount, setInsight, setIntervention]);

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
