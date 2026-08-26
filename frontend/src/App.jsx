import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { getPreferences } from "./services/api";
import Intro from "./components/Intro";
import Onboarding from "./components/Onboarding";
import Journal from "./components/Journal";
import AnalysisTransition from "./components/AnalysisTransition";
import Dashboard from "./components/Dashboard";
import Companion from "./components/Companion";
import Settings from "./components/Settings";

const USER_ID = "demo-user";

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [prefs, setPrefs] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [insightData, setInsightData] = useState(null);
  const [deviation, setDeviation] = useState(null);

  useEffect(() => {
    getPreferences(USER_ID)
      .then((p) => {
        setPrefs(p);
        if (p.onboarding_complete) {
          setScreen("intro");
        } else {
          setScreen("onboarding");
        }
      })
      .catch(() => {
        setScreen("intro");
      });
  }, []);

  const handleOnboardingDone = (level) => {
    setPrefs((prev) => ({ ...prev, support_level: level, onboarding_complete: true }));
    setScreen("intro");
  };

  const handleBegin = () => setScreen("journal");

  const handleJournalDone = (data) => {
    setSessionData(data);
    if (data?.deviation) setDeviation(data.deviation);
    setScreen("analysis");
  };

  const handleAnalysisDone = () => setScreen("dashboard");

  const renderScreen = () => {
    switch (screen) {
      case "onboarding":
        return <Onboarding onComplete={handleOnboardingDone} />;
      case "intro":
        return <Intro onBegin={handleBegin} />;
      case "journal":
        return <Journal userId={USER_ID} onDone={handleJournalDone} />;
      case "analysis":
        return <AnalysisTransition onComplete={handleAnalysisDone} />;
      case "dashboard":
        return (
          <Dashboard
            userId={USER_ID}
            sessionData={sessionData}
            deviation={deviation}
            supportLevel={prefs?.support_level || 1}
            onCompanion={() => setScreen("companion")}
            onSettings={() => setScreen("settings")}
            onHome={() => setScreen("intro")}
          />
        );
      case "companion":
        return <Companion userId={USER_ID} onBack={() => setScreen("dashboard")} />;
      case "settings":
        return (
          <Settings
            userId={USER_ID}
            supportLevel={prefs?.support_level || 1}
            onBack={() => setScreen("dashboard")}
            onUpdated={(newPrefs) => setPrefs((prev) => ({ ...prev, ...newPrefs }))}
          />
        );
      default:
        return <Intro onBegin={handleBegin} />;
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}
