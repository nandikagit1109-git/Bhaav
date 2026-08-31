import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // ========================================
  // GAME STATE MACHINE
  // "entry" | "world" | "journal" | "analysis" | "reflection" | "support" | "campus" | "admin" | "paused"
  // ========================================
  gameState: 'entry',
  setGameState: (gameState) => set({ gameState }),

  // ========================================
  // MOOD STATE (derived from Z-score)
  // ========================================
  combinedZ: null,
  deviationLevel: 'learning',
  setMoodState: (combinedZ, deviationLevel) =>
    set({ combinedZ, deviationLevel }),

  // ========================================
  // ROOM PROPERTIES (derived from mood)
  // ========================================
  roomState: {
    lightingIntensity: 0.3,
    ambientColor: '#1a1a2e',
    fogDensity: 0.08,
    clutterLevel: 0,
    roomWarmth: 0.3,
  },
  setRoomState: (roomState) => set({ roomState }),

  // ========================================
  // INTERACTION
  // ========================================
  hoveredObject: null,
  setHoveredObject: (obj) => set({ hoveredObject: obj }),

  // ========================================
  // SESSION STATE
  // ========================================
  sessionActive: false,
  setSessionActive: (active) => set({ sessionActive: active }),
  sessionCount: 0,
  setSessionCount: (count) => set({ sessionCount: count }),

  // ========================================
  // LIVE TYPING METRICS (during session)
  // ========================================
  liveMetrics: {
    typingSpeed: 0,
    pauseDuration: 0,
    pauseFrequency: 0,
    backspaceRate: 0,
    activityLevel: 0,
  },
  setLiveMetrics: (metrics) => set({ liveMetrics: metrics }),

  // ========================================
  // DATA
  // ========================================
  analysis: null,
  setAnalysis: (analysis) => set({ analysis }),
  insight: null,
  setInsight: (insight) => set({ insight }),
  campusData: null,
  setCampusData: (campusData) => set({ campusData }),
  sessions: [],
  setSessions: (sessions) => set({ sessions }),

  // ========================================
  // SETTINGS
  // ========================================
  soundEnabled: false,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  reducedMotion: false,
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  mouseSensitivity: 0.002,
  setMouseSensitivity: (sensitivity) => set({ mouseSensitivity: sensitivity }),
}));

export default useGameStore;
